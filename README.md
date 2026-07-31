# Saiful Islam Portfolio

A mobile-responsive personal portfolio and single-owner CMS built with Next.js, TypeScript, Supabase and Netlify.

## Current release

**v0.6.0 — Media Library, Profile Image and CV Management**

The CMS now includes protected Supabase Storage uploads, a searchable media library, safe media lifecycle controls, public profile-image selection, CV versioning, project galleries, and blog/project artwork assignment.

## Stack

- Next.js 16 App Router and React 19
- TypeScript
- Supabase Auth, PostgreSQL, Storage and Row Level Security
- Supabase SSR cookie sessions
- Tiptap rich-text editor
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

Apply migrations in order:

```text
supabase/migrations/202607310001_cms_foundation.sql
supabase/migrations/202607310002_project_cms.sql
supabase/migrations/202607310003_blog_cms.sql
supabase/migrations/202607310004_media_library.sql
```

## Important routes

```text
/
/cv
/projects
/blog
/admin
/admin/projects
/admin/posts
/admin/media
/admin/settings
```

## Documentation

All documentation except this README is stored in [`docs/`](./docs/README.md).

Start with:

1. [`docs/UPGRADE-v0.6.0.md`](./docs/UPGRADE-v0.6.0.md)
2. [`docs/MEDIA-LIBRARY.md`](./docs/MEDIA-LIBRARY.md)
3. [`docs/TESTING-CHECKLIST.md`](./docs/TESTING-CHECKLIST.md)
4. [`docs/RELEASE-NOTES-v0.6.0.md`](./docs/RELEASE-NOTES-v0.6.0.md)
