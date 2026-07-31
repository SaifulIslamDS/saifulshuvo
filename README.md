# Saiful Islam Portfolio

A mobile-responsive personal portfolio and single-owner content-management system built with Next.js, TypeScript, Supabase, Tiptap and Netlify.

## Current release

**v0.5.0 — Full Blog CMS**

The portfolio now includes a secure long-form publishing system. Approved Google administrators can write with a rich editor, manage categories and tags, preview every status, publish immediately or schedule publication, maintain SEO fields, inspect version history, restore earlier revisions and control the full draft/published/archived lifecycle.

## Stack

- Next.js 16 App Router and React 19
- TypeScript
- Supabase Auth, PostgreSQL and Row Level Security
- Supabase SSR cookie sessions
- Tiptap 3 rich-text editor
- Netlify deployment
- pnpm 11

## Local setup

```powershell
nvm use 22.23.2
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
Copy-Item .env.example .env.local
pnpm clean
pnpm typecheck
pnpm build
pnpm dev
```

Apply migrations in order:

```text
supabase/migrations/202607310001_cms_foundation.sql
supabase/migrations/202607310002_project_cms.sql
supabase/migrations/202607310003_blog_cms.sql
```

## Documentation

All project documentation except this README is stored in [`docs/`](./docs/README.md).

Start with:

1. [`docs/UPGRADE-v0.5.0.md`](./docs/UPGRADE-v0.5.0.md)
2. [`docs/BLOG-CMS.md`](./docs/BLOG-CMS.md)
3. [`docs/SUPABASE-SETUP.md`](./docs/SUPABASE-SETUP.md)
4. [`docs/TESTING-CHECKLIST.md`](./docs/TESTING-CHECKLIST.md)
5. [`docs/RELEASE-NOTES-v0.5.0.md`](./docs/RELEASE-NOTES-v0.5.0.md)

## Important routes

```text
/
/projects
/projects/[slug]
/blog
/blog/[slug]
/blog/category/[slug]
/blog/tag/[slug]
/admin/login
/admin
/admin/projects
/admin/posts
/admin/posts/new
/admin/posts/[id]/edit
/admin/posts/[id]/preview
/admin/posts/[id]/revisions
/admin/posts/taxonomies
```

## Release boundary

Implemented in v0.5.0:

- Supabase-backed blog library
- Tiptap rich-text editor
- Draft, scheduled, published and archived visibility
- Category and tag CRUD
- Featured article and display-order controls
- Admin previews for posts and historical revisions
- Immutable revision snapshots with restore-as-new-draft workflow
- Automatic reading-time calculation
- Dynamic public blog, category and tag archives
- Per-article metadata, canonical URL, Open Graph and Article JSON-LD
- Blog, taxonomy and article sitemap entries
- Homepage latest-insights section
- Post lifecycle audit events

Deferred:

- Media upload and image library
- Profile, skills, experience and homepage CMS
- Contact inbox and email notifications
- CV management
- Analytics and WordPress migration
