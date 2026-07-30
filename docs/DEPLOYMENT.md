# Deployment

## Local validation

```powershell
nvm use 22.23.2
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm typecheck
pnpm build
```

Run the local app:

```powershell
pnpm dev
```

## Git commit

```powershell
git status
git add .
git commit -m "feat: build CMS authentication foundation"
git push origin main
```

## Netlify build configuration

The repository already includes `netlify.toml`:

```text
Build command: pnpm build
Publish directory: .next
Node version: 22
```

Add the four environment variables described in `SUPABASE-SETUP.md` before deploying the protected admin flow.

## Post-deploy checks

- `/` loads in light and dark themes
- `/projects`, `/blog` and `/contact` load
- `/admin` redirects to `/admin/login` when signed out
- Google login returns through `/auth/callback`
- Approved account enters `/admin`
- Unapproved account is rejected
- Sign-out returns to the login page
- Direct refresh on protected admin routes works
- Netlify preview redirect URL is accepted by Supabase

## Release tag

Tag only after local and production audits pass:

```powershell
git tag -a v0.3.0 -m "v0.3.0 - CMS Foundation"
git push origin v0.3.0
```
