# Upgrade to v0.9.0

Upgrade from **v0.8.0**.

## 1. Preserve the current state

```powershell
cd D:\MyProjects\portfolio
git status
git add .
git commit -m "chore: preserve v0.8.0 working state"
git push origin main
```

Skip the commit when the working tree is already clean and v0.8.0 is pushed.

## 2. Apply the upgrade package

```powershell
cd "D:\Path\To\portfolio-v0.9.0-upgrade"

powershell -ExecutionPolicy Bypass `
  -File .\apply-v0.9.0.ps1 `
  -Target "D:\MyProjects\portfolio"
```

The script preserves `.git`, `.env.local` and `pnpm-lock.yaml`, removes stale `.next` output and copies the v0.9.0 payload.

## 3. Apply the migration

Run once in Supabase SQL Editor:

```text
supabase/migrations/202607310007_seo_analytics_hardening.sql
```

Verify:

```sql
select
  seo_default_title,
  seo_index_site,
  analytics_provider,
  analytics_retention_days
from public.site_settings
where id = 'primary';

select count(*) from public.telemetry_events;
```

## 4. Add the optional telemetry secret

Add locally and in Netlify:

```dotenv
TELEMETRY_HASH_SECRET=replace-with-a-random-secret
```

Generate one:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

When omitted, the application reuses `CONTACT_FINGERPRINT_SECRET`. No Google or Plausible key belongs in environment variables; their public IDs are managed from `/admin/seo`.

## 5. Validate locally

```powershell
nvm use 24.18.1
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

Test:

```text
/
/projects
/blog
/contact
/robots.txt
/sitemap.xml
/opengraph-image
/manifest.webmanifest
/api/health
/admin/seo
/admin/analytics
```

## 6. Configure production SEO and analytics

1. Open `/admin/seo`.
2. Confirm title, description, keywords and social image.
3. Keep public indexing enabled only on the production domain.
4. Add Search Console/Bing tokens when available.
5. Select no provider, Google Analytics 4 or Plausible.
6. Review consent, DNT and retention settings.
7. Save and verify the public page source.

## 7. Commit and deploy

```powershell
git add .
git commit -m "feat: harden SEO analytics and production readiness"
git push origin main
```

After deployment, complete `docs/PRODUCTION-CHECKLIST.md` before tagging.
