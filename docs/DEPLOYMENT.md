# Deployment

## Local validation

```powershell
nvm use 22.23.2
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
Node version: 22
```

Required environment variables:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ADMIN_EMAILS
```

`ADMIN_EMAIL` remains supported for a single legacy value.

## v0.5.0 deployment order

1. Back up or verify the current v0.4.0 commit.
2. Apply `202607310003_blog_cms.sql` to production Supabase.
3. Apply the v0.5.0 source upgrade.
4. Run `pnpm install` and commit the updated lockfile.
5. Run `pnpm typecheck` and `pnpm build` locally.
6. Push to `main`.
7. Use a clear-cache Netlify deployment if dependency cache conflicts occur.
8. Complete `docs/TESTING-CHECKLIST.md`.
9. Tag v0.5.0 only after production audit.

## Git commit

```powershell
git status
git add .
git commit -m "feat: build full blog CMS"
git push origin main
```

## Release tag

```powershell
git tag -a v0.5.0 -m "v0.5.0 - Full Blog CMS"
git push origin v0.5.0
```

## Post-deploy routes

```text
/
/blog
/blog/[published-slug]
/blog/category/[category-slug]
/blog/tag/[tag-slug]
/admin/posts
/admin/posts/new
/admin/posts/taxonomies
```
