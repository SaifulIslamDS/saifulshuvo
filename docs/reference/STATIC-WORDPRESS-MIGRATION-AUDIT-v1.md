# SaifulShuvo Static WordPress Migration Audit v1

Source reviewed: `saifulshuvo-main-current.zip` (frontend v0.9.0)

## Final architecture baseline

- GitHub: source control only
- `saifulshuvo.com`: Next.js 16 static export hosted by cPanel/Apache
- `cms.saifulshuvo.com`: WordPress CMS/backend
- WordPress stack: ACF Pro + WPGraphQL + WPGraphQL for ACF + SaifulShuvo Core
- Database: cPanel MySQL/MariaDB
- Media: WordPress Media Library
- Supabase/Netlify: retained only during migration, removed after validation
- Dynamic public writes: browser -> WordPress REST API
- Publishing updates: secure cPanel rebuild/deployment workflow, not ISR/revalidateTag

## Repository findings

### Current server-runtime dependencies that block `output: "export"`

1. `src/app/admin/**` — full Supabase admin CMS and Server Actions.
2. `src/app/auth/callback/route.ts` — Supabase Auth callback.
3. `src/proxy.ts` + `src/lib/supabase/proxy.ts` — request-time auth/session proxy.
4. `src/app/contact/actions.ts` — Server Action + request headers + Supabase RPC + Resend.
5. `src/app/api/telemetry/route.ts` — dynamic POST Route Handler.
6. `src/app/api/health/route.ts` — runtime API route; should be removed or converted only if static output is meaningful.
7. `src/app/cv/route.ts` — request-aware redirect Route Handler.
8. `next.config.ts` — runtime `headers()` and Server Actions configuration.
9. Dynamic public routes lack `generateStaticParams()`:
   - `/blog/[slug]`
   - `/blog/category/[slug]`
   - `/blog/tag/[slug]`
   - `/projects/[slug]`
10. Blog search/filter/pagination is rendered from server `searchParams`; for a static site it must move to client-side filtering/search or pre-generated pagination routes.
11. Public data queries currently use `@supabase/ssr` server clients and `cookies()`; these must be replaced by build-time WordPress GraphQL requests.
12. Analytics client posts to `/api/telemetry`; it must post directly to WordPress REST endpoints.
13. `/cv` should become a direct CMS-managed WordPress Media URL or a generated static page/link, not a runtime redirect.
14. Security headers currently live in `next.config.ts`; they must move to cPanel Apache `.htaccess`.

## Existing Supabase information model that must be preserved

### Homepage / Site Settings

Current frontend uses more than the original WordPress Core 0.1.1 schema:

- owner name, professional title, short bio, contact email, location, availability
- social links
- profile image and active CV
- hero eyebrow, heading, emphasis, lead, primary/secondary CTAs
- about eyebrow/title/description/paragraphs
- positioning title/points
- process items
- work principles
- CTA section
- eight homepage visibility controls
- homepage stats
- global SEO/title template/keywords/OG image/search verification
- analytics provider/consent/DNT/collection/retention settings

### Projects

Current model includes:

- slug/title/category/summary/body
- publication status + project state
- featured
- stack
- highlights
- accent
- role/source/live URL
- problem/solution/outcomes
- cover/gallery
- sort order
- SEO
- published/archive/version timestamps

### Blog

Current model includes native-like categories/tags plus:

- HTML content and editor JSON
- featured flag
- read time
- featured/OG media
- canonical/SEO
- sort order
- revisions/scheduling/archive lifecycle

WordPress native posts, revisions, categories, tags and publish scheduling can replace much of this.

### Skills

Current model is grouped, not flat:

- Skill Group: title/icon/description/accent/sort/active/featured
- Skill: name/description/proficiency label/proficiency level/years/evidence URL/learning/featured/active/sort

### Experience

- title/organization/employment type/location
- dates/current/period label
- summary/achievements/technologies
- featured/active/sort

### Services

- title/icon/description/accent/active/sort

### Contact Inbox

Current model includes:

- full name/email/company/topic/subject/message/source page
- status/priority/admin notes
- privacy fingerprint
- notification state
- read/replied/archived timestamps

### Analytics

Current model captures page views, Web Vitals and client errors with anonymous session hashing and retention settings.

## Critical conclusion

Do not switch the frontend to WordPress yet. `SaifulShuvo Core 0.1.1` does not fully represent the v0.9.0 Supabase CMS model, so migrating now would discard useful information and admin behavior.

The correct next phase is:

1. Upgrade WordPress schema to migration parity.
2. Verify ACF fields + WPGraphQL exposure.
3. Export Supabase data.
4. Build deterministic Supabase -> WordPress transformation/import.
5. Validate counts, slugs, content, taxonomies, media and SEO.
6. Only then replace frontend data providers and enable static export.

## Prepared backend update

`saifulshuvo-core-v0.2.0.zip` has been prepared to close the main schema gaps before data migration.
