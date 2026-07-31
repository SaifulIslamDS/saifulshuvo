# Supabase and Google OAuth Setup

Follow the steps in this order.

## 1. Create a Supabase project

Create one Supabase project for the portfolio. From the project Connect dialog, copy:

- Project URL
- Publishable key

Do not add a service-role key to this application.

## 2. Apply the migration

Open Supabase Dashboard → SQL Editor and run:

```text
supabase/migrations/202607310001_cms_foundation.sql
```

The migration creates the CMS tables, triggers, RLS policies and initial content.

## 3. Add the database administrator email

Before the first sign-in, run this in the SQL Editor using the exact Google account email:

```sql
insert into private.admin_allowlist (email)
values (lower('YOUR_GOOGLE_EMAIL'))
on conflict (email) do nothing;
```

Verify:

```sql
select email, created_at
from private.admin_allowlist;
```

Every database allow-list email must also be included in `ADMIN_EMAILS` (or the backward-compatible `ADMIN_EMAIL`) in local and Netlify environment variables.

## 4. Configure Google OAuth

In Google Auth Platform:

1. Create an OAuth client.
2. Select **Web application**.
3. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - your Netlify production origin
   - later, `https://saifulshuvo.com`
4. Add the Supabase callback URL shown on the Supabase Google provider page. It has this form:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

5. Copy the Google Client ID and Client Secret.

In Supabase Dashboard → Authentication → Sign In / Providers → Google:

1. Enable Google.
2. Paste the Client ID and Client Secret.
3. Save.

Leave public email/password registration disabled because this is a single-owner CMS.

## 5. Configure Supabase redirect URLs

Supabase Dashboard → Authentication → URL Configuration:

**Site URL during Netlify stage**

```text
https://YOUR-SITE.netlify.app
```

**Redirect URLs**

```text
http://localhost:3000/**
https://YOUR-SITE.netlify.app/**
https://**--YOUR-SITE.netlify.app/**
```

After connecting the custom domain, add:

```text
https://saifulshuvo.com/**
```

Then change Site URL to:

```text
https://saifulshuvo.com
```

## 6. Create `.env.local`

Copy `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

Fill in:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
ADMIN_EMAILS=YOUR_GOOGLE_EMAIL
```

Never commit `.env.local`.

## 7. Test locally

```powershell
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

Open:

```text
http://localhost:3000/admin/login
```

Expected result:

1. Google account selection opens.
2. The approved account returns to `/auth/callback`.
3. The callback creates a cookie session.
4. The owner reaches `/admin`.
5. Any other Google account is signed out and rejected.

## 8. Add Netlify variables

Netlify → Site configuration → Environment variables:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ADMIN_EMAIL
```

Use the production Netlify URL for `NEXT_PUBLIC_SITE_URL` until the custom domain is connected.

## v0.4.0 migration

After the CMS foundation migration, run:

```text
supabase/migrations/202607310002_project_cms.sql
```

For multiple application administrators, use a comma-separated environment variable:

```dotenv
ADMIN_EMAILS=first@gmail.com,second@gmail.com
```

Insert every email into the database allow-list as well:

```sql
insert into private.admin_allowlist (email)
values
  (lower('first@gmail.com')),
  (lower('second@gmail.com'))
on conflict (email) do nothing;
```

## v0.5.0 Blog CMS migration

After migrations 001 and 002, run:

```text
supabase/migrations/202607310003_blog_cms.sql
```

Verify:

```sql
select slug, name from public.post_categories order by sort_order;
select slug, name from public.post_tags order by name;
select slug, publication_status, version from public.posts order by sort_order;
```

No new environment variable is required for v0.5.0.
