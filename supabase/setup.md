# Supabase Setup Guide

This guide walks through connecting the Pinecrest Academy site to Supabase.
The project includes a complete SQL schema (`schema.sql`) and the auth
infrastructure for the `/admin` area. No code is written in this guide — you
only point Supabase at your project and run the schema.

## 1. Create a Supabase project

1. Sign in at <https://supabase.com> and create a new project (or reuse an
   existing one).
2. Note the project region — choose one close to your audience.
3. From the dashboard, open **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://abcdefghijklmnopqrst.supabase.co`)
   - **anon / public** key

## 2. Configure environment variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   copy .env.example .env.local
   ```

2. Fill in the values:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

3. The optional `SUPABASE_SERVICE_ROLE_KEY` is **server-only** tooling
   credential. It is never used by the browser and never prefixed with
   `NEXT_PUBLIC_`. The app works without it — RLS keeps writes restricted to
   admins through the anon key.

4. Restart the dev server (`npm.cmd run dev`).

> `.env.local` is git-ignored. Only `.env.example` (no secrets) is committed.

## 3. Run the schema

1. Open **Supabase Dashboard → SQL Editor → New query**.
2. Paste the entire contents of `supabase/schema.sql`.
3. Click **Run**.

The script creates every table, index, trigger, Row Level Security (RLS)
policy, the `school-media` and `school-assets` storage buckets, and a seed
school. It is safe to re-run.

## 4. Enable email authentication

1. **Authentication → Providers → Email** — confirm email is enabled.
2. Optional but recommended: under **Authentication → URL Configuration**,
   add your site URL (production and localhost) and set
   **Site URL** to your app origin so password-reset links point to the right
   place.

## 5. Create the first admin

The schema auto-creates a `profiles` row (role `viewer`) whenever a new user
signs up through Supabase Auth.

To create your first admin:

1. **Authentication → Users → Add user** with the email/password you want for
   the admin account. This creates the `auth.users` row and the matching
   `profiles` row.
2. Promote that user in the **SQL Editor** (the table owner bypasses RLS):

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com';
   ```

3. Sign in at `/admin/login` with those credentials.

> Security model: only an existing admin can change roles (see
> `prevent_self_role_escalation`), and the app redirects non-admin roles to
> `/admin/access-denied`.

## 6. Verify

- Visit `/admin/login` — you should see the sign-in form.
- Sign in and you should land on `/admin` (the dashboard) showing record
  counts from the seeded tables.
- Visit `/admin/forgot-password` to test the password-reset email flow.
  The reset link points to `/admin/update-password`.

## 7. Media

Admin uploads (logos, banners, teacher photos, gallery photos, facility
images, achievements, event photos, and documents) go into the public
`school-assets` bucket under a fixed folder per asset type. The CMS stores the
public URL (and, where supported, the object path) in the `image_url` /
`cover_image_url` / `storage_path` / `file_url` columns. Both buckets are
public; `school-media` is kept for legacy/manual uploads.

Required folders in `school-assets` are created by `schema.sql`; if a folder is
missing, the uploader creates it on demand.

## Troubleshooting

- **"Supabase is not configured"** — `.env.local` is missing or the server
  hasn't been restarted after editing it.
- **Sign-in succeeds but `/admin` still redirects to login** — the user's
  `profiles.role` is not `admin`/`owner`. Promote it with the SQL from step 5.
- **403 on content** — RLS denies non-admin writes. Only `owner`/`admin`
  roles may modify content; `viewer`/`editor` roles can only read public rows
  and their own profile.
- **Strange auth loops** — ensure both `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set and the site/proxy has been rebuilt.
