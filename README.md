# Saiful Islam Portfolio

A mobile-responsive personal portfolio and single-owner CMS foundation built with Next.js, TypeScript, Supabase and Netlify.

## Current release

**v0.3.0 — CMS Foundation**

This release adds Google-only admin authentication, a single-admin allow-list, protected admin routes, Supabase SSR session handling, PostgreSQL content tables, Row Level Security policies and initial portfolio seed data. Project, post, skill and settings forms remain UI previews until their CRUD milestones.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Supabase Auth and PostgreSQL
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

Complete the Supabase and Google OAuth configuration before opening `/admin`.

## Documentation

All project documentation except this root README is kept in [`docs/`](./docs/README.md).

Start with:

1. [`docs/UPGRADE-v0.3.0.md`](./docs/UPGRADE-v0.3.0.md)
2. [`docs/SUPABASE-SETUP.md`](./docs/SUPABASE-SETUP.md)
3. [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
4. [`docs/SECURITY.md`](./docs/SECURITY.md)
5. [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

## Important routes

```text
/
/projects
/blog
/contact
/admin/login
/admin
/admin/projects
/admin/posts
/admin/skills
/admin/settings
/auth/callback
```

## Release boundary

Implemented in v0.3.0:

- Google OAuth login
- Server-verified admin session
- Server-side email allow-list
- Protected admin route group
- Sign-out flow
- Supabase SSR clients and Next.js proxy
- CMS database migration, RLS and seed data
- Configuration-safe public build

Deferred:

- Project CRUD
- Post editor persistence
- Skill and settings persistence
- Media library and CV storage
- Contact-form persistence
