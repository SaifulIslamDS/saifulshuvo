# Saiful Islam Portfolio

A responsive Next.js portfolio UI for Saiful Islam, positioned around data analytics, web application development, SaaS product work and practical AI-assisted solutions.

## Current release

`v0.2.0 — Real Portfolio Content Integration`

## Technology

- Next.js 16 App Router
- React 19
- TypeScript
- Custom responsive CSS
- pnpm 11
- Netlify deployment

No database, authentication or CMS backend is connected yet.

## v0.2.0 highlights

- Real professional positioning and contact information
- Expanded analytics, development, AI, business and creative skills
- Eight detailed project case-study routes
- Verified external links where available
- Responsive icon-only light/dark theme toggle
- Theme preference persistence
- Mobile and desktop navigation support
- CMS-style admin UI preview

## Routes

```text
/
├── /projects
├── /projects/[slug]
├── /blog
├── /contact
└── /admin
    ├── /admin/projects
    ├── /admin/posts
    ├── /admin/skills
    └── /admin/settings
```

## Requirements

- Node.js 22
- pnpm 11.18.0

The repository includes:

```text
.nvmrc
package.json
pnpm-workspace.yaml
netlify.toml
```

The pnpm workspace configuration keeps the minimum-release-age security policy and explicitly approves the trusted `sharp` build script required by the Next.js image toolchain.

## Local development

```powershell
nvm use 22.23.2
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm typecheck
pnpm build
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Upgrading an existing v0.1.0 repository

Extract the v0.2.0 patch and copy its files into the existing repository root. Keep your existing `.git/` directory and `pnpm-lock.yaml`.

Then run:

```powershell
pnpm install
pnpm typecheck
pnpm build
```

## Netlify

Recommended settings:

```text
Base directory:       [blank]
Build command:        pnpm build
Publish directory:    .next
Production branch:    main
```

The same values are declared in `netlify.toml`.

## Theme behavior

- First visit: follows the device light/dark preference
- Later visits: uses the visitor's saved choice
- Toggle: icon-only control beside the main navigation actions
- Mobile: the same toggle remains visible beside the menu button

## Current limitations

- `/admin` is a visual preview only
- Contact form does not submit
- Project screenshots are placeholders
- Blog content is not published
- CV is not stored yet; the current control opens an email request
- Content is still maintained in `src/data/portfolio.ts`

## Planned next milestone

`v0.3.0 — CMS Foundation`

- Supabase project and schema
- Google authentication
- Owner-only admin access
- Protected `/admin`
- CMS-managed profile, skills and projects
- Row Level Security
