# Saiful Islam Portfolio

A mobile-responsive personal portfolio and single-owner CMS built with Next.js, TypeScript, Supabase and Netlify.

## Current release

**v0.9.0 — SEO, Analytics, Performance and Production Hardening**

The site now includes database-managed SEO defaults, generated social artwork, structured data, dynamic robots and sitemap controls, optional consent-aware Google Analytics or Plausible loading, first-party page-view and Core Web Vitals telemetry, bounded client-error reporting, production security headers, health checks, accessibility improvements and retention controls.

## Stack

- Next.js 16 App Router and React 19
- TypeScript
- Node.js 24 LTS and pnpm 11
- Supabase Auth, PostgreSQL, Storage and Row Level Security
- Supabase SSR cookie sessions
- Tiptap rich-text editor
- Resend Email API for optional contact notifications
- Optional Google Analytics 4 or Plausible Analytics
- Netlify deployment

## Local setup

```powershell
nvm install 24.18.1
nvm use 24.18.1
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
Copy-Item .env.example .env.local
pnpm typecheck
pnpm build
pnpm dev
```

Apply migrations in order:

```text
supabase/migrations/202607310001_cms_foundation.sql
supabase/migrations/202607310002_project_cms.sql
supabase/migrations/202607310003_blog_cms.sql
supabase/migrations/202607310004_media_library.sql
supabase/migrations/202607310005_profile_homepage_cms.sql
supabase/migrations/202607310006_contact_inbox.sql
supabase/migrations/202607310007_seo_analytics_hardening.sql
```

## Important routes

```text
/
/contact
/cv
/projects
/blog
/api/health
/admin
/admin/inbox
/admin/homepage
/admin/skills
/admin/experience
/admin/projects
/admin/posts
/admin/media
/admin/settings
/admin/seo
/admin/analytics
```

## Documentation

All documentation except this README is stored in [`docs/`](./docs/README.md).

Start with:

1. [`docs/UPGRADE-v0.9.0.md`](./docs/UPGRADE-v0.9.0.md)
2. [`docs/SEO-ANALYTICS-HARDENING.md`](./docs/SEO-ANALYTICS-HARDENING.md)
3. [`docs/PRODUCTION-CHECKLIST.md`](./docs/PRODUCTION-CHECKLIST.md)
4. [`docs/RELEASE-NOTES-v0.9.0.md`](./docs/RELEASE-NOTES-v0.9.0.md)
