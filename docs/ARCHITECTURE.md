# Architecture

## High-level flow

```text
Public visitor
  └── Next.js App Router
       ├── Published project queries
       ├── Published and due article queries
       ├── Category and tag archives
       └── Dynamic metadata and sitemap

Approved administrator
  └── /admin/login
       └── Google OAuth through Supabase Auth
            └── /auth/callback code exchange
                 └── ADMIN_EMAILS verification
                      └── Protected /admin route group
                           ├── Project Server Actions
                           ├── Blog Server Actions
                           ├── Media and CV Server Actions
                           └── Route revalidation

Database access
  └── Supabase publishable key + authenticated JWT
       ├── PostgreSQL Row Level Security
       │    └── private.admin_allowlist
       └── Supabase Storage policies
            └── portfolio-media bucket
```

## Application layers

### Public presentation

- `src/app/page.tsx`: homepage, featured projects and latest insights
- `src/app/projects`: public project library and case studies
- `src/app/blog`: article list, search and filters
- `src/app/blog/[slug]`: article page and dynamic SEO
- `src/app/blog/category/[slug]`: category archive
- `src/app/blog/tag/[slug]`: tag archive
- `src/app/cv`: active CV redirect
- `src/app/sitemap.ts`: projects, posts and taxonomy archives

### Authentication

- `src/lib/supabase/client.ts`: browser client
- `src/lib/supabase/server.ts`: cookie-aware server client
- `src/lib/supabase/proxy.ts`: auth cookie refresh
- `src/proxy.ts`: Next.js 16 request proxy
- `src/app/admin/login/actions.ts`: Google login and logout
- `src/app/auth/callback/route.ts`: PKCE exchange and application allow-list
- `src/lib/auth/admin.ts`: current-admin resolution and route guard

### Protected administration

```text
src/app/admin/login
src/app/admin/(protected)
```

The route group does not appear in URLs. ``/admin`, `/admin/projects`, `/admin/posts`, `/admin/media` and `/admin/settings` remain normal URL structures protected by server layout checks.

### Project content flow

```text
Admin project form
  → Server Action
  → requireAdmin()
  → Supabase RLS
  → project lifecycle/version trigger
  → project audit trigger
  → revalidatePath()
  → public portfolio
```

### Blog content flow

```text
Tiptap editor
  → HTML + JSON hidden form values
  → Server Action validation and sanitisation
  → category and tag relation sync
  → Supabase RLS
  → post lifecycle/version trigger
  → immutable revision snapshot
  → post audit trigger
  → revalidatePath()
  → public article, archives, homepage and sitemap
```


### Media content flow

```text
Admin upload form
  → Server MIME/size validation
  → SHA-256 duplicate check
  → Supabase Storage upload
  → media_assets metadata insert
  → assignment to profile, CV, project or post
  → RLS + lifecycle usage protection
  → public page revalidation
```

Media assignment uses database foreign keys while legacy public URL columns remain synchronised for backward compatibility.

## Database migrations

```text
202607310001_cms_foundation.sql
202607310002_project_cms.sql
202607310003_blog_cms.sql
202607310004_media_library.sql
```

## Rendering and caching

Server Actions call `revalidatePath()` after mutations. Public visibility is independently constrained by database RLS and explicit application query filters. Draft, future-scheduled and archived posts are never returned by public article queries.
