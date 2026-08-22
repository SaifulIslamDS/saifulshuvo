# SaifulShuvo Portfolio — WordPress + Static Next.js

**Release candidate:** `v1.0.0-rc.1`  
**Architecture:** WordPress headless CMS/backend + Next.js static export + cPanel/Apache  
**Source control:** GitHub

This repository is the public frontend for `saifulshuvo.com`. The previous Supabase-backed Next.js CMS and Netlify runtime have been removed from the release-candidate codebase. Content is now read from the headless WordPress CMS at `cms.saifulshuvo.com` during `next build`, and browser-side actions are sent directly to purpose-built WordPress REST endpoints.

## Final architecture

```text
GitHub
  │ source control
  ▼
Next.js 16 source
  │ build-time WPGraphQL reads
  ▼
next build → out/
  │
  ▼
cPanel / Apache
  │
  ▼
saifulshuvo.com

Browser actions ───────────────┐
                               ▼
                    cms.saifulshuvo.com
                    WordPress + ACF Pro
                    WPGraphQL + WPGraphQL for ACF
                    SaifulShuvo Core
                    MySQL/MariaDB
```

Node.js is a **build tool only**. The production public site is static HTML/CSS/JS served by Apache. No permanent Next.js Node server is required.

## WordPress dependencies

The CMS should have these active:

- Advanced Custom Fields PRO
- WPGraphQL
- WPGraphQL for ACF
- SaifulShuvo Core `0.2.1+`
- SaifulShuvo Headless theme

The one-time migration importer is not needed by the public frontend after migration validation is complete.

## Environment

Copy `.env.example` to `.env.local` for development/builds.

```env
NEXT_PUBLIC_SITE_URL=https://saifulshuvo.com
WORDPRESS_URL=https://cms.saifulshuvo.com
WORDPRESS_GRAPHQL_URL=https://cms.saifulshuvo.com/graphql
NEXT_PUBLIC_WORDPRESS_REST_URL=https://cms.saifulshuvo.com/wp-json/saifulshuvo/v1
WORDPRESS_ALLOW_FALLBACK=false
```

## Commands

```bash
pnpm install --frozen-lockfile
pnpm verify:wordpress
pnpm audit:architecture
pnpm typecheck
pnpm build
pnpm check:static
```

`pnpm build` creates `out/` and adds the cPanel/Apache `.htaccess` security and cache configuration.

## Public routes

```text
/
/projects/
/projects/[slug]/
/blog/
/blog/[slug]/
/blog/category/[slug]/
/blog/tag/[slug]/
/contact/
/privacy/
/robots.txt
/sitemap.xml
```

All dynamic project/blog/taxonomy routes are generated at build time with `generateStaticParams()`.

## Data access

Build-time content reads live under:

```text
src/lib/wordpress/
├── client.ts
├── env.ts
├── helpers.ts
├── media-mapper.ts
├── rest.ts
└── queries/
    ├── media.ts
    ├── posts.ts
    ├── profile.ts
    ├── projects.ts
    ├── seo.ts
    └── site-settings.ts
```

Browser-side writes:

```text
POST /wp-json/saifulshuvo/v1/contact
POST /wp-json/saifulshuvo/v1/analytics
POST /wp-json/saifulshuvo/v1/web-vitals
POST /wp-json/saifulshuvo/v1/errors
```

## Removed from the frontend

The release-candidate codebase no longer contains:

- Supabase client/server/auth layer
- Supabase migrations
- Next.js `/admin` CMS
- Next.js `/auth` routes
- Next.js API route handlers
- Server Actions
- Tiptap admin editor dependencies
- Netlify configuration
- `/cv` server redirect route
- runtime `headers()` configuration

The CMS is WordPress `/wp-admin`. CV/profile media is referenced directly from the WordPress Media Library.

## Deployment

Do not deploy directly to the production domain first. Build and upload `out/` to a preview/staging document root, perform full QA, then cut over `saifulshuvo.com`.

See:

- [`docs/DEVELOPMENT-SUMMARY.md`](docs/DEVELOPMENT-SUMMARY.md)
- [`docs/CONTINUATION-ROADMAP.md`](docs/CONTINUATION-ROADMAP.md)
- [`docs/CPANEL-STATIC-DEPLOYMENT.md`](docs/CPANEL-STATIC-DEPLOYMENT.md)
- [`docs/WORDPRESS-CONTRACT.md`](docs/WORDPRESS-CONTRACT.md)

Historical Supabase-era documents were preserved under `docs/legacy-supabase-v0.9.0/` for reference only and do **not** describe the current architecture.
