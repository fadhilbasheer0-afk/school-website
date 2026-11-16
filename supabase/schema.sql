-- =============================================================================
-- Irshad Academy — Supabase Schema
-- =============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard → SQL → New query).
-- It creates every table, constraint, index, trigger and Row Level Security
-- (RLS) policy needed by the site. It is safe to re-run (uses IF NOT EXISTS /
-- CREATE OR REPLACE where possible).
--
-- Multi-school model: every school-owned record carries a `school_id` foreign
-- key to `schools(id)` so the same schema can serve multiple schools later.
--
-- Auth: Supabase Auth is the identity provider. Passwords are never stored in
-- application tables — they live in `auth.users` managed by Supabase. The
-- service-role key is NEVER used by the browser and must never be prefixed
-- with `NEXT_PUBLIC_` in environment files.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- Returns true when the authenticated user has an active admin (or owner) role.
-- SECURITY DEFINER lets the policy check read the profiles table without
-- triggering recursive RLS. PL/pgSQL (not plain SQL) so the body is only
-- validated when first called — after `profiles` has been created.
create or replace function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result boolean;
begin
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin')
      and is_active = true
  ) into result;
  return result;
end;
$$;

-- Returns the school_id of the authenticated user (NULL for anonymous users).
create or replace function public.current_school_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result uuid;
begin
  select school_id into result
  from public.profiles
  where id = auth.uid();
  return result;
end;
$$;

-- Keeps `updated_at` in sync on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Creates a profile row automatically when a new auth user signs up.
-- IMPORTANT: the role is ALWAYS forced to 'viewer' and is never read from
-- client-supplied signup metadata (which would allow self-service admin
-- escalation). Admins are promoted only by an existing admin (or by an
-- operator running SQL as the table owner, which bypasses RLS).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, school_id, email, full_name, role, is_active)
  values (
    new.id,
    public.default_school_id(),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'viewer',
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Guards the security-sensitive profile columns. No user may change their OWN
-- role, school_id, email, or is_active — including admins (self-promotion is
-- blocked). Admins promote/manage other users' rows, and operators use SQL.
create or replace function public.prevent_self_profile_tampering()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and new.id = auth.uid()
     and (
       new.role is distinct from old.role
       or new.school_id is distinct from old.school_id
       or new.email is distinct from old.email
       or new.is_active is distinct from old.is_active
     )
  then
    raise exception 'Only an administrator can change role, school, email, or active status.';
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- schools (parent table that all other records reference via school_id)
-- ---------------------------------------------------------------------------
create table if not exists public.schools (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  motto           text,
  established_year integer check (established_year > 1800 and established_year <= date_part('year', now())),
  address         text,
  phone           text,
  email           text,
  website         text,
  is_default      boolean not null default false,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.schools add column if not exists is_default boolean not null default false;

-- The single school whose PUBLISHED/ACTIVE content is visible to anonymous
-- public visitors. Kept in one place so RLS can scope public reads without
-- leaking other tenants' content.
create or replace function public.default_school_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result uuid;
begin
  select id into result
  from public.schools
  where is_default = true
  order by created_at asc, id asc
  limit 1;

  if result is null then
    select id into result
    from public.schools
    order by created_at asc, id asc
    limit 1;
  end if;

  return result;
end;
$$;

-- The school slug for the authenticated admin (used by storage path checks).
create or replace function public.current_school_slug()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result text;
begin
  select s.slug into result
  from public.schools s
  join public.profiles p on p.school_id = s.id
  where p.id = auth.uid();
  return result;
end;
$$;

alter table public.schools enable row level security;

-- Only one school can be the public default tenant at a time.
create unique index if not exists schools_one_default_idx
  on public.schools (is_default)
  where is_default = true;

drop policy if exists "Schools are publicly readable" on public.schools;
drop policy if exists "Only admins can modify schools" on public.schools;

create policy "Default school is publicly readable"
  on public.schools for select
  using (id = public.default_school_id()
         or (public.is_admin() and id = public.current_school_id()));

create policy "Only admins can modify schools"
  on public.schools for all
  to authenticated
  using (public.is_admin() and id = public.current_school_id())
  with check (public.is_admin() and id = public.current_school_id());

-- ---------------------------------------------------------------------------
-- profiles (links to auth.users, holds role + school membership)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  school_id       uuid not null references public.schools (id) on delete restrict,
  email           text not null,
  full_name       text,
  avatar_url      text,
  role            text not null default 'viewer'
                  check (role in ('owner', 'admin', 'editor', 'viewer')),
  is_active       boolean not null default true,
  last_sign_in_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (email)
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Only admins can insert profiles" on public.profiles;
drop policy if exists "Only admins can delete profiles" on public.profiles;

create policy "Users can read their own profile"
  on public.profiles for select
  using (id = auth.uid()
         or (public.is_admin() and school_id = public.current_school_id()));

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid()
         or (public.is_admin() and school_id = public.current_school_id()))
  with check (id = auth.uid()
              or (public.is_admin() and school_id = public.current_school_id()));

create policy "Only admins can insert profiles"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin() and school_id = public.current_school_id());

create policy "Only admins can delete profiles"
  on public.profiles for delete
  to authenticated
  using (public.is_admin() and school_id = public.current_school_id());

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
drop trigger if exists profiles_prevent_self_tampering on public.profiles;

create trigger profiles_prevent_self_tampering
  before update on public.profiles
  for each row execute function public.prevent_self_profile_tampering();

create index if not exists idx_profiles_school_id on public.profiles (school_id);
create index if not exists idx_profiles_role on public.profiles (role);

-- ---------------------------------------------------------------------------
-- school_settings (one row per school)
-- ---------------------------------------------------------------------------
create table if not exists public.school_settings (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null unique references public.schools (id) on delete cascade,
  school_name     text,
  tagline         text,
  logo_url        text,
  favicon_url     text,
  primary_color   text,
  secondary_color text,
  contact_email   text,
  contact_phone   text,
  contact_address text,
  website_url     text,
  map_url         text,
  coordinates     text,
  footer_about    text,
  footer_copyright text,
  office_hours    jsonb not null default '[]'::jsonb,
  social_links    jsonb not null default '{}'::jsonb,
  contact_form    jsonb not null default '{"enabled": true, "recipient_email": null, "subject_prefix": null}'::jsonb,
  seo_title       text,
  seo_description text,
  og_image_url    text,
  currency        text not null default 'USD',
  timezone        text not null default 'UTC',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.school_settings enable row level security;

drop policy if exists "Settings are publicly readable" on public.school_settings;
drop policy if exists "Only admins can modify settings" on public.school_settings;

create policy "Settings are publicly readable"
  on public.school_settings for select
  using (school_id = public.default_school_id()
         or (public.is_admin() and school_id = public.current_school_id()));

create policy "Only admins can modify settings"
  on public.school_settings for all
  to authenticated
  using (public.is_admin() and school_id = public.current_school_id())
  with check (public.is_admin() and school_id = public.current_school_id());

drop trigger if exists school_settings_updated_at on public.school_settings;
create trigger school_settings_updated_at
  before update on public.school_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Generic content tables
-- ---------------------------------------------------------------------------
-- Each table below follows the same shape: school_id + content + ordering +
-- soft-availability flag. Public reads are allowed for active rows; writes are
-- restricted to admins.

create table if not exists public.home_content (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  section_key text not null,
  title       text,
  subtitle    text,
  body        text,
  image_url   text,
  cta_label   text,
  cta_url     text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, section_key)
);

create table if not exists public.home_hero_slides (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  title       text not null,
  subtitle    text,
  image_url   text,
  cta_label   text,
  cta_url     text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.about_content (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  section_key text not null,
  title       text,
  body        text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, section_key)
);

create table if not exists public.academic_content (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  slug        text not null,
  title       text not null,
  summary     text,
  body        text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, slug)
);

create table if not exists public.academic_classes (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  level       text not null check (level in ('Early Years', 'Primary', 'Middle', 'High')),
  grade_label text not null,
  age_range   text,
  description text,
  subjects    jsonb not null default '[]'::jsonb,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, grade_label)
);

create table if not exists public.academic_departments (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, slug)
);

create table if not exists public.teachers (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools (id) on delete cascade,
  profile_id     uuid references public.profiles (id) on delete set null,
  department_id  uuid references public.academic_departments (id) on delete set null,
  name           text not null,
  title          text,
  bio            text,
  image_url      text,
  email          text,
  phone          text,
  qualifications text,
  sort_order     integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.facilities (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  features    jsonb not null default '[]'::jsonb,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, slug)
);

create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  name        text not null,
  slug        text not null,
  category    text,
  description text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, slug)
);

create table if not exists public.achievements (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  title       text not null,
  category    text,
  description text,
  achieved_at date,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.gallery_albums (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools (id) on delete cascade,
  title           text not null,
  slug            text not null,
  description     text,
  cover_image_url text,
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, slug)
);

create table if not exists public.gallery_photos (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  album_id    uuid references public.gallery_albums (id) on delete cascade,
  title       text,
  description text,
  image_url   text,
  storage_path text,
  alt_text    text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Announcements & events (publicly readable only when published)
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id             uuid primary key default gen_random_uuid(),
  school_id      uuid not null references public.schools (id) on delete cascade,
  title          text not null,
  slug           text not null,
  category       text,
  summary        text,
  content        text,
  author         text,
  image_url      text,
  attachment_url text,
  published_at   timestamptz,
  is_featured    boolean not null default false,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (school_id, slug)
);

create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools (id) on delete cascade,
  title           text not null,
  slug            text not null,
  category        text,
  description     text,
  start_date      date not null,
  start_time      time,
  end_time        time,
  venue           text,
  image_url       text,
  registration_url text,
  contact_email   text,
  is_featured     boolean not null default false,
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, slug)
);

-- ---------------------------------------------------------------------------
-- Admissions (content sections) & contact information
-- ---------------------------------------------------------------------------
create table if not exists public.admissions (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  section_key text not null,
  title       text not null,
  body        text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (school_id, section_key)
);

create table if not exists public.contact_information (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  label      text not null,
  type       text not null
             constraint contact_information_type_check
             check (type in ('address', 'phone', 'email', 'hours', 'website', 'map', 'coordinates', 'social', 'form', 'other')),
  value      text not null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Navigation items (header menus + footer link columns), editable per school.
-- ---------------------------------------------------------------------------
create table if not exists public.nav_items (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  section    text not null default 'main'
             check (section in ('main', 'quick', 'footer')),
  label      text not null,
  href       text not null,
  parent_id  uuid references public.nav_items (id) on delete cascade,
  is_new_tab boolean not null default false,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- About page: history milestones timeline + management team members.
-- ---------------------------------------------------------------------------
create table if not exists public.about_milestones (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  year        text not null,
  title       text not null,
  description text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.about_management (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  name        text not null,
  role        text,
  bio         text,
  image_url   text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admissions fee schedule.
-- ---------------------------------------------------------------------------
create table if not exists public.admission_fees (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  level       text not null,
  amount      text not null,
  description text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contact / admissions inquiry messages submitted through the public forms.
-- Anonymous visitors may INSERT into the default school's inbox; only admins
-- of that school can read, mark read, or delete. Never publicly readable.
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  school_id  uuid not null references public.schools (id) on delete cascade,
  form_type  text not null default 'contact'
             check (form_type in ('contact', 'inquiry')),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CMS additions (statistics, academic calendar, documents)
-- ---------------------------------------------------------------------------
create table if not exists public.home_statistics (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  label       text not null,
  value       text not null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.academic_calendar (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  title       text not null,
  description text,
  start_date  date,
  end_date    date,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools (id) on delete cascade,
  title       text not null,
  description text,
  file_url    text,
  category    text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS policies for content tables
-- ---------------------------------------------------------------------------

-- Public read for the DEFAULT school's active content; school-scoped admin
-- write for everything. Every policy is idempotent (drop-then-create) so the
-- whole script can be re-run safely.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'home_content',
    'home_hero_slides',
    'home_statistics',
    'about_content',
    'about_milestones',
    'about_management',
    'academic_content',
    'academic_classes',
    'academic_departments',
    'academic_calendar',
    'documents',
    'facilities',
    'activities',
    'achievements',
    'gallery_albums',
    'gallery_photos',
    'admissions',
    'admission_fees',
    'contact_information',
    'nav_items'
  ] loop
    execute format('alter table public.%I enable row level security', tbl);

    execute format('drop policy if exists "Public read" on public.%I', tbl);
    execute format('drop policy if exists "Admin write" on public.%I', tbl);

    execute format(
      'create policy "Public read" on public.%I for select using (
         (public.is_admin() and school_id = public.current_school_id())
         or (school_id = public.default_school_id() and is_active = true)
       )',
      tbl
    );

    execute format(
      'create policy "Admin write" on public.%I for all to authenticated
       using (public.is_admin() and school_id = public.current_school_id())
       with check (public.is_admin() and school_id = public.current_school_id())',
      tbl
    );

    execute format('drop trigger if exists %I_updated_at on public.%I', tbl, tbl);
    execute format('create trigger %I_updated_at before update on public.%I
      for each row execute function public.set_updated_at()', tbl, tbl);

    execute format('create index if not exists idx_%I_school_id on public.%I (school_id)', tbl, tbl);
  end loop;
end $$;

-- teachers: publicly visible (default school, active); school-scoped admin write.
alter table public.teachers enable row level security;
drop policy if exists "Active teachers are publicly readable" on public.teachers;
drop policy if exists "Admin write on teachers" on public.teachers;
create policy "Active teachers are publicly readable"
  on public.teachers for select
  using (
    (public.is_admin() and school_id = public.current_school_id())
    or (school_id = public.default_school_id() and is_active = true)
  );
create policy "Admin write on teachers"
  on public.teachers for all to authenticated
  using (public.is_admin() and school_id = public.current_school_id())
  with check (public.is_admin() and school_id = public.current_school_id());
drop trigger if exists teachers_updated_at on public.teachers;
create trigger teachers_updated_at before update on public.teachers
  for each row execute function public.set_updated_at();
create index if not exists idx_teachers_school_id on public.teachers (school_id);
create index if not exists idx_teachers_department_id on public.teachers (department_id);

-- announcements: publicly readable only when published (default school); admin write.
alter table public.announcements enable row level security;
drop policy if exists "Published announcements are publicly readable" on public.announcements;
drop policy if exists "Admin write on announcements" on public.announcements;
create policy "Published announcements are publicly readable"
  on public.announcements for select
  using (
    (public.is_admin() and school_id = public.current_school_id())
    or (school_id = public.default_school_id() and is_published = true)
  );
create policy "Admin write on announcements"
  on public.announcements for all to authenticated
  using (public.is_admin() and school_id = public.current_school_id())
  with check (public.is_admin() and school_id = public.current_school_id());
drop trigger if exists announcements_updated_at on public.announcements;
create trigger announcements_updated_at before update on public.announcements
  for each row execute function public.set_updated_at();
create index if not exists idx_announcements_school_id on public.announcements (school_id);
create index if not exists idx_announcements_published on public.announcements (published_at desc);

-- events: publicly readable only when published (default school); admin write.
alter table public.events enable row level security;
drop policy if exists "Published events are publicly readable" on public.events;
drop policy if exists "Admin write on events" on public.events;
create policy "Published events are publicly readable"
  on public.events for select
  using (
    (public.is_admin() and school_id = public.current_school_id())
    or (school_id = public.default_school_id() and is_published = true)
  );
create policy "Admin write on events"
  on public.events for all to authenticated
  using (public.is_admin() and school_id = public.current_school_id())
  with check (public.is_admin() and school_id = public.current_school_id());
drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create index if not exists idx_events_school_id on public.events (school_id);
create index if not exists idx_events_start_date on public.events (start_date);

-- contact_messages: anonymous visitors may leave a message in the PUBLIC
-- school's inbox (rate-limited by the app layer). Only that school's admins
-- can read, mark read, or delete messages. Never publicly readable.
alter table public.contact_messages enable row level security;

drop policy if exists "Visitors can leave messages for the public school" on public.contact_messages;
drop policy if exists "Admins can read their school messages" on public.contact_messages;
drop policy if exists "Admins can manage their school messages" on public.contact_messages;

create policy "Visitors can leave messages for the public school"
  on public.contact_messages for insert to anon, authenticated
  with check (school_id = public.default_school_id());

create policy "Admins can read their school messages"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin() and school_id = public.current_school_id());

create policy "Admins can manage their school messages"
  on public.contact_messages for update, delete
  to authenticated
  using (public.is_admin() and school_id = public.current_school_id())
  with check (public.is_admin() and school_id = public.current_school_id());

create index if not exists idx_contact_messages_school_id on public.contact_messages (school_id);
create index if not exists idx_contact_messages_created on public.contact_messages (created_at desc);

-- FK indexes on hot join/filter paths.
create index if not exists idx_gallery_photos_album_id on public.gallery_photos (album_id);
create index if not exists idx_teachers_profile_id on public.teachers (profile_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for school media (legacy / manual uploads). Writes are
-- scoped to the admin's own school folder (`{school_id}/...`) in RLS so one
-- tenant can never overwrite another school's files. Objects in other paths
-- (no school prefix) can only be written by an operator in SQL.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('school-media', 'school-media', true)
on conflict (id) do nothing;

-- Files in school-media are publicly readable (public bucket by design).
drop policy if exists "Public read on school-media" on storage.objects;
create policy "Public read on school-media"
  on storage.objects for select
  using (bucket_id = 'school-media');

-- Only school admins may upload/update/delete in the legacy bucket, and only
-- inside their own school folder.
drop policy if exists "Authenticated upload to school-media" on storage.objects;
drop policy if exists "Authenticated update on school-media" on storage.objects;
drop policy if exists "Authenticated delete on school-media" on storage.objects;
drop policy if exists "School admins upload to school-media" on storage.objects;
drop policy if exists "School admins update school-media" on storage.objects;
drop policy if exists "School admins delete from school-media" on storage.objects;

create policy "School admins upload to school-media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'school-media'
    and public.is_admin()
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );

create policy "School admins update school-media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'school-media'
    and public.is_admin()
    and (storage.foldername(name))[1] = public.current_school_id()::text
  )
  with check (
    bucket_id = 'school-media'
    and public.is_admin()
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );

create policy "School admins delete from school-media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'school-media'
    and public.is_admin()
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );

-- ---------------------------------------------------------------------------
-- Storage bucket for school assets (structured folders for admin uploads).
-- Objects are stored as `{school_id}/{folder}/{file}` so ownership is enforced
-- in RLS by the first path segment, never by trusting client-side values.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('school-assets', 'school-assets', true)
on conflict (id) do nothing;

-- Files in school-assets are publicly readable (public bucket by design).
drop policy if exists "Public read on school-assets" on storage.objects;
create policy "Public read on school-assets"
  on storage.objects for select
  using (bucket_id = 'school-assets');

-- Uploads must come from an admin and must target the admin's OWN school
-- folder (`{current_school_id}/{folder}/{file}`). No `with check (true)`.
drop policy if exists "Authenticated upload to school-assets" on storage.objects;
drop policy if exists "Authenticated update on school-assets" on storage.objects;
drop policy if exists "Authenticated delete on school-assets" on storage.objects;

create policy "School admins upload to their own school folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'school-assets'
    and public.is_admin()
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );

create policy "School admins update their own school folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'school-assets'
    and public.is_admin()
    and (storage.foldername(name))[1] = public.current_school_id()::text
  )
  with check (
    bucket_id = 'school-assets'
    and public.is_admin()
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );

create policy "School admins delete from their own school folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'school-assets'
    and public.is_admin()
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );

-- Create the folder structure (`{default_school_id}/logo/.keep`, etc.) so the
-- folders are visible in the Storage dashboard before the first real upload.
do $$
declare
  folder text;
  school uuid := public.default_school_id();
begin
  if school is null then return; end if;
  foreach folder in array array[
    'logo', 'banners', 'teachers', 'gallery', 'facilities',
    'events', 'achievements', 'documents'
  ] loop
    begin
      insert into storage.objects (bucket_id, name, metadata)
      values (
        'school-assets',
        school || '/' || folder || '/.keep',
        '{"contentType":"text/plain","size":0}'::jsonb
      )
      on conflict (bucket_id, name) do nothing;
    exception when others then
      null;
    end;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Idempotent column additions (safe when the schema was run before the CMS
-- tables gained these columns)
-- ---------------------------------------------------------------------------
alter table public.home_content
  add column if not exists image_url text;

alter table public.academic_classes
  add column if not exists subjects jsonb not null default '[]'::jsonb;

alter table public.school_settings
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists og_image_url text;

alter table public.facilities
  add column if not exists features jsonb not null default '[]'::jsonb;

alter table public.announcements
  add column if not exists attachment_url text;

alter table public.gallery_albums
  add column if not exists storage_path text;

alter table public.gallery_photos
  add column if not exists captured_at date;

alter table public.events
  add column if not exists registration_url text,
  add column if not exists contact_email text,
  add column if not exists is_featured boolean not null default false;

alter table public.school_settings
  add column if not exists website_url text,
  add column if not exists map_url text,
  add column if not exists coordinates text,
  add column if not exists footer_about text,
  add column if not exists footer_copyright text,
  add column if not exists contact_form jsonb not null
    default '{"enabled": true, "recipient_email": null, "subject_prefix": null}'::jsonb;

alter table public.contact_information
  drop constraint if exists contact_information_type_check;

alter table public.contact_information
  add constraint contact_information_type_check
  check (type in ('address', 'phone', 'email', 'hours', 'website', 'map', 'coordinates', 'social', 'form', 'other'));

-- ---------------------------------------------------------------------------
-- Seed: default school so that newly created users have a school to attach to.
-- ---------------------------------------------------------------------------
insert into public.schools (slug, name, motto, established_year, address, phone, email, website, is_default)
values (
  'irshad',
  'Irshad International Academy',
  'Legacy of Academic Excellence',
  1995,
  '125 Academy Road, New York, NY 10024',
  '+1 (800) 555-0199',
  'info@irshadacademy.edu',
  'https://www.irshadacademy.edu',
  true
)
on conflict (slug) do nothing;

update public.schools
set is_default = true
where slug = 'irshad';

insert into public.school_settings (
  school_id, school_name, tagline, contact_email, contact_phone, contact_address,
  website_url, map_url, coordinates, footer_about, footer_copyright
)
select
  id, name, motto, email, phone, address,
  website, 'https://www.google.com/maps?q=125%20Academy%20Road%2C%20New%20York%2C%20NY%2010024&output=embed',
  '40.7128, -74.0060',
  'Irshad International Academy provides a legacy of academic excellence, personal growth, and global citizenship.',
  '© Irshad International Academy. All rights reserved.'
from public.schools
where slug = 'irshad'
on conflict (school_id) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: starter CMS content for the default school. Every block only runs when
-- the table has no rows for that school yet, so re-running the schema never
-- duplicates content. Images are stored as paths under the school-assets
-- bucket (`{school_id}/{folder}/...`) — replace them via the admin CMS.
-- ---------------------------------------------------------------------------

insert into public.home_hero_slides (school_id, title, subtitle, image_url, cta_label, cta_url, sort_order, is_active)
select s.id, v.title, v.subtitle, v.image, v.cta_label, v.cta_url, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Nurturing Minds, Inspiring Futures', 'Academic rigour, character development, and global citizenship — in one community.', null::text, 'Apply Now', '/admissions', 1),
  ('A Campus Built for Discovery', 'Purpose-built science labs, an Olympic aquatic centre, and a digital library.', null::text, 'Explore Campus', '/facilities', 2),
  ('Welcome to Irshad Academy', 'A legacy of excellence since 1995, serving 1,200+ students from 35 nationalities.', null::text, 'About Us', '/about', 3)
) as v(title, subtitle, image, cta_label, cta_url, sort_order)
where not exists (select 1 from public.home_hero_slides h where h.school_id = s.id);

insert into public.home_statistics (school_id, label, value, sort_order, is_active)
select s.id, v.label, v.value, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Years of Excellence', '25+', 1),
  ('Students Enrolled', '1,200+', 2),
  ('University Placement', '100%', 3),
  ('Student–Teacher Ratio', '15:1', 4),
  ('Nationalities', '35+', 5),
  ('Clubs & Activities', '40+', 6)
) as v(label, value, sort_order)
where not exists (select 1 from public.home_statistics st where st.school_id = s.id);

insert into public.announcements (school_id, title, slug, category, summary, content, author, published_at, is_featured, is_published)
select s.id, v.title, v.slug, v.category, v.summary, v.summary, 'Office of Communications', now() - (v.days_ago || ' days')::interval, true, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Irshad Seniors Achieve Top Ranks in National Merit Scholarship', 'national-merit-scholarship', 'Academic', 'Fifteen graduating seniors named semi-finalists in the 2026 National Merit Scholarship program.', 'Fifteen of our graduating seniors have been named semi-finalists in the 2026 National Merit Scholarship program, placing them in the top 1% nationwide.', 3),
  ('Annual Campus Science & Tech Fair — Registration Opens', 'science-tech-fair-2026', 'Science & STEM', 'Individual and team projects in environmental engineering, robotics, and software development are welcome.', 'Individual and team projects in environmental engineering, robotics, and software development are welcome. Grand prizes include college-level lab sponsorships.', 6),
  ('Eco-Ambassadors Launch Campus Biodiversity Audit', 'biodiversity-audit', 'Community', 'Our student-led environmental club begins a semester-long survey of native flora and fauna.', 'Our student-led environmental club begins a semester-long survey of native flora and fauna to inform sustainable landscaping policies.', 9)
) as v(title, slug, category, summary, content, days_ago)
where not exists (select 1 from public.announcements a where a.school_id = s.id);

insert into public.events (school_id, title, slug, category, description, start_date, start_time, end_time, venue, is_featured, is_published)
select s.id, v.title, v.slug, v.category, v.description, v.start_date, v.start_time, v.end_time, v.venue, true, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Parent–Teacher Orientation Seminar', 'parent-teacher-orientation-seminar', 'Community', 'Meet your child''s teachers and learn about the year ahead.', date '2026-08-12', time '09:00', time '12:00', 'Main Auditorium'),
  ('Annual Inter-School Sports Gala', 'annual-inter-school-sports-gala', 'Sports', 'A full day of inter-school competition across 12 sports.', date '2026-08-25', time '08:00', time '16:00', 'Sports Complex'),
  ('Autumn Music & Drama Festival', 'autumn-music-and-drama-festival', 'Arts & Culture', 'An evening of student performances across music, drama, and dance.', date '2026-09-07', time '18:30', time '21:30', 'Fine Arts Center')
) as v(title, slug, category, description, start_date, start_time, end_time, venue)
where not exists (select 1 from public.events e where e.school_id = s.id);

insert into public.facilities (school_id, name, slug, description, features, sort_order, is_active)
select s.id, v.name, v.slug, v.description, v.features::jsonb, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('STEM & Robotics Lab', 'stem-robotics-lab', '3D printers, Arduino stations, and automated workspace benches for hands-on engineering projects.', '["3D printers", "Arduino stations", "Automated benches", "Robotics kits"]', 1),
  ('Digital Library & Media Center', 'digital-library-media-center', 'Over 32,000 volumes plus high-speed computer terminals, private study cabins, and media collaboration spaces.', '["32,000+ volumes", "Research terminals", "Study cabins", "Media studios"]', 2),
  ('Olympic Aquatic Center', 'olympic-aquatic-center', 'A heated, 10-lane semi-olympic swimming pool with diving boards and safety surveillance.', '["10-lane pool", "Diving boards", "Heated water", "Safety surveillance"]', 3),
  ('Performing Arts Auditorium', 'performing-arts-auditorium', 'A 600-seat theater with professional lighting rigs, digital sound mixing, and backstage suites.', '["600 seats", "Pro lighting", "Sound mixing", "Backstage suites"]', 4)
) as v(name, slug, description, features, sort_order)
where not exists (select 1 from public.facilities f where f.school_id = s.id);

insert into public.teachers (school_id, name, title, bio, qualifications, department_id, sort_order, is_active)
select s.id, v.name, v.title, v.bio, v.qualifications, d.id, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Dr. Margaret A. Whitfield', 'Principal & Head of School', 'Educational leader focused on holistic, rigorous international education.', 'Ed.D. Educational Leadership — Columbia University', 'Leadership', 1),
  ('Mr. Jonathan K. Park', 'Head of Mathematics', 'Leads our mathematics programme from foundation to AP/IB level.', 'M.Sc. Applied Mathematics', 'Mathematics', 2),
  ('Dr. Fatima Al-Hassan', 'Head of Sciences', 'Oversees biology, chemistry, and physics across three laboratories.', 'Ph.D. Biochemistry', 'Sciences', 3),
  ('Mrs. Clara V. Montague', 'Head of Humanities & Languages', 'Directs English literature, history, and modern languages.', 'M.A. English Literature', 'Humanities & Languages', 4)
) as v(name, title, bio, qualifications, department, sort_order)
left join public.academic_departments d on d.school_id = s.id and d.name = v.department
where not exists (select 1 from public.teachers t where t.school_id = s.id);

insert into public.gallery_albums (school_id, title, slug, description, sort_order, is_active)
select s.id, v.title, v.slug, v.description, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Campus Life', 'campus-life', 'Everyday moments around the Irshad campus.', 1),
  ('Graduation Ceremony', 'graduation-ceremony', 'Highlights from this year''s graduation.', 2)
) as v(title, slug, description, sort_order)
where not exists (select 1 from public.gallery_albums g where g.school_id = s.id);

insert into public.gallery_photos (school_id, album_id, title, description, image_url, alt_text, sort_order, is_active)
select s.id, a.id, v.title, v.title, null, v.title, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('campus-life', 'Students in Science Lab', 1),
  ('campus-life', 'Football Match on Main Pitch', 2),
  ('campus-life', 'Library Study Session', 3),
  ('graduation-ceremony', 'Graduation Ceremony', 4)
) as v(album_slug, title, sort_order)
join public.gallery_albums a on a.school_id = s.id and a.slug = v.album_slug
where not exists (select 1 from public.gallery_photos p where p.school_id = s.id);

insert into public.activities (school_id, name, slug, category, description, sort_order, is_active)
select s.id, v.name, v.slug, v.category, v.description, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Robotics Club', 'robotics-club', 'clubs', 'Design, build, and program robots for national competitions.', 1),
  ('Symphony Orchestra', 'symphony-orchestra', 'arts', 'Weekly rehearsals and two public concerts each term.', 2),
  ('Community Service Society', 'community-service-society', 'cultural', 'Service projects across the city, from food drives to mentorship.', 3),
  ('Debate & Model UN', 'debate-model-un', 'competitions', 'Public speaking, research, and diplomacy training for global conferences.', 4)
) as v(name, slug, category, description, sort_order)
where not exists (select 1 from public.activities a where a.school_id = s.id);

insert into public.achievements (school_id, title, category, description, achieved_at, sort_order, is_active)
select s.id, v.title, v.category, v.description, v.achieved_at, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('National Science Olympiad — Gold Medal', 'Academic', 'Grade 11 students secured first place in the chemistry and physics divisions at the 2026 National Science Olympiad.', date '2026-05-15', 1),
  ('IB Diploma — 98% Pass Rate', 'Academic', 'Our 2025 graduating class achieved a 98% pass rate in the IB Diploma Programme.', date '2025-07-10', 2),
  ('State Swimming Championship — 5 Gold Medals', 'Sports', 'The swim team won five individual gold medals and a relay silver at the 2026 State Championships.', date '2026-03-20', 3)
) as v(title, category, description, achieved_at, sort_order)
where not exists (select 1 from public.achievements a where a.school_id = s.id);

insert into public.about_content (school_id, section_key, title, body, sort_order, is_active)
select s.id, v.section_key, v.title, v.body, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('intro', 'About Irshad Academy', 'Founded in 1995, Irshad Academy grew from a single classroom building to a state-of-the-art 20-acre campus serving more than 1,200 students representing 35 nationalities. Our alumni attend leading universities across six continents.', 1),
  ('mission', 'Our Mission', 'Irshad International Academy is committed to providing a rigorous, inclusive, and nurturing education that equips students with the knowledge, skills, and character to thrive in an ever-changing world.', 2),
  ('vision', 'Our Vision', 'To be a globally recognized centre of educational excellence that develops principled, creative, and compassionate leaders who shape the future of their communities and the world.', 3),
  ('values', 'Our Core Values', 'We are guided by the pursuit of excellence, integrity and respect, innovation in learning, compassion and service, global awareness, and lifelong curiosity.', 4),
  ('leadership', 'School Management & Governance', 'The Board of Governors and senior leadership team ensure strategic direction, financial integrity, and educational quality.', 5)
) as v(section_key, title, body, sort_order)
where not exists (select 1 from public.about_content c where c.school_id = s.id);

insert into public.about_milestones (school_id, year, title, description, sort_order, is_active)
select s.id, v.year, v.title, v.description, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('1995', 'Foundation Laid', 'Irshad Academy opens its doors with 60 students in a single classroom building.', 1),
  ('2001', 'First Campus Expansion', 'New science laboratories and a 400-seat auditorium are completed.', 2),
  ('2008', 'IB Programme Authorised', 'Irshad becomes an authorised International Baccalaureate World School.', 3),
  ('2014', 'Olympic Aquatic Centre', 'A 10-lane semi-olympic pool opens, cementing our aquatic sports programme.', 4),
  ('2019', 'Digital Learning Hub', 'A campus-wide 1:1 device programme and digital library launch.', 5),
  ('2024', '1,200 Students Strong', 'The school community grows to more than 1,200 students from 35 nationalities.', 6)
) as v(year, title, description, sort_order)
where not exists (select 1 from public.about_milestones m where m.school_id = s.id);

insert into public.about_management (school_id, name, role, bio, sort_order, is_active)
select s.id, v.name, v.role, v.bio, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Dr. Margaret A. Whitfield', 'Principal & Head of School', 'Educational leader focused on holistic, rigorous international education.', 1),
  ('Mr. Jonathan K. Park', 'Deputy Head — Academics', 'Oversees the curriculum and faculty development across all programmes.', 2),
  ('Mrs. Clara V. Montague', 'Deputy Head — Student Life', 'Leads pastoral care, activities, and community engagement.', 3),
  ('Mr. David O. Ramsey', 'Director of Operations', 'Manages campus facilities, finance, and school administration.', 4)
) as v(name, role, bio, sort_order)
where not exists (select 1 from public.about_management mg where mg.school_id = s.id);

insert into public.academic_classes (school_id, level, grade_label, age_range, description, subjects, sort_order, is_active)
select s.id, v.level, v.grade_label, v.age_range, v.description, v.subjects::jsonb, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Primary', 'Grades 1 – 5', 'Ages 6 – 11', 'The Primary Years Programme builds a strong foundation in literacy, numeracy, and scientific inquiry.', '["English", "Mathematics", "Science", "Humanities", "World Languages", "Arts", "Physical Education"]', 1),
  ('Middle', 'Grades 6 – 8', 'Ages 11 – 14', 'Students are introduced to laboratory sciences, world languages, coding, and structured research projects.', '["English", "Mathematics", "Sciences", "Humanities", "World Languages", "Coding", "Design & Technology"]', 2),
  ('High', 'Grades 9 – 12', 'Ages 14 – 18', 'Offers the IB Diploma and AP courses, personalising each student''s curriculum with electives and independent research.', '["IB Diploma Core", "AP Courses", "Sciences", "Mathematics", "Humanities", "Languages", "Electives"]', 3)
) as v(level, grade_label, age_range, description, subjects, sort_order)
where not exists (select 1 from public.academic_classes c where c.school_id = s.id);

insert into public.academic_departments (school_id, name, slug, description, sort_order, is_active)
select s.id, v.name, v.slug, v.description, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Leadership', 'leadership', 'Executive and senior leadership overseeing school strategy and educational quality.', 1),
  ('Mathematics', 'mathematics', 'From foundational arithmetic to AP Calculus and IB Mathematics.', 2),
  ('Sciences', 'sciences', 'Three dedicated laboratories support hands-on learning in biology, chemistry, and physics.', 3),
  ('Humanities & Languages', 'humanities-languages', 'English literature, world history, and modern languages taught with a focus on cultural understanding.', 4),
  ('Computer Science & Technology', 'computer-science-technology', 'Digital literacy, web development, AP Computer Science, and competitive robotics.', 5)
) as v(name, slug, description, sort_order)
where not exists (select 1 from public.academic_departments d where d.school_id = s.id);

insert into public.academic_content (school_id, slug, title, summary, body, sort_order, is_active)
select s.id, v.slug, v.title, v.summary, v.body, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('ib-diploma', 'International Baccalaureate Diploma', 'A globally respected pre-university programme emphasising critical thinking and inquiry.', 'Two-year programme across six subject groups plus the Core: Theory of Knowledge, the Extended Essay, and Creativity, Activity, Service (CAS).', 1),
  ('cambridge-igcse', 'Cambridge IGCSE', 'Flexible, rigorous qualifications recognised by universities worldwide.', 'A broad foundation in core disciplines with the freedom to specialise through optional subjects in languages, sciences, and the humanities.', 2),
  ('advanced-placement', 'Advanced Placement', 'College-level coursework that earns university credit while still in high school.', 'A wide catalogue of AP courses across mathematics, sciences, social sciences, languages, and the arts, taught by specialist faculty.', 3)
) as v(slug, title, summary, body, sort_order)
where not exists (select 1 from public.academic_content c where c.school_id = s.id);

insert into public.academic_calendar (school_id, title, description, start_date, end_date, sort_order, is_active)
select s.id, v.title, v.description, v.start_date, v.end_date, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Term 1 — Autumn', 'August 18 – December 12, 2026', date '2026-08-18', date '2026-12-12', 1),
  ('Term 2 — Spring', 'January 05 – April 10, 2027', date '2027-01-05', date '2027-04-10', 2),
  ('Term 3 — Summer', 'April 21 – June 30, 2027', date '2027-04-21', date '2027-06-30', 3)
) as v(title, description, start_date, end_date, sort_order)
where not exists (select 1 from public.academic_calendar c where c.school_id = s.id);

insert into public.documents (school_id, title, description, file_url, category, sort_order, is_active)
select s.id, v.title, v.description, v.file_url, v.category, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('School Prospectus 2026–27', 'A comprehensive overview of programmes, facilities, admissions, and fees.', null::text, 'Prospectus', 1),
  ('IB Diploma Programme Guide', 'Detailed information on IB subject groups, core requirements, and university recognition.', null::text, 'Academics', 2),
  ('Academic Calendar 2026–27', 'Full-year calendar with term dates, examination periods, holidays, and key events.', null::text, 'Calendar', 3)
) as v(title, description, file_url, category, sort_order)
where not exists (select 1 from public.documents d where d.school_id = s.id);

insert into public.admissions (school_id, section_key, title, body, sort_order, is_active)
select s.id, v.section_key, v.title, v.body, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('overview', 'Admissions Overview', 'We welcome applications from families seeking a rigorous international education for their children.', 1),
  ('eligibility', 'Eligibility', 'Children are eligible from age 3 (Early Years) through Grade 12. No prior entrance exam is required for Early Years.', 2),
  ('classes', 'Available Classes', 'We offer continuous admissions from Early Years through High School, subject to seat availability.', 3),
  ('documents', 'Required Documents', 'Submit a completed application form, previous school reports, a birth certificate, and two references.', 4),
  ('dates', 'Important Dates', 'Applications for the 2026–27 academic year close in May. Interviews run throughout the spring term.', 5),
  ('steps', 'Application Steps', 'Submit an inquiry, attend a campus tour, complete the application, and meet our admissions team.', 6)
) as v(section_key, title, body, sort_order)
where not exists (select 1 from public.admissions a where a.school_id = s.id);

insert into public.admission_fees (school_id, level, amount, description, sort_order, is_active)
select s.id, v.level, v.amount, v.description, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('Early Years', '$2,900', 'Per academic term', 1),
  ('Primary', '$3,400', 'Per academic term', 2),
  ('Middle School', '$3,800', 'Per academic term', 3),
  ('High School', '$4,250', 'Per academic term', 4)
) as v(level, amount, description, sort_order)
where not exists (select 1 from public.admission_fees f where f.school_id = s.id);

insert into public.home_content (school_id, section_key, title, subtitle, body, cta_label, cta_url, sort_order, is_active)
select s.id, v.section_key, v.title, v.subtitle, v.body, v.cta_label, v.cta_url, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('intro', 'Welcome to Irshad', 'A Legacy of Excellence Since 1995', 'For over twenty-five years, Irshad International Academy has set the standard for holistic education. Our rigorous academic programs, combined with a wide range of co-curricular activities, develop confident, caring, and creative young people who are prepared to succeed in an ever-changing world.', 'Learn More About Us', '/about', 1),
  ('principal', 'Principal''s Desk', 'A Message from Our Principal', 'At Irshad, we believe that every child is capable of extraordinary things. Our role as educators is not merely to impart knowledge, but to ignite a passion for lifelong learning. We cultivate an environment where curiosity is encouraged, creativity is celebrated, and character is paramount.', 'Schedule a Campus Visit', '/contact', 2),
  ('featured', 'Our Pillars', 'The Irshad Approach', 'We provide a balanced education focused on intellectual growth, physical development, and ethical leadership.', null, null, 3),
  ('admissions-cta', 'Begin Your Child''s Journey at Irshad', 'Applications open', 'Applications for the 2026–27 academic year are now open. Schedule a campus visit, speak with our admissions counsellors, or submit an inquiry online. We look forward to welcoming your family to the Irshad community.', 'Start Your Application', '/admissions', 4)
) as v(section_key, title, subtitle, body, cta_label, cta_url, sort_order)
where not exists (select 1 from public.home_content h where h.school_id = s.id);

insert into public.nav_items (school_id, section, label, href, sort_order, is_active)
select s.id, v.section, v.label, v.href, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('main', 'Home', '/', 1),
  ('main', 'About Us', '/about', 2),
  ('main', 'Academics', '/academics', 3),
  ('main', 'Faculty', '/faculty', 4),
  ('main', 'Facilities', '/facilities', 5),
  ('main', 'Activities', '/activities', 6),
  ('main', 'Gallery', '/gallery', 7),
  ('main', 'Events', '/events', 8),
  ('quick', 'Admissions', '/admissions', 1),
  ('quick', 'News', '/news', 2),
  ('quick', 'Contact Us', '/contact', 3),
  ('footer', 'About Us', '/about', 1),
  ('footer', 'Academics', '/academics', 2),
  ('footer', 'Admissions', '/admissions', 3),
  ('footer', 'Faculty', '/faculty', 4),
  ('footer', 'News', '/news', 5),
  ('footer', 'Contact Us', '/contact', 6)
) as v(section, label, href, sort_order)
where not exists (select 1 from public.nav_items n where n.school_id = s.id);

insert into public.contact_information (school_id, label, type, value, is_primary, sort_order, is_active)
select s.id, v.label, v.type, v.value, v.is_primary, v.sort_order, true
from (select id from public.schools where slug = 'irshad') s
cross join (values
  ('School Address', 'address', '125 Academy Road, New York, NY 10024', true, 1),
  ('Phone', 'phone', '+1 (800) 555-0199', true, 2),
  ('Email', 'email', 'info@irshadacademy.edu', true, 3),
  ('Office Hours', 'hours', 'Mon – Fri, 8:00 AM – 5:00 PM', false, 4)
) as v(label, type, value, is_primary, sort_order)
where not exists (select 1 from public.contact_information c where c.school_id = s.id);

-- =============================================================================
-- First admin bootstrap
-- -----------------------------------------------------------------------------
-- 1. Create an admin via the Dashboard (Authentication → Users → Add user) or
--    by signing up through /admin/login with any role (role always 'viewer').
-- 2. Promote that user to admin by running:
--      update public.profiles set role = 'admin' where email = 'you@example.com';
--    (Only an existing admin can do this — run it in the SQL editor which
--     bypasses RLS as the table owner.)
-- =============================================================================
