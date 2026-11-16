-- ============================================================================
-- Rebrand migration: "Pinecrest Academy" -> "Irshad Academy"
--
-- Run this once against a database that was seeded with the OLD (Pinecrest)
-- schema.sql so existing rows are rebranded in place. It is safe to re-run:
-- every statement either no-ops or produces the same result.
--
-- What it does
--  1. Renames the default school row (slug, name, contact details).
--  2. Rewrites branding inside school_settings (including JSON social links).
--  3. Rewrites branding inside every CMS content table (text + slug columns).
--
-- It never touches visitor-submitted data (public.contact_messages) or the
-- storage buckets. Content references rows by UUID school_id, which does not
-- change, so no storage paths need moving.
--
-- Run it in the Supabase Dashboard -> SQL Editor, or:
--   supabase db push
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1) Rename the school row itself.
--    Guarded so it cannot collide if an 'irshad' school already exists.
-- ---------------------------------------------------------------------------
update public.schools
set slug = 'irshad',
    name = replace(replace(name, 'Pinecrest', 'Irshad'), 'pinecrest', 'irshad'),
    motto = replace(replace(motto, 'Pinecrest', 'Irshad'), 'pinecrest', 'irshad'),
    address = replace(replace(address, 'Pinecrest Hills, NY 10024', 'New York, NY 10024'), 'Pinecrest', 'Irshad'),
    email = replace(email, 'pinecrestacademy.edu', 'irshadacademy.edu'),
    website = replace(website, 'pinecrestacademy.edu', 'irshadacademy.edu'),
    updated_at = now()
where slug = 'pinecrest'
  and not exists (select 1 from public.schools where slug = 'irshad');

-- Fix display fields even if the slug was already 'irshad' but the row still
-- carries Pinecrest branding (fresh seed + old content scenario).
update public.schools
set name = replace(replace(name, 'Pinecrest', 'Irshad'), 'pinecrest', 'irshad'),
    motto = replace(replace(motto, 'Pinecrest', 'Irshad'), 'pinecrest', 'irshad'),
    address = replace(replace(address, 'Pinecrest Hills, NY 10024', 'New York, NY 10024'), 'Pinecrest', 'Irshad'),
    email = replace(email, 'pinecrestacademy.edu', 'irshadacademy.edu'),
    website = replace(website, 'pinecrestacademy.edu', 'irshadacademy.edu'),
    updated_at = now()
where slug = 'irshad';

-- ---------------------------------------------------------------------------
-- 2) school_settings: text columns plus the social_links JSON blob.
-- ---------------------------------------------------------------------------
update public.school_settings
set social_links = replace(replace(social_links::text, 'Pinecrest', 'Irshad'), 'pinecrest', 'irshad')::jsonb,
    updated_at = now()
where social_links::text ilike '%pinecrest%';

-- ---------------------------------------------------------------------------
-- 3) Every CMS content table: apply the same text rewrite to each column.
--    The replacements are applied inside-out:
--      - full address first (so it becomes "New York" and not "Irshad Hills"),
--      - then case variants of the school name.
--    Slugs (announcements, events, activities, facilities, albums, academic
--    content, departments) are rewritten too, e.g. 'pinecrest-...' -> 'irshad-...'.
-- ---------------------------------------------------------------------------
do $$
declare
  rec record;
begin
  for rec in select * from (values
    ('school_settings',       'school_name'),
    ('school_settings',       'tagline'),
    ('school_settings',       'contact_email'),
    ('school_settings',       'contact_address'),
    ('school_settings',       'website_url'),
    ('school_settings',       'map_url'),
    ('school_settings',       'footer_about'),
    ('school_settings',       'footer_copyright'),
    ('school_settings',       'seo_title'),
    ('school_settings',       'seo_description'),
    ('home_content',          'title'),
    ('home_content',          'subtitle'),
    ('home_content',          'body'),
    ('home_content',          'image_url'),
    ('home_content',          'cta_label'),
    ('home_content',          'cta_url'),
    ('home_hero_slides',      'title'),
    ('home_hero_slides',      'subtitle'),
    ('home_hero_slides',      'image_url'),
    ('home_hero_slides',      'cta_label'),
    ('home_hero_slides',      'cta_url'),
    ('home_statistics',       'label'),
    ('home_statistics',       'value'),
    ('about_content',         'title'),
    ('about_content',         'body'),
    ('about_content',         'image_url'),
    ('about_milestones',      'year'),
    ('about_milestones',      'title'),
    ('about_milestones',      'description'),
    ('about_management',      'name'),
    ('about_management',      'role'),
    ('about_management',      'bio'),
    ('about_management',      'image_url'),
    ('academic_content',      'title'),
    ('academic_content',      'summary'),
    ('academic_content',      'body'),
    ('academic_content',      'image_url'),
    ('academic_classes',      'grade_label'),
    ('academic_classes',      'age_range'),
    ('academic_classes',      'description'),
    ('academic_departments',  'name'),
    ('academic_departments',  'slug'),
    ('academic_departments',  'description'),
    ('academic_departments',  'image_url'),
    ('teachers',              'name'),
    ('teachers',              'title'),
    ('teachers',              'bio'),
    ('teachers',              'image_url'),
    ('teachers',              'email'),
    ('teachers',              'phone'),
    ('teachers',              'qualifications'),
    ('facilities',            'name'),
    ('facilities',            'slug'),
    ('facilities',            'description'),
    ('facilities',            'image_url'),
    ('activities',            'name'),
    ('activities',            'slug'),
    ('activities',            'category'),
    ('activities',            'description'),
    ('activities',            'image_url'),
    ('achievements',          'title'),
    ('achievements',          'category'),
    ('achievements',          'description'),
    ('achievements',          'image_url'),
    ('gallery_albums',        'title'),
    ('gallery_albums',        'slug'),
    ('gallery_albums',        'description'),
    ('gallery_albums',        'cover_image_url'),
    ('gallery_photos',        'title'),
    ('gallery_photos',        'description'),
    ('gallery_photos',        'image_url'),
    ('gallery_photos',        'storage_path'),
    ('gallery_photos',        'alt_text'),
    ('announcements',         'title'),
    ('announcements',         'slug'),
    ('announcements',         'category'),
    ('announcements',         'summary'),
    ('announcements',         'content'),
    ('announcements',         'author'),
    ('announcements',         'image_url'),
    ('announcements',         'attachment_url'),
    ('events',                'title'),
    ('events',                'slug'),
    ('events',                'category'),
    ('events',                'description'),
    ('events',                'venue'),
    ('events',                'image_url'),
    ('events',                'registration_url'),
    ('events',                'contact_email'),
    ('admissions',            'title'),
    ('admissions',            'body'),
    ('admissions',            'image_url'),
    ('contact_information',   'label'),
    ('contact_information',   'value'),
    ('nav_items',             'label'),
    ('nav_items',             'href'),
    ('admission_fees',        'level'),
    ('admission_fees',        'amount'),
    ('admission_fees',        'description'),
    ('academic_calendar',     'title'),
    ('academic_calendar',     'description'),
    ('documents',             'title'),
    ('documents',             'description'),
    ('documents',             'file_url'),
    ('documents',             'category')
  ) as t(tbl, col)
  loop
    execute format(
      'update public.%I set %I = replace(replace(replace(replace(%I, %L, %L), %L, %L), %L, %L), %L, %L), updated_at = now()',
      rec.tbl, rec.col, rec.col,
      '125 Academy Road, Pinecrest Hills, NY 10024', '125 Academy Road, New York, NY 10024',
      'Pinecrest', 'Irshad',
      'pinecrest', 'irshad',
      'PINECREST', 'IRSHAD'
    );
  end loop;
end $$;

commit;

-- ---------------------------------------------------------------------------
-- Post-run sanity check — should return zero rows:
--   select 'schools' as tbl, name from public.schools
--   union all
--   select 'announcements', title from public.announcements where title ilike '%pinecrest%';
-- (add any table you want to the union to confirm no Pinecrest text remains)
-- ---------------------------------------------------------------------------
