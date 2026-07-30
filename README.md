# Saiful Islam Portfolio

A mobile-responsive personal portfolio and single-owner CMS built with Next.js, TypeScript, Supabase and Netlify.

## Current release

**v0.4.0 — Project CMS**

The project portfolio is now database-backed. An approved Google administrator can create, edit, preview, publish, unpublish, feature, order, archive, restore and permanently delete archived projects. Public project pages, the homepage featured collection and the sitemap read published Supabase content.

## Stack

- Next.js 16 App Router and React 19
- TypeScript
- Supabase Auth, PostgreSQL and Row Level Security
- Supabase SSR cookie sessions
- Netlify deployment
- pnpm 11

## Local setup

```powershell
nvm use 22.23.2
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
Copy-Item .env.example .env.local
pnpm typecheck
pnpm build
pnpm dev
```

Apply both migrations in order before using Project CMS:

```text
supabase/migrations/202607310001_cms_foundation.sql
supabase/migrations/202607310002_project_cms.sql
```

## Documentation

All project documentation except this README is in [`docs/`](./docs/README.md).

Start with:

1. [`docs/UPGRADE-v0.4.0.md`](./docs/UPGRADE-v0.4.0.md)
2. [`docs/PROJECT-CMS.md`](./docs/PROJECT-CMS.md)
3. [`docs/SUPABASE-SETUP.md`](./docs/SUPABASE-SETUP.md)
4. [`docs/TESTING-CHECKLIST.md`](./docs/TESTING-CHECKLIST.md)
5. [`docs/RELEASE-NOTES-v0.4.0.md`](./docs/RELEASE-NOTES-v0.4.0.md)

## Important routes

```text
/
/projects
/projects/[slug]
/admin/login
/admin
/admin/projects
/admin/projects/new
/admin/projects/[id]/edit
/admin/projects/[id]/preview
```

## Release boundary

Implemented in v0.4.0:

- Supabase-backed project library
- Create and edit project forms
- Draft, publish, unpublish, archive and restore lifecycle
- Permanent deletion restricted to archived projects
- Featured and display-order controls
- Admin preview for every publication status
- Dynamic public project pages and metadata
- Homepage featured projects from CMS
- Database lifecycle/version trigger
- Immutable project audit events
- Multiple application admin emails through `ADMIN_EMAILS`

Deferred:

- Blog CMS
- Skills and site-settings persistence
- Media upload and image library
- Contact inbox and CV management
