# Saiful Islam Portfolio

A mobile-responsive personal portfolio and single-owner CMS built with Next.js, TypeScript, Supabase and Netlify.

## Current release

**v0.8.0 — Contact Inbox and Email Notifications**

The public contact form now stores validated enquiries in a private Supabase-backed inbox. The administrator can review, prioritise, annotate, reply, archive and delete messages, while optional Resend notifications provide immediate delivery alerts without risking message loss when the email provider is unavailable.

## Stack

- Next.js 16 App Router and React 19
- TypeScript
- Node.js 24 LTS and pnpm 11
- Supabase Auth, PostgreSQL, Storage and Row Level Security
- Supabase SSR cookie sessions
- Tiptap rich-text editor
- Resend Email API for optional contact notifications
- Netlify deployment

## Local setup

```powershell
nvm install 24.18.1
nvm use 24.18.1
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
supabase/migrations/202607310006_contact_inbox.sql
```

## Important routes

```text
/
/contact
/cv
/projects
/blog
/admin
/admin/inbox
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

1. [`docs/UPGRADE-v0.8.0.md`](./docs/UPGRADE-v0.8.0.md)
2. [`docs/CONTACT-INBOX.md`](./docs/CONTACT-INBOX.md)
3. [`docs/TESTING-CHECKLIST.md`](./docs/TESTING-CHECKLIST.md)
4. [`docs/RELEASE-NOTES-v0.8.0.md`](./docs/RELEASE-NOTES-v0.8.0.md)
