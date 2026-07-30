# Saiful Islam — Portfolio UI

A responsive, CMS-ready personal portfolio frontend built with Next.js, TypeScript and custom CSS. This phase contains the complete public UI and an admin-dashboard preview. Authentication, Supabase, content CRUD, media uploads and form delivery are intentionally deferred to the backend/CMS phase.

## Included routes

### Public website

- `/` — Homepage
- `/projects` — Project collection
- `/projects/[slug]` — Static project case-study pages
- `/blog` — Article listing UI
- `/contact` — Contact form UI

### Admin preview

- `/admin` — Dashboard
- `/admin/projects` — Project manager
- `/admin/posts` — Blog manager and editor preview
- `/admin/skills` — Skill manager
- `/admin/settings` — Profile, social and SEO settings

The admin area is intentionally public in this UI-only version. Do not enter private data. Authentication and authorization will be added before production use.

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Custom responsive CSS
- No external UI or icon dependency
- Netlify-ready configuration
- pnpm package manager

## Local setup

Prerequisites:

- Node.js 22
- Corepack
- Git

```bash
corepack enable
corepack prepare pnpm@10.14.0 --activate
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

Run production checks:

```bash
pnpm typecheck
pnpm build
pnpm start
```

## Add this project to the existing GitHub repository

Assuming the repository is:

```text
https://github.com/SaifulIslamDS/portfolio
```

Clone the empty repository:

```bash
git clone https://github.com/SaifulIslamDS/portfolio.git
cd portfolio
```

Copy all files from this project into that folder, then run:

```bash
corepack enable
corepack prepare pnpm@10.14.0 --activate
pnpm install
pnpm typecheck
pnpm build

git add .
git commit -m "feat: add responsive portfolio and admin UI"
git push origin main
```

Commit the generated `pnpm-lock.yaml` produced by `pnpm install`.

## Deploy to Netlify

1. Sign in to Netlify.
2. Select **Add new project** → **Import an existing project**.
3. Connect GitHub and select `SaifulIslamDS/portfolio`.
4. Netlify should detect Next.js automatically.
5. Confirm:

```text
Base directory:        [blank]
Build command:         pnpm build
Publish directory:     .next
Production branch:     main
```

6. Select **Deploy**.

The included `netlify.toml` already defines the build command, publish directory, Node version and security headers. Netlify's current Next.js adapter supports App Router deployments without a manually installed plugin.

## Content customization

Most portfolio content is centralized in:

```text
src/data/portfolio.ts
```

Update this file to change:

- Skills
- Services
- Projects
- Project case-study highlights
- Planned articles

Update page-specific text in:

```text
src/app/page.tsx
src/app/contact/page.tsx
src/app/admin/settings/page.tsx
```

The portrait is a CSS placeholder and does not contain a personal image.

## Backend/CMS phase roadmap

Recommended next architecture:

1. Supabase PostgreSQL schema
2. Supabase Google authentication restricted to the owner
3. Row Level Security policies
4. Project, post, skill, profile and settings CRUD
5. Supabase Storage media library
6. Rich-text editor
7. Draft, preview, publish and archive workflow
8. Contact form persistence and email notification
9. CV upload and active-version management
10. SEO/Open Graph content from the CMS
11. Admin route protection
12. Migration from static data to database-backed content

## Domain migration later

After the Netlify preview has been reviewed, connect:

```text
saifulshuvo.com
www.saifulshuvo.com
```

Do not change the current WordPress DNS until the new site has passed content, SEO, redirect and form testing.
