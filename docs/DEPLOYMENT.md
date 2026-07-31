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

`ADMIN_EMAIL` remains supported for a single legacy value. v0.6.0 requires no new variable.

## v0.6.0 deployment order

1. Verify the deployed v0.5.0 commit and database.
2. Apply `202607310004_media_library.sql` to production Supabase.
3. Confirm the `portfolio-media` bucket and Storage policies exist.
4. Apply the v0.6.0 source upgrade.
5. Run `pnpm install`, `pnpm typecheck` and `pnpm build`.
6. Commit and push to `main`.
7. Clear the Netlify build cache only if needed.
8. Complete `docs/TESTING-CHECKLIST.md`.
9. Tag v0.6.0 only after production audit.

## Git commit

```powershell
git add .
git commit -m "feat: build media library and CV management"
git push origin main
```

## Release tag

```powershell
git tag -a v0.6.0 -m "v0.6.0 - Media Library, Profile Image and CV Management"
git push origin v0.6.0
```

## Post-deploy routes

```text
/
/cv
/projects/[published-slug]
/blog/[published-slug]
/admin/media
/admin/settings
/admin/projects/[id]/edit
/admin/posts/[id]/edit
```
