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
Node version source: .nvmrc → 24.18.1
```

Required CMS variables:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ADMIN_EMAILS
```

v0.8.0 notification variables:

```text
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_NOTIFICATION_TO
CONTACT_FINGERPRINT_SECRET
```

Set sensitive variables in the Netlify UI, not in `netlify.toml` or Git.

Email configuration is optional for contact capture. Without it, messages remain functional and record `skipped` notification status.

## v0.8.0 deployment order

1. Confirm the v0.7.0 production site and database are healthy.
2. Apply `202607310006_contact_inbox.sql` in production Supabase.
3. Configure Resend and the four contact environment variables.
4. Apply the v0.8.0 source upgrade.
5. Run `pnpm install`, `pnpm typecheck` and `pnpm build` locally.
6. Commit and push to `main`.
7. Audit `/contact`, `/admin/inbox` and one message-detail route.
8. Confirm notification status and email delivery.
9. Complete `docs/TESTING-CHECKLIST.md`.
10. Tag v0.8.0 only after production approval.

## Git commit

```powershell
git add .
git commit -m "feat: build contact inbox and email notifications"
git push origin main
```

## Release tag

```powershell
git tag -a v0.8.0 -m "v0.8.0 - Contact Inbox and Email Notifications"
git push origin v0.8.0
```

## Post-deploy routes

```text
/contact
/admin
/admin/inbox
/admin/inbox/[id]
```
