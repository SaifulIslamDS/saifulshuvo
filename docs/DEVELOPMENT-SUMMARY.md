# SaifulShuvo — Full Development & Migration Summary

**Status date:** 22 August 2026  
**Frontend release candidate:** `v1.0.0-rc.1`  
**WordPress Core plugin:** `SaifulShuvo Core 0.2.1`  
**Migration importer used:** `SaifulShuvo Migration Importer 0.1.1`

## 1. Executive summary

SaifulShuvo has been migrated away from a Supabase-owned CMS/backend architecture toward a WordPress-native headless CMS hosted entirely on cPanel. The final public delivery model is also cPanel-only: Next.js remains the frontend framework and GitHub remains source control, but the public frontend is exported as static HTML/CSS/JS and served by Apache instead of running continuously on Netlify or a Node.js application server.

The WordPress migration has completed and passed structural validation. The current frontend repository has now been converted into a WordPress-backed, static-export-compatible release candidate. The remaining work is verification against the live WPGraphQL schema, preview deployment, cross-origin REST testing, static-build QA, rebuild automation, production cutover, and finally retirement of Netlify/Supabase.

## 2. Final architecture

```text
                         GitHub
                    source control only
                          │
                          ▼
                    Next.js 16 source
                          │
                  WPGraphQL at build time
                          │
                          ▼
                    next build / out
                          │
                          ▼
                    cPanel / Apache
                          │
                          ▼
                   saifulshuvo.com

Browser ── contact / analytics / vitals / errors ──► WordPress REST
                                                     │
                                                     ▼
                                          cms.saifulshuvo.com
                                          WordPress CMS/backend
                                          ACF Pro
                                          WPGraphQL
                                          WPGraphQL for ACF
                                          SaifulShuvo Core
                                                     │
                                                     ▼
                                             MySQL / MariaDB
```

### Architectural principles

- WordPress is the only CMS/backend application layer.
- cPanel MySQL/MariaDB is the persistent database.
- WordPress Media Library owns CMS-managed media.
- Next.js is presentation/build tooling, not the CMS.
- GitHub stores and versions source code; it is not the runtime host.
- Apache serves the final static frontend.
- Node.js may be used only for builds; the cPanel Node selector being limited to Node 20.20.2 therefore does not force a permanently exposed EOL Node runtime.
- Netlify and Supabase remain only until final cutover/rollback confidence is achieved.

## 3. WordPress backend completed

A clean WordPress instance was created at `cms.saifulshuvo.com` rather than cloning the legacy Elementor site architecture.

Installed/active backend foundation:

- SaifulShuvo Headless theme
- Advanced Custom Fields PRO
- WPGraphQL
- WPGraphQL for ACF
- SaifulShuvo Core 0.2.1

`SaifulShuvo Core` provides the application model and backend logic, including:

- Project CPT
- Skill CPT
- Experience CPT
- Service CPT
- Project Categories taxonomy
- Technologies taxonomy
- Skill Groups taxonomy
- Homepage/Site Settings ACF Options model
- SEO and analytics settings
- Contact Inbox custom database table/admin
- Analytics/Web Vitals/Error custom tables/admin
- public REST endpoints
- GraphQL-compatible content structures

The theme deliberately contains no business schema or CMS logic.

## 4. Supabase → WordPress migration completed

A frozen Supabase CSV snapshot was preflighted by checksum and imported through the purpose-built migration importer. The import result was:

- **71 records created**
- **1 Site Settings record reused/updated**
- **0 import errors**

### Validation results

| Data | Source | WordPress | Status |
|---|---:|---:|---|
| Post Categories | 6 | 6 | PASS |
| Post Tags | 10 | 10 | PASS |
| Skill Groups | 6 | 6 | PASS |
| Skills | 26 | 26 | PASS |
| Projects | 9 | 9 | PASS |
| Experience | 4 | 4 | PASS |
| Services | 6 | 6 | PASS |
| Posts | 3 | 3 | PASS |
| Media | 1 | 1 | PASS |
| Site Settings | 1 | 1 | PASS |
| Skill → Skill Group relationships | 26 | 26 | PASS |
| Post → Category relationships | 3 | 3 | PASS |
| Project → Project Category relationships | 9 | 9 | PASS |

Source status fidelity was preserved:

- Projects: 8 published, 1 draft.
- Posts: all 3 source posts remain drafts.
- `post_tag_links` was empty, so tags were migrated without inventing post/tag relationships.
- The single media asset was `si-logo.png`. The source labeled it as profile-purpose media but Site Settings did not reference it, so it was intentionally imported but left unassigned as Profile Image.

Default WordPress sample content (`Hello world!`, sample comment/page where present) was removed after migration QA.

## 5. Frontend conversion in this repository

The original v0.9.0 frontend depended on Supabase, server-side Next.js routes/actions, a custom Next.js admin CMS, Tiptap, and Netlify runtime configuration. Those assumptions conflict with static export.

### New WordPress application adapter

Created `src/lib/wordpress/` with:

- environment helpers
- generic WPGraphQL client
- WordPress media mapper
- Site Settings query
- Homepage/Profile query mapping
- Projects query mapping
- Skills/Skill Groups mapping
- Experience mapping
- Services mapping
- Blog/Post/Category/Tag mapping
- SEO/Analytics setting mapping
- browser-side WordPress REST helper

React components continue to consume the existing application-facing TypeScript models rather than raw ACF field names. This keeps WordPress coupling isolated in the adapter layer.

### Static export conversion

`next.config.ts` now uses:

```ts
output: "export"
trailingSlash: true
images: { unoptimized: true }
```

All public dynamic routes now have `generateStaticParams()` and `dynamicParams = false`:

- Projects
- Blog posts
- Category archives
- Tag archives

Blog search/filter/pagination moved from request-time Server Component query parameters to client-side filtering of build-generated public content.

### Browser-side actions

The frontend no longer needs Next.js API handlers for its application actions.

Contact form now posts directly to:

```text
cms.saifulshuvo.com/wp-json/saifulshuvo/v1/contact
```

Analytics, Web Vitals and bounded client-error telemetry post directly to their WordPress REST endpoints.

### Removed legacy frontend backend/CMS

Removed from the current code tree:

- `src/app/admin/**`
- `src/app/auth/**`
- `src/app/api/**`
- `src/app/cv/route.ts`
- `src/app/contact/actions.ts`
- `src/proxy.ts`
- Supabase client/server/auth/query libraries
- old contact/server email layer
- old Supabase media/posts/projects/profile/SEO query layers
- admin React components
- Supabase migration directory
- Netlify configuration

Removed package-level application dependencies:

- `@supabase/ssr`
- `@supabase/supabase-js`
- Tiptap editor packages
- `sanitize-html`

## 6. cPanel/Apache production preparation

`pnpm build` now runs a post-build script that creates `out/.htaccess` containing:

- directory listing disabled
- static 404 handling
- optional `www` → apex redirect
- HSTS
- CSP
- X-Content-Type-Options
- X-Frame-Options
- Referrer-Policy
- Permissions-Policy
- COOP
- HTML revalidation-friendly caching
- long-lived immutable caching for static assets

A `pnpm check:static` script verifies that essential static export files exist before deployment.

## 7. What is deliberately not complete yet

The updated repository is a **release candidate, not a production-cutover claim**.

This build environment cannot resolve `cms.saifulshuvo.com` and does not contain the project node_modules, so a live end-to-end `pnpm build` against the real WordPress GraphQL endpoint was not executed here. The repository includes `pnpm verify:wordpress` specifically so the live GraphQL contract can be checked in an environment with network access before build/deploy.

The following remain continuation items:

1. Run GraphQL contract verification against the live CMS.
2. Install dependencies and run typecheck/build.
3. Fix any live WPGraphQL field-name/type differences found by the contract check/build.
4. Verify WordPress REST CORS for `saifulshuvo.com` and preview origin.
5. Deploy the static output to a preview subdomain/document root.
6. Perform visual, functional, SEO and responsive QA.
7. Add/assign final Profile Image and CV in WordPress if desired.
8. Configure secure content-change → static rebuild workflow.
9. Perform production domain cutover.
10. Monitor before disabling Netlify/Supabase.

## 8. Important current content behavior

Because all migrated blog posts are currently drafts, the public static blog will initially have no published articles. This is expected. Publishing a WordPress post and rebuilding will generate its static detail route.

The one draft Project is also excluded from public WPGraphQL results and therefore from the static public site until published.

## 9. Source-of-truth hierarchy going forward

1. **WordPress CMS** — content, media, settings, contacts, analytics.
2. **GitHub repository** — frontend source and deployment scripts.
3. **cPanel/Apache** — generated public static files.
4. **Legacy Supabase/Netlify** — rollback-only until retirement milestone.

Do not reintroduce business logic into the WordPress theme, Next.js `/admin`, WPCode snippets, or an alternate database.
