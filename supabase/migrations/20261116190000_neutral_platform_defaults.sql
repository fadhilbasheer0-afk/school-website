-- Remove the previous platform name from persisted global settings.
-- Keep the earlier migration unchanged so installed databases retain a valid
-- migration history.

alter table public.platform_settings
  alter column platform_name set default 'School Platform',
  alter column support_email set default 'support@example.com';

update public.platform_settings
set platform_name = 'School Platform'
where platform_name ilike '%edusaas%';

update public.platform_settings
set support_email = 'support@example.com'
where support_email ilike '%edusaas%';
