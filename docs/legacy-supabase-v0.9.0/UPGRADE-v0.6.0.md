# Upgrade to v0.6.0

## Prerequisite

The repository must already contain the completed v0.5.0 Blog CMS.

## Apply the package

```powershell
cd "D:\Path\To\portfolio-v0.6.0-upgrade"

powershell -ExecutionPolicy Bypass `
  -File .\apply-v0.6.0.ps1 `
  -Target "D:\MyProjects\portfolio"
```

The script preserves `.git`, `.env.local` and `pnpm-lock.yaml`, copies changed files, and removes stale `.next` output.

## Apply the database migration

Run this migration once in Supabase SQL Editor before deploying the code:

```text
supabase/migrations/202607310004_media_library.sql
```

The migration creates the `portfolio-media` bucket, media and CV tables, project-gallery relations, new media foreign keys, Storage policies, lifecycle protection and audit triggers.

## Install and verify

```powershell
cd D:\MyProjects\portfolio
nvm use 22.23.2
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

No new npm dependency or environment variable is required.

## Production deployment

```powershell
git add .
git commit -m "feat: build media library and CV management"
git push origin main
```

After the Netlify audit succeeds:

```powershell
git tag -a v0.6.0 -m "v0.6.0 - Media Library, Profile Image and CV Management"
git push origin v0.6.0
```
