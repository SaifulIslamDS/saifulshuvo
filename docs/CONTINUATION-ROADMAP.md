# SaifulShuvo — Continuation Roadmap

**Starting point:** WordPress migration validated; frontend converted to WordPress/static-export release candidate.  
**Goal:** safely cut over `saifulshuvo.com` to a cPanel-hosted static Next.js frontend backed by `cms.saifulshuvo.com`.

## Phase 1 — Live WordPress contract verification

### Tasks

1. Ensure WordPress plugins remain active:
   - ACF Pro
   - WPGraphQL
   - WPGraphQL for ACF
   - SaifulShuvo Core 0.2.1+
2. From a machine with internet access:
   ```bash
   cp .env.example .env.local
   pnpm install --frozen-lockfile
   pnpm verify:wordpress
   ```
3. If the verifier reports a GraphQL field mismatch, compare the generated GraphQL schema in GraphiQL IDE and adjust only the adapter query/mapping layer.
4. Do not change public components to raw ACF field names.

### Gate

- `pnpm verify:wordpress` exits successfully.
- Homepage Site Settings are returned.
- Projects, Skills, Experience and Services can be sampled through GraphQL.

---

## Phase 2 — Local/static build verification

### Tasks

```bash
pnpm typecheck
pnpm build
pnpm check:static
```

Expected output:

```text
out/
├── index.html
├── 404.html
├── .htaccess
├── _next/
├── projects/
├── blog/
├── contact/
├── privacy/
├── robots.txt
└── sitemap.xml
```

Check that published projects generate detail folders. With current CMS status, do not expect draft projects/posts to generate public routes.

### Gate

- zero TypeScript errors
- zero build errors
- static check passes
- no Supabase/Netlify/admin route is generated

---

## Phase 3 — WordPress REST/CORS validation

The public frontend and CMS are separate origins.

### Verify

From the preview/public origin, test:

- Contact submission
- Analytics page view (if enabled/consented)
- Web Vitals endpoint
- Client errors endpoint

Confirm WordPress permits the intended frontend origins and does not use permissive CORS unnecessarily.

### Gate

- contact appears in WordPress Contact Inbox
- no browser CORS failure
- no raw IP persisted in contact record
- rate limiting and honeypot remain operational

---

## Phase 4 — cPanel preview deployment

### Recommended structure

Create a preview subdomain/document root such as:

```text
preview.saifulshuvo.com
/home/<cpanel-user>/public_html_preview/
```

Upload **contents of `out/`**, not the source repository, into the preview document root.

### QA checklist

- Homepage
- About/Skills sections
- all 8 currently published projects
- project detail pages
- blog empty state while posts are drafts
- blog category/tag archives
- Contact form
- Privacy page
- theme toggle
- desktop/mobile navigation
- sitemap
- robots
- canonical metadata
- OG metadata/image
- JSON-LD
- 404 page
- HTTPS
- `.htaccess` headers
- no console errors

### Gate

Preview is functionally and visually acceptable on desktop/mobile and contains no environment-specific broken URLs.

---

## Phase 5 — CMS finishing items

Before production cutover:

1. Assign a real Profile Image in Homepage/Site Settings if desired.
2. Upload/select the active CV if desired.
3. Review Project draft titled `Draft` and either complete/publish/rename it or keep it intentionally private.
4. Review the 3 draft blog posts and publish only when ready.
5. Review SEO title/description/default OG settings.
6. Confirm `index_site` is intentional for production.

### Gate

Content and SEO are production-ready.

---

## Phase 6 — Secure rebuild workflow

Static content does not update until a new build is deployed.

### Target flow

```text
WordPress content change
        │
        ▼
controlled rebuild trigger
        │
        ▼
GitHub/cPanel build workspace
        │
        ▼
pnpm verify:wordpress
pnpm build
pnpm check:static
        │
        ▼
atomic copy/swap of out/
        │
        ▼
saifulshuvo.com
```

### Security rules

- Do not expose a public endpoint that executes arbitrary shell commands.
- Use a strong secret or authenticated internal trigger.
- Prefer an atomic deploy directory/symlink/swap so a failed build never replaces the live site.
- Keep previous successful static build for rollback.
- Log deploy time, commit SHA and result.

### Interim option

Until automatic rebuild is implemented, rebuild/deploy manually after CMS publishing. This is safer than rushing shell-trigger automation.

---

## Phase 7 — Production cutover

### Before switch

- backup current production
- keep Netlify deployment reachable for rollback
- save DNS/cPanel state
- confirm SSL on apex and www
- confirm CMS remains `noindex`

### Cutover

1. Deploy validated `out/` to the production document root for `saifulshuvo.com`.
2. Redirect `www.saifulshuvo.com` → apex.
3. Purge any hosting/browser cache as needed.
4. Run smoke tests immediately.

### Gate

- homepage 200
- project routes 200
- contact works
- CMS GraphQL/REST works
- sitemap/robots correct
- Search Console canonical/domain behavior correct
- no legacy production URL loss

---

## Phase 8 — Observation period

Keep Netlify and Supabase intact but unused for a short rollback window.

Monitor:

- 404s
- contact submissions
- CMS availability
- static deployment reliability
- analytics errors
- browser console/network failures
- Search Console indexing

Recommended: do not delete Supabase immediately after DNS cutover.

---

## Phase 9 — Retire legacy services

After rollback confidence is established:

### Netlify

- remove custom domain if still attached
- retain deployment history briefly if useful
- then archive/delete the site as appropriate

### Supabase

Before deletion:

- preserve final database export
- preserve storage export if any asset remains referenced
- verify no source code/env vars refer to Supabase
- verify WordPress data/media independently
- archive important migration evidence
- then remove the project/service

### Repository

- merge migration branch into `main`
- tag stable release, e.g. `v1.0.0`
- remove any remaining legacy secrets from GitHub/cPanel/Netlify

---

## Phase 10 — Post-cutover improvements

Not blockers for launch:

- automated rebuild/deploy
- deployment health/rollback tooling
- WordPress 2FA/security hardening
- SMTP deliverability
- scheduled WordPress/database/media backups
- analytics dashboard refinement
- profile/CV media management
- frontend CSS cleanup of now-unused legacy admin editor selectors
- prune unused package snapshots from lockfile during a normal `pnpm install`
- add CI typecheck/build once desired

## Definition of done

The migration is fully complete when:

- WordPress is the only CMS/backend/data source.
- cPanel MySQL/MariaDB is the only application database.
- WordPress Media Library owns CMS media.
- `saifulshuvo.com` is served from a static Next.js export on cPanel/Apache.
- browser actions use WordPress REST only.
- GitHub contains no Supabase/admin CMS dependency.
- Netlify is no longer required.
- Supabase is safely retired after backup/rollback period.
- content publishing has a documented repeatable rebuild/deploy procedure.
