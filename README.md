# Saiful Islam Portfolio

A mobile-responsive personal portfolio and single-owner CMS built with Next.js, TypeScript, Supabase and Netlify.

## Current release

**v0.7.0 — Skills, Experience and Homepage CMS**

The CMS now manages public positioning, hero and About copy, homepage statistics, services, process and CTA sections, section visibility, skill groups and individual skills, and the professional experience timeline. Project, blog, media, profile-image and CV modules remain integrated.

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
supabase/migrations/202607310005_profile_homepage_cms.sql
```

## Important routes

```text
/
/cv
/projects
/blog
/admin
/admin/homepage
/admin/skills
/admin/experience
/admin/projects
/admin/posts
/admin/media
/admin/settings
```

## Documentation

All documentation except this README is stored in [`docs/`](./docs/README.md).

Start with:

1. [`docs/UPGRADE-v0.7.0.md`](./docs/UPGRADE-v0.7.0.md)
2. [`docs/PROFILE-HOMEPAGE-CMS.md`](./docs/PROFILE-HOMEPAGE-CMS.md)
3. [`docs/TESTING-CHECKLIST.md`](./docs/TESTING-CHECKLIST.md)
4. [`docs/RELEASE-NOTES-v0.7.0.md`](./docs/RELEASE-NOTES-v0.7.0.md)
