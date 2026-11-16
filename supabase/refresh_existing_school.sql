-- Refresh the existing tenant database for the brand-neutral website.
-- Run once in Supabase Dashboard > SQL Editor as the project owner.
--
-- Preserves school IDs, auth users, profiles, platform admin assignments,
-- subscription records, and audit history. Clears stored school identity,
-- branding/contact details, domains, invitations, contact messages, and the
-- old CMS content so existing tenant URLs and authorization references remain
-- structurally valid.

begin;

-- Keep the tenant row because profiles and content policies refer to its ID,
-- while replacing the old name and slug with neutral values.
update public.schools
set name = 'School',
    slug = 'school-' || replace(id::text, '-', ''),
    motto = null,
    established_year = null,
    address = null,
    phone = null,
    email = null,
    website = null,
    updated_at = now();

-- Older installs may have the custom_domain field from the SaaS migration.
do $$
begin
  if to_regclass('public.school_themes') is not null then
    execute $sql$
      update public.school_themes
      set primary_color = '#0f172a',
          secondary_color = '#1e293b',
          accent_color = '#d97706',
          font_family = 'sans',
          logo_url = null,
          favicon_url = null,
          banner_url = null,
          custom_css = null,
          updated_at = now()
    $sql$;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'schools' and column_name = 'custom_domain'
  ) then
    execute 'update public.schools set custom_domain = null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'schools' and column_name = 'logo_url'
  ) then
    execute 'update public.schools set logo_url = null, favicon_url = null, primary_color = ''#0f172a'', accent_color = ''#d97706''';
  end if;
end;
$$;

-- Remove visible brand assets and all school contact/SEO details. The colors
-- are reset to the app's neutral defaults; contact forms start disabled.
update public.school_settings
set school_name = '',
    tagline = null,
    logo_url = null,
    favicon_url = null,
    primary_color = '#0f172a',
    secondary_color = '#1e293b',
    contact_email = null,
    contact_phone = null,
    contact_address = null,
    website_url = null,
    map_url = null,
    coordinates = null,
    footer_about = null,
    footer_copyright = null,
    office_hours = '[]'::jsonb,
    social_links = '{}'::jsonb,
    contact_form = '{"enabled": false, "recipient_email": null, "subject_prefix": null}'::jsonb,
    updated_at = now();

-- Clear legacy platform-level naming/contact values when that table exists.
do $$
begin
  if to_regclass('public.platform_settings') is not null then
    execute $sql$
      update public.platform_settings
      set platform_name = 'School Platform',
          support_email = 'support@example.com',
          announcement = null,
          updated_at = now()
    $sql$;
  end if;
end;
$$;

-- Remove school domain mappings and pending invitations on installations that
-- include these SaaS tables.
do $$
begin
  if to_regclass('public.school_domains') is not null then
    execute 'delete from public.school_domains';
  end if;
  if to_regclass('public.school_invitations') is not null then
    execute 'delete from public.school_invitations';
  end if;
end;
$$;

-- Delete prior school content in dependency order. Missing tables are skipped
-- so this works with older installs that have only part of the SaaS schema.
do $$
declare
  v_table text;
  content_tables text[] := array[
    'gallery_photos', 'teachers', 'contact_messages', 'contact_information',
    'admission_fees', 'academic_calendar', 'documents', 'achievements',
    'announcements', 'events', 'activities', 'facilities', 'admissions',
    'about_management', 'about_milestones', 'about_content', 'academic_content',
    'home_hero_slides', 'home_statistics', 'home_content', 'nav_items',
    'school_pages', 'school_homepage_sections', 'custom_pages',
    'gallery_albums', 'academic_departments', 'academic_classes'
  ];
begin
  foreach v_table in array content_tables loop
    if to_regclass(format('public.%I', v_table)) is not null
       and exists (
         select 1 from information_schema.columns c
         where c.table_schema = 'public'
           and c.table_name = v_table
           and c.column_name = 'school_id'
       ) then
      execute format(
        'delete from public.%I where school_id in (select id from public.schools)',
        v_table
      );
    end if;
  end loop;
end;
$$;

commit;
