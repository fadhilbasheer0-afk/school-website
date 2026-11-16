-- =============================================================================
-- Multi-Institution SaaS Platform Upgrade Migration
-- Migration: 20261116_multi_tenant_saas.sql
-- =============================================================================
-- Safe, idempotent migration to support multi-institution SaaS architecture.
-- Preserves all existing tables, content, and school data.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. schools table upgrades
-- ---------------------------------------------------------------------------
alter table public.schools add column if not exists subscription_tier text not null default 'free'
  check (subscription_tier in ('free', 'starter', 'pro', 'enterprise'));

alter table public.schools add column if not exists custom_domain text;
alter table public.schools add column if not exists primary_color text default '#0f172a';
alter table public.schools add column if not exists accent_color text default '#d97706';
alter table public.schools add column if not exists logo_url text;
alter table public.schools add column if not exists favicon_url text;

-- ---------------------------------------------------------------------------
-- 2. platform_admins table (Platform-level Super Admins)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_admins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  email       text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

-- ---------------------------------------------------------------------------
-- 3. profiles table upgrade (add is_platform_admin and make school_id nullable)
-- ---------------------------------------------------------------------------
alter table public.profiles alter column school_id drop not null;

alter table public.profiles add column if not exists is_platform_admin boolean not null default false;

-- ---------------------------------------------------------------------------
-- 4. Helper Security Functions
-- ---------------------------------------------------------------------------

-- Returns true if the user is a platform-level super admin
create or replace function public.is_platform_admin()
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
    from public.platform_admins pa
    where pa.user_id = auth.uid()
    union
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_platform_admin = true
      and p.is_active = true
  ) into result;
  return coalesce(result, false);
end;
$$;

-- Returns true if user has admin privileges for the specified school (or is platform admin)
create or replace function public.is_school_admin(target_school_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result boolean;
begin
  if public.is_platform_admin() then
    return true;
  end if;

  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and school_id = target_school_id
      and role in ('owner', 'admin')
      and is_active = true
  ) into result;

  return coalesce(result, false);
end;
$$;

-- Overrides public.is_admin() to include platform admins
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
  if public.is_platform_admin() then
    return true;
  end if;

  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin')
      and is_active = true
  ) into result;

  return coalesce(result, false);
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. school_domains (Institution subdomains & custom domains)
-- ---------------------------------------------------------------------------
create table if not exists public.school_domains (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools (id) on delete cascade,
  domain          text not null unique,
  is_primary      boolean not null default false,
  is_verified     boolean not null default true,
  verification_token text default encode(gen_random_bytes(16), 'hex'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.school_domains enable row level security;
create index if not exists idx_school_domains_school_id on public.school_domains (school_id);
create index if not exists idx_school_domains_domain on public.school_domains (domain);

-- ---------------------------------------------------------------------------
-- 6. school_subscriptions (Platform billing & plan tier per institution)
-- ---------------------------------------------------------------------------
create table if not exists public.school_subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  school_id           uuid not null unique references public.schools (id) on delete cascade,
  plan                text not null default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  status              text not null default 'active' check (status in ('active', 'trialing', 'past_due', 'canceled', 'paused')),
  billing_cycle       text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  current_period_start timestamptz not null default now(),
  current_period_end   timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.school_subscriptions enable row level security;
create index if not exists idx_school_subscriptions_school_id on public.school_subscriptions (school_id);

-- ---------------------------------------------------------------------------
-- 7. school_themes (Institution branding, colors, styling)
-- ---------------------------------------------------------------------------
create table if not exists public.school_themes (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null unique references public.schools (id) on delete cascade,
  primary_color   text not null default '#0f172a',
  secondary_color text not null default '#1e293b',
  accent_color    text not null default '#d97706',
  font_family     text not null default 'sans' check (font_family in ('sans', 'serif', 'mono', 'inter', 'playfair')),
  logo_url        text,
  favicon_url     text,
  banner_url      text,
  custom_css      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.school_themes enable row level security;
create index if not exists idx_school_themes_school_id on public.school_themes (school_id);

-- ---------------------------------------------------------------------------
-- 8. school_invitations (Secure invitation & onboarding system)
-- ---------------------------------------------------------------------------
create table if not exists public.school_invitations (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid references public.schools (id) on delete cascade,
  email           text not null,
  role            text not null default 'admin' check (role in ('owner', 'admin', 'editor', 'viewer')),
  is_platform_admin boolean not null default false,
  token           text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by      uuid references auth.users (id) on delete set null,
  accepted_at     timestamptz,
  expires_at      timestamptz not null default (now() + interval '7 days'),
  created_at      timestamptz not null default now()
);

alter table public.school_invitations enable row level security;
create index if not exists idx_school_invitations_token on public.school_invitations (token);
create index if not exists idx_school_invitations_email on public.school_invitations (email);

-- ---------------------------------------------------------------------------
-- 9. school_pages (Configurable Pages & Navigation per institution)
-- ---------------------------------------------------------------------------
create table if not exists public.school_pages (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools (id) on delete cascade,
  page_key        text not null,
  title           text not null,
  nav_label       text not null,
  slug            text not null,
  is_enabled      boolean not null default true,
  is_in_nav       boolean not null default true,
  sort_order      integer not null default 0,
  hero_title      text,
  hero_description text,
  meta_description text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, page_key)
);

alter table public.school_pages enable row level security;
create index if not exists idx_school_pages_school_id on public.school_pages (school_id);
create index if not exists idx_school_pages_slug on public.school_pages (school_id, slug);

-- ---------------------------------------------------------------------------
-- 10. school_homepage_sections (Configurable sections on institution home)
-- ---------------------------------------------------------------------------
create table if not exists public.school_homepage_sections (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools (id) on delete cascade,
  section_key     text not null,
  title           text,
  subtitle        text,
  is_enabled      boolean not null default true,
  sort_order      integer not null default 0,
  settings        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, section_key)
);

alter table public.school_homepage_sections enable row level security;
create index if not exists idx_school_homepage_sections_school on public.school_homepage_sections (school_id);

-- ---------------------------------------------------------------------------
-- 11. custom_pages (Admins can create custom content pages)
-- ---------------------------------------------------------------------------
create table if not exists public.custom_pages (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid not null references public.schools (id) on delete cascade,
  slug            text not null,
  title           text not null,
  nav_label       text not null,
  content         text not null default '',
  meta_description text,
  is_published    boolean not null default true,
  is_in_nav       boolean not null default false,
  sort_order      integer not null default 99,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, slug)
);

alter table public.custom_pages enable row level security;
create index if not exists idx_custom_pages_school_slug on public.custom_pages (school_id, slug);

-- ---------------------------------------------------------------------------
-- 12. platform_settings (Global platform configuration)
-- ---------------------------------------------------------------------------
create table if not exists public.platform_settings (
  id                          uuid primary key default gen_random_uuid(),
  platform_name               text not null default 'EduSaaS Multi-School Platform',
  support_email               text not null default 'support@edusaas.com',
  allow_school_registration   boolean not null default true,
  maintenance_mode            boolean not null default false,
  announcement                text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

-- Ensure single row for platform_settings
insert into public.platform_settings (platform_name, support_email)
select 'EduSaaS Platform', 'support@edusaas.com'
where not exists (select 1 from public.platform_settings);

-- ---------------------------------------------------------------------------
-- 13. audit_logs (Platform & School Audit Trail)
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  school_id       uuid references public.schools (id) on delete set null,
  actor_id        uuid references auth.users (id) on delete set null,
  actor_email     text,
  action          text not null,
  target_type     text not null,
  target_id       text,
  details         jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
create index if not exists idx_audit_logs_school on public.audit_logs (school_id);
create index if not exists idx_audit_logs_actor on public.audit_logs (actor_id);
create index if not exists idx_audit_logs_created on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- 14. Updated handle_new_user() trigger with Invitation Support
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
begin
  -- Check if there is an active pending invitation for this email
  select *
  into v_invite
  from public.school_invitations
  where lower(email) = lower(new.email)
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if v_invite.id is not null then
    -- Found an active invitation: assign invited role, school, and platform privileges
    insert into public.profiles (
      id, school_id, email, full_name, role, is_active, is_platform_admin
    )
    values (
      new.id,
      v_invite.school_id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      v_invite.role,
      true,
      v_invite.is_platform_admin
    )
    on conflict (id) do update set
      school_id = excluded.school_id,
      role = excluded.role,
      is_platform_admin = excluded.is_platform_admin,
      is_active = true;

    -- Mark invitation as accepted
    update public.school_invitations
    set accepted_at = now()
    where id = v_invite.id;

    -- If marked as platform admin, ensure entry in platform_admins
    if v_invite.is_platform_admin then
      insert into public.platform_admins (user_id, email)
      values (new.id, new.email)
      on conflict (user_id) do nothing;
    end if;

  else
    -- No invitation: creates an unassigned viewer profile (safe zero-escalation)
    insert into public.profiles (
      id, school_id, email, full_name, role, is_active, is_platform_admin
    )
    values (
      new.id,
      null,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      'viewer',
      true,
      false
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 15. RLS Policies for New & Existing Tables
-- ---------------------------------------------------------------------------

-- platform_admins RLS
drop policy if exists "Platform admins readable by super admins" on public.platform_admins;
create policy "Platform admins readable by super admins"
  on public.platform_admins for select
  to authenticated
  using (public.is_platform_admin());

-- platform_settings RLS
drop policy if exists "Platform settings are publicly readable" on public.platform_settings;
create policy "Platform settings are publicly readable"
  on public.platform_settings for select
  using (true);

drop policy if exists "Platform settings editable only by super admins" on public.platform_settings;
create policy "Platform settings editable only by super admins"
  on public.platform_settings for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- schools RLS update: allow public read of ANY active school
drop policy if exists "Default school is publicly readable" on public.schools;
drop policy if exists "Schools are publicly readable" on public.schools;
create policy "Schools are publicly readable"
  on public.schools for select
  using (is_active = true or public.is_admin());

drop policy if exists "Only admins can modify schools" on public.schools;
create policy "Admins can modify their own school or super admin all"
  on public.schools for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and id = public.current_school_id()));

-- school_domains RLS
drop policy if exists "School domains are publicly readable" on public.school_domains;
create policy "School domains are publicly readable"
  on public.school_domains for select
  using (true);

drop policy if exists "Admins can manage school domains" on public.school_domains;
create policy "Admins can manage school domains"
  on public.school_domains for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- school_themes RLS
drop policy if exists "School themes are publicly readable" on public.school_themes;
create policy "School themes are publicly readable"
  on public.school_themes for select
  using (true);

drop policy if exists "Admins can manage school themes" on public.school_themes;
create policy "Admins can manage school themes"
  on public.school_themes for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- school_subscriptions RLS
drop policy if exists "Subscriptions readable by super admins or school admins" on public.school_subscriptions;
create policy "Subscriptions readable by super admins or school admins"
  on public.school_subscriptions for select
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

drop policy if exists "Subscriptions manageable by super admins" on public.school_subscriptions;
create policy "Subscriptions manageable by super admins"
  on public.school_subscriptions for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- school_invitations RLS
drop policy if exists "Invitations readable by admins" on public.school_invitations;
create policy "Invitations readable by admins"
  on public.school_invitations for select
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

drop policy if exists "Invitations manageable by admins" on public.school_invitations;
create policy "Invitations manageable by admins"
  on public.school_invitations for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- school_pages RLS
drop policy if exists "School pages are publicly readable" on public.school_pages;
create policy "School pages are publicly readable"
  on public.school_pages for select
  using (
    public.is_platform_admin()
    or (public.is_admin() and school_id = public.current_school_id())
    or exists (
      select 1 from public.schools s
      where s.id = school_id and s.is_active = true
    )
  );

drop policy if exists "Admins can manage school pages" on public.school_pages;
create policy "Admins can manage school pages"
  on public.school_pages for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- school_homepage_sections RLS
drop policy if exists "School homepage sections are publicly readable" on public.school_homepage_sections;
create policy "School homepage sections are publicly readable"
  on public.school_homepage_sections for select
  using (
    public.is_platform_admin()
    or (public.is_admin() and school_id = public.current_school_id())
    or exists (
      select 1 from public.schools s
      where s.id = school_id and s.is_active = true
    )
  );

drop policy if exists "Admins can manage school homepage sections" on public.school_homepage_sections;
create policy "Admins can manage school homepage sections"
  on public.school_homepage_sections for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- custom_pages RLS
drop policy if exists "Custom pages are publicly readable" on public.custom_pages;
create policy "Custom pages are publicly readable"
  on public.custom_pages for select
  using (
    public.is_platform_admin()
    or (public.is_admin() and school_id = public.current_school_id())
    or (is_published = true and exists (
      select 1 from public.schools s
      where s.id = school_id and s.is_active = true
    ))
  );

drop policy if exists "Admins can manage custom pages" on public.custom_pages;
create policy "Admins can manage custom pages"
  on public.custom_pages for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- audit_logs RLS
drop policy if exists "Audit logs readable by super admins or school admins" on public.audit_logs;
create policy "Audit logs readable by super admins or school admins"
  on public.audit_logs for select
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

drop policy if exists "Audit logs insertable by authenticated users" on public.audit_logs;
create policy "Audit logs insertable by authenticated users"
  on public.audit_logs for insert
  to authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- 16. Multi-Tenant Public Read on Existing Tables
-- ---------------------------------------------------------------------------
-- Ensure any active school's active content is readable anonymously across tenants
do $$
declare
  tbl text;
  tables text[] := array[
    'school_settings',
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
  ];
begin
  foreach tbl in array tables loop
    if exists (select 1 from information_schema.tables where table_name = tbl and table_schema = 'public') then
      execute format('drop policy if exists "Public read" on public.%I', tbl);
      execute format('drop policy if exists "Admin write" on public.%I', tbl);

      execute format(
        'create policy "Public read" on public.%I for select using (
           public.is_platform_admin()
           or (public.is_admin() and school_id = public.current_school_id())
           or exists (
             select 1 from public.schools s
             where s.id = school_id and s.is_active = true
           )
         )',
        tbl
      );

      execute format(
        'create policy "Admin write" on public.%I for all to authenticated
         using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
         with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))',
        tbl
      );
    end if;
  end loop;
end;
$$;

-- Teachers RLS
drop policy if exists "Active teachers are publicly readable" on public.teachers;
create policy "Active teachers are publicly readable"
  on public.teachers for select
  using (
    public.is_platform_admin()
    or (public.is_admin() and school_id = public.current_school_id())
    or (is_active = true and exists (
      select 1 from public.schools s
      where s.id = school_id and s.is_active = true
    ))
  );

drop policy if exists "Admin write on teachers" on public.teachers;
create policy "Admin write on teachers"
  on public.teachers for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- Announcements RLS
drop policy if exists "Published announcements are publicly readable" on public.announcements;
create policy "Published announcements are publicly readable"
  on public.announcements for select
  using (
    public.is_platform_admin()
    or (public.is_admin() and school_id = public.current_school_id())
    or (is_published = true and exists (
      select 1 from public.schools s
      where s.id = school_id and s.is_active = true
    ))
  );

drop policy if exists "Admin write on announcements" on public.announcements;
create policy "Admin write on announcements"
  on public.announcements for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- Events RLS
drop policy if exists "Published events are publicly readable" on public.events;
create policy "Published events are publicly readable"
  on public.events for select
  using (
    public.is_platform_admin()
    or (public.is_admin() and school_id = public.current_school_id())
    or (is_published = true and exists (
      select 1 from public.schools s
      where s.id = school_id and s.is_active = true
    ))
  );

drop policy if exists "Admin write on events" on public.events;
create policy "Admin write on events"
  on public.events for all
  to authenticated
  using (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()))
  with check (public.is_platform_admin() or (public.is_admin() and school_id = public.current_school_id()));

-- Storage upload policy upgrade for super admins and school admins
drop policy if exists "School admins upload to their own school folder" on storage.objects;
create policy "School admins upload to their own school folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('school-assets', 'school-media')
    and (
      public.is_platform_admin()
      or (
        public.is_admin()
        and (storage.foldername(name))[1] = public.current_school_id()::text
      )
    )
  );

drop policy if exists "School admins update their own school folder" on storage.objects;
create policy "School admins update their own school folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('school-assets', 'school-media')
    and (
      public.is_platform_admin()
      or (
        public.is_admin()
        and (storage.foldername(name))[1] = public.current_school_id()::text
      )
    )
  );

drop policy if exists "School admins delete from their own school folder" on storage.objects;
create policy "School admins delete from their own school folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('school-assets', 'school-media')
    and (
      public.is_platform_admin()
      or (
        public.is_admin()
        and (storage.foldername(name))[1] = public.current_school_id()::text
      )
    )
  );

-- ---------------------------------------------------------------------------
-- 17. Seed Default Pages & Sections for Existing Schools
-- ---------------------------------------------------------------------------
-- For every existing school, ensure default school_pages and school_homepage_sections exist
do $$
declare
  school_rec record;
begin
  for school_rec in select id, slug, name from public.schools loop
    -- Default Themes
    insert into public.school_themes (school_id, primary_color, accent_color)
    values (school_rec.id, '#0f172a', '#d97706')
    on conflict (school_id) do nothing;

    -- Default Subscriptions
    insert into public.school_subscriptions (school_id, plan, status)
    values (school_rec.id, 'pro', 'active')
    on conflict (school_id) do nothing;

    -- Default Standard Pages
    insert into public.school_pages (school_id, page_key, title, nav_label, slug, is_enabled, is_in_nav, sort_order)
    values
      (school_rec.id, 'about', 'About Us', 'About Us', 'about', true, true, 1),
      (school_rec.id, 'academics', 'Academic Programs', 'Academics', 'academics', true, true, 2),
      (school_rec.id, 'faculty', 'Faculty & Staff', 'Faculty', 'faculty', true, true, 3),
      (school_rec.id, 'facilities', 'Campus Facilities', 'Facilities', 'facilities', true, true, 4),
      (school_rec.id, 'activities', 'Activities & Achievements', 'Activities', 'activities', true, true, 5),
      (school_rec.id, 'gallery', 'Campus Gallery', 'Gallery', 'gallery', true, true, 6),
      (school_rec.id, 'events', 'Upcoming Events', 'Events', 'events', true, true, 7),
      (school_rec.id, 'admissions', 'Admissions', 'Admissions', 'admissions', true, true, 8),
      (school_rec.id, 'news', 'News & Announcements', 'News', 'news', true, true, 9),
      (school_rec.id, 'contact', 'Contact Us', 'Contact', 'contact', true, true, 10)
    on conflict (school_id, page_key) do nothing;

    -- Default Homepage Sections
    insert into public.school_homepage_sections (school_id, section_key, title, subtitle, is_enabled, sort_order)
    values
      (school_rec.id, 'hero', 'Hero Banner', 'Welcome presentation and quick call to action', true, 1),
      (school_rec.id, 'stats', 'Key Statistics', 'By the numbers milestone badges', true, 2),
      (school_rec.id, 'about_preview', 'About Highlights', 'School leadership and educational philosophy', true, 3),
      (school_rec.id, 'academics_preview', 'Academic Pathways', 'Curriculum overview from early to secondary', true, 4),
      (school_rec.id, 'news_preview', 'Latest News', 'Campus announcements and student achievements', true, 5),
      (school_rec.id, 'events_preview', 'Upcoming Events', 'School calendar and community gatherings', true, 6),
      (school_rec.id, 'achievements_preview', 'Hall of Fame', 'Honors, medals, and academic triumphs', true, 7),
      (school_rec.id, 'facilities_preview', 'Campus Virtual Tour', 'Modern labs, libraries, and athletic spaces', true, 8),
      (school_rec.id, 'gallery_preview', 'Moments in Focus', 'Photo highlights from student life', true, 9),
      (school_rec.id, 'admissions_cta', 'Admissions Call to Action', 'Inquiry processing and enrollment card', true, 10)
    on conflict (school_id, section_key) do nothing;
  end loop;
end;
$$;
