# Deployment

## Local validation

```powershell
nvm install 24.18.1
nvm use 24.18.1
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## Netlify configuration

The repository includes `netlify.toml`:

```text
Build command: pnpm build
Publish directory: .next
Node version: 24.18.1
```

Next.js configuration returns security and cache headers for SSR, route handlers, admin, auth and API responses. Netlify file headers provide fallback protection and immutable caching for static chunks.

## Required variables

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ADMIN_EMAILS
```

Contact notification variables:

```text
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_NOTIFICATION_TO
CONTACT_FINGERPRINT_SECRET
```

v0.9.0 optional variable:

```text
TELEMETRY_HASH_SECRET
```

Set server-only secrets in the Netlify UI. Never prefix them with `NEXT_PUBLIC_` or store them in Git.

## v0.9.0 deployment order

1. Confirm the v0.8.0 production site and database are healthy.
2. Apply `202607310007_seo_analytics_hardening.sql` in production Supabase.
3. Add `TELEMETRY_HASH_SECRET` or intentionally reuse `CONTACT_FINGERPRINT_SECRET`.
4. Apply the v0.9.0 source upgrade.
5. Run `pnpm install`, `pnpm typecheck` and `pnpm build` locally.
6. Commit and push to `main`.
7. Open `/admin/seo` and confirm production metadata/indexing settings.
8. Audit `/robots.txt`, `/sitemap.xml`, `/opengraph-image` and `/api/health`.
9. Review CSP/browser console output and OAuth login.
10. Complete `docs/PRODUCTION-CHECKLIST.md` before tagging.

## Git commit

```powershell
git add .
git commit -m "feat: harden SEO analytics and production readiness"
git push origin main
```

## Release tag

```powershell
git tag -a v0.9.0 -m "v0.9.0 - SEO Analytics Performance and Production Hardening"
git push origin v0.9.0
```
