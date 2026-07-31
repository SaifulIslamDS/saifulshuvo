# Upgrade to v0.5.0

Upgrade from the verified v0.4.0 Project CMS release.

## 1. Preserve current work

```powershell
cd D:\MyProjects\portfolio
git status
```

Commit or stash any uncommitted changes before applying the upgrade.

## 2. Apply the upgrade package

From the extracted upgrade folder:

```powershell
powershell -ExecutionPolicy Bypass `
  -File .\apply-v0.5.0.ps1 `
  -Target "D:\MyProjects\portfolio"
```

The script preserves:

- `.git`
- `.env.local`
- `pnpm-lock.yaml`

## 3. Apply the database migration

In Supabase SQL Editor, run the entire file:

```text
supabase/migrations/202607310003_blog_cms.sql
```

Apply this before deploying the v0.5.0 source.

## 4. Install dependencies

```powershell
nvm use 22.23.2
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm clean
```

Commit the regenerated `pnpm-lock.yaml`.

The v0.5.0 scripts remove `.next` before type generation and production builds. This prevents stale `.next/dev/types` validators from being included after switching between `next dev`, `tsc` and `next build`.

## 5. Validate locally

```powershell
pnpm typecheck
pnpm build
pnpm dev
```

Test the routes listed in `docs/TESTING-CHECKLIST.md`.

## 6. Seed and publish a test article

The migration keeps the three existing planned posts as drafts and creates initial categories and tags. Open:

```text
http://localhost:3000/admin/posts
```

Edit one draft, add content, preview it and publish it.

## 7. Deploy

```powershell
git add .
git commit -m "feat: build full blog CMS"
git push origin main
```

If Netlify reuses an incompatible dependency cache, use **Clear cache and deploy site**.

## 8. Tag only after audit

```powershell
git tag -a v0.5.0 -m "v0.5.0 - Full Blog CMS"
git push origin v0.5.0
```
