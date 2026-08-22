# Upgrade to v0.4.0

## 1. Back up and copy files

Run the supplied upgrade script or copy the package payload over the existing repository. Preserve `.git`, `.env.local` and `pnpm-lock.yaml`.

## 2. Apply the migration

In Supabase SQL Editor, run the full contents of:

```text
supabase/migrations/202607310002_project_cms.sql
```

Do not rerun the v0.3.0 migration unless setting up a new database.

## 3. Update environment variables

Preferred:

```dotenv
ADMIN_EMAILS=first@gmail.com,second@gmail.com
```

`ADMIN_EMAIL` remains backward compatible. Every approved account must also be inserted into `private.admin_allowlist`.

## 4. Install and verify

```powershell
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

## 5. Test before deployment

Follow `docs/TESTING-CHECKLIST.md`. Apply the migration before deploying the code to avoid admin queries requesting columns that do not exist yet.
