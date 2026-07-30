# Upgrade to v0.3.0

## 1. Copy the patch

Extract the v0.3.0 patch into the existing repository root and replace matching files.

Do not delete:

```text
.git/
pnpm-lock.yaml
```

The old root documents are moved into `docs/` by this release.

## 2. Install dependencies

```powershell
nvm use 22.23.2
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
```

This adds:

```text
@supabase/ssr
@supabase/supabase-js
```

## 3. Configure Supabase

Complete every step in `docs/SUPABASE-SETUP.md`.

## 4. Validate

```powershell
pnpm typecheck
pnpm build
pnpm dev
```

Test the public routes, login, approved account, rejected account and sign-out flow.

## 5. Commit

```powershell
git add .
git commit -m "feat: build CMS authentication foundation"
git push origin main
```

## 6. Deploy and tag

After the Netlify audit:

```powershell
git tag -a v0.3.0 -m "v0.3.0 - CMS Foundation"
git push origin v0.3.0
```
