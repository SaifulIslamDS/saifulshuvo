# Upgrade to v0.8.0

Upgrade from **v0.7.0 — Skills, Experience and Homepage CMS**.

## 1. Preserve the current working tree

```powershell
cd D:\MyProjects\portfolio
git status
```

Commit any intended v0.7.0 changes before applying the upgrade.

## 2. Apply the upgrade package

```powershell
cd "D:\Path\To\portfolio-v0.8.0-upgrade"

powershell -ExecutionPolicy Bypass `
  -File .\apply-v0.8.0.ps1 `
  -Target "D:\MyProjects\portfolio"
```

The script preserves `.git`, `.env.local` and `pnpm-lock.yaml`, and removes stale `.next` output.

## 3. Apply the database migration

Run once in Supabase SQL Editor:

```text
supabase/migrations/202607310006_contact_inbox.sql
```

Verify:

```sql
select relname, relrowsecurity
from pg_class
where relname = 'contact_messages';

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('submit_contact_message', 'finalize_contact_notification');
```

## 4. Configure contact notification variables

Copy the new variables from `.env.example` to `.env.local` and Netlify:

```dotenv
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_FROM_EMAIL=Saiful Islam Portfolio <contact@your-verified-domain.com>
CONTACT_NOTIFICATION_TO=your-email@example.com
CONTACT_FINGERPRINT_SECRET=replace-with-a-random-secret
```

Generate the fingerprint secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Email variables are optional for database capture. Without them, messages are still saved and their notification status becomes `skipped`.

## 5. Use Node.js 24 LTS

v0.8.0 updates the project runtime from Node.js 22 to Node.js 24 LTS.

```powershell
nvm install 24.18.1
nvm use 24.18.1
node -v
```

Expected:

```text
v24.18.1
```

## 6. Install and verify

```powershell
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## 7. Functional test

1. Submit a valid message at `/contact`.
2. Confirm success feedback appears.
3. Confirm the record exists at `/admin/inbox`.
4. Open the record and save notes, priority and status.
5. Reply through the mailto action and mark it replied.
6. Archive, restore and delete a temporary message.
7. Verify `notification_status` is `sent`, `failed` or `skipped` as expected.
8. Retry a failed/skipped notification after configuring Resend.
9. Submit three messages, then verify the fourth request within fifteen minutes is rate-limited.

## 8. Commit

```powershell
git add .
git commit -m "feat: build contact inbox and email notifications"
git push origin main
```

Tag only after the production audit:

```powershell
git tag -a v0.8.0 -m "v0.8.0 - Contact Inbox and Email Notifications"
git push origin v0.8.0
```
