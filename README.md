# Multi-tenant school website platform

A configurable school website and content management platform. Each school can
have its own pages, content, theme, domain, and administrators while sharing
one Next.js application and Supabase database.

## Project overview

- **Public websites** render school pages, news, events, galleries, admissions,
  faculty, facilities, and contact information.
- **School administration** at `/admin` lets school staff manage content,
  branding, navigation, pages, and homepage sections.
- **Platform administration** at `/platform-admin` manages schools, users,
  domains, subscriptions, and audit records.
- **Tenant resolution** selects the school from a path, request header,
  subdomain, custom domain, or the configured default school.
- **Supabase** provides Postgres data, authentication, row-level security,
  storage, and SQL migrations. Without Supabase, the site uses neutral demo
  data.

## Tech stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Supabase Postgres, Auth, row-level security, and Storage
- Tagged caching and route revalidation for CMS updates

## Main directories

- `src/app/` — public routes, school-scoped routes, and both admin areas
- `src/components/` — page, layout, and administration components
- `src/lib/` — tenant resolution, Supabase clients, content access, and admin actions
- `src/data/` — offline demo content
- `supabase/schema.sql` — database schema, policies, and neutral starter content
- `supabase/migrations/` — database changes, including historical migrations

## Getting started

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and configure the Supabase URL and
   anonymous key. The service role key is optional and must remain server-only.
3. In the Supabase SQL editor, apply `supabase/schema.sql`, then
   `supabase/migrations/20261116_multi_tenant_saas.sql`, then
   `supabase/migrations/20261116190000_neutral_platform_defaults.sql`. Skip the
   older August rebrand migration for a new project.
4. Add `fadhilbasheer0@gmail.com` under **Authentication → Users**.
5. Run `supabase/bootstrap_super_admin.sql` in the SQL editor to grant that
   account platform-wide administrator access.
6. Add the Supabase URL and anon key to `.env.local`, then start with
   `npm run dev` and visit `/platform-admin`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — serve a production build
- `npm run lint` — lint the project

## Deploy to Vercel

1. Sign in with `vercel login`.
2. From the project folder, run `vercel` and create a new project when prompted.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the
   Vercel project’s Environment Variables. Keep the service role key out of
   browser-visible variables; it is optional for this app.
4. Run `vercel --prod` to publish the production deployment.
5. Add the Vercel domain to Supabase Authentication’s Site URL and redirect
   URL allowlist.

School names, logos, colors, and contact details are configured per tenant in
the database and admin interface. The checked-in defaults are neutral demo
values; no real school identity is required by the application.
