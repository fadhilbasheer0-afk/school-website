-- Run this in the Supabase SQL Editor after creating the Auth user.
-- It grants platform-wide administration to this one verified email.
do $$
declare
  target_user_id uuid;
begin
  select id
    into target_user_id
  from auth.users
  where lower(email) = lower('fadhilbasheer0@gmail.com')
  limit 1;

  if target_user_id is null then
    raise exception 'Create fadhilbasheer0@gmail.com in Authentication > Users first, then run this script again.';
  end if;

  insert into public.profiles (
    id, school_id, email, full_name, role, is_active, is_platform_admin
  )
  select
    target_user_id,
    null,
    user_row.email,
    coalesce(user_row.raw_user_meta_data ->> 'full_name', 'Platform Super Admin'),
    'owner',
    true,
    true
  from auth.users as user_row
  where user_row.id = target_user_id
  on conflict (id) do update set
    school_id = null,
    role = 'owner',
    is_active = true,
    is_platform_admin = true,
    updated_at = now();

  delete from public.platform_admins
  where lower(email) = lower('fadhilbasheer0@gmail.com')
    and user_id <> target_user_id;

  insert into public.platform_admins (user_id, email)
  select target_user_id, email
  from auth.users
  where id = target_user_id
  on conflict (user_id) do update set
    email = excluded.email,
    updated_at = now();
end;
$$;
