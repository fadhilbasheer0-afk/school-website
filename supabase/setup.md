# Supabase Setup Guide

This guide walks through connecting the school website platform to Supabase.
The project includes a complete SQL schema (`schema.sql`) and the auth
infrastructure for the `/admin` area. No code is written in this guide — you
only point Supabase at your project and run the schema.

## 1. Select the Supabase project

1. Sign in at <https://supabase.com> and open the project you want to use.
2. From the dashboard, open **Project Settings → API Keys** and copy:
   - **Project URL** (e.g. `https://abcdefghijklmnopqrst.supabase.co`)
   - **anon / publishable** key

## 2. Configure environment variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   copy .env.example .env.local
   ```

2. Fill in the values:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   ```

3. The optional `SUPABASE_SERVICE_ROLE_KEY` is **server-only** tooling
   credential. It is never used by the browser and never prefixed with
   `NEXT_PUBLIC_`. The app works without it — RLS keeps writes restricted to
   admins through the anon key.

4. Restart the dev server (`npm.cmd run dev`).

> `.env.local` is git-ignored. Only `.env.example` (no secrets) is committed.

## 3. Set up the existing database

1. Open **Supabase Dashboard → SQL Editor → New query**.
2. Do not rerun `supabase/schema.sql` on an existing database. It is only for
   an empty project.
3. Check whether `20261116_multi_tenant_saas.sql` has already been applied. If
   its tables/functions are missing, run it once to add platform admin support.
4. Run `supabase/migrations/20261116190000_neutral_platform_defaults.sql` if it
   has not already been applied.
5. Run `supabase/refresh_existing_school.sql` to clear old school identity,
   contact details, domains, invitations, and CMS content. It preserves account
   profiles, platform-admin assignments, subscriptions, and audit history.

For an empty project only, run `supabase/schema.sql` first, then the two
migrations above. The schema creates the core tables, policies, storage
buckets, and starter content.

Apply only migrations that have not already been run. Do not rerun the full
schema or historical rebrand migrations on an existing database.

> The migration `20260812_rebrand_pinecrest_to_irshad.sql` is retained for
> databases created by an earlier version. Do not rerun historical migrations
> as part of a fresh setup; use `schema.sql` for a new database.

## 4. Enable email authentication

1. **Authentication → Providers → Email** — confirm email is enabled.
2. Optional but recommended: under **Authentication → URL Configuration**,
   add your site URL (production and localhost) and set
   **Site URL** to your app origin so password-reset links point to the right
   place.

## 5. Create the platform super admin

1. In **Authentication → Users**, add `fadhilbasheer0@gmail.com`.
2. Run `supabase/bootstrap_super_admin.sql` in the SQL editor. It grants the
   account the platform owner role and adds it to `platform_admins`.
3. Sign in at `/admin/login`; the account can then open `/platform-admin`.

> Security model: only an existing admin can change roles (see
> `prevent_self_role_escalation`), and the app redirects non-admin roles to
> `/admin/access-denied`.

## 6. Verify

- Visit `/admin/login` — you should see the sign-in form.
- Sign in and open `/platform-admin` to manage schools, users, domains, and
  platform settings. The `/admin` area manages school content.
- The neutral starter site and record counts are visible after setup.
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

The refresh script clears database references to old school images. It does
not delete the underlying files from Storage buckets; remove old files from
**Storage → school-assets** if they also need to be permanently removed.

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
