# Security Model

## Authentication

- Google OAuth only
- No public password or registration interface
- Cookie-based Supabase SSR session
- Session refresh through the Next.js proxy
- Server-side `getUser()` for verified identity

## Application authorization

`ADMIN_EMAILS` is the preferred server-only comma-separated allow-list. `ADMIN_EMAIL` remains backward compatible. Unapproved accounts are signed out during callback validation.

## Database authorization

PostgreSQL independently checks authenticated JWT email against `private.admin_allowlist` through `public.is_portfolio_admin()`.

```text
Application route gate: ADMIN_EMAILS
Database data gate: private.admin_allowlist + RLS
```

Every application admin must exist in both allow-lists.

## Key handling

The publishable key is intentionally browser-visible and remains constrained by RLS. Do not add a service-role key to this application.

## Project rules

- Every mutation calls `requireAdmin()`.
- RLS independently verifies the administrator.
- Public users see published projects only.
- Permanent deletion requires Archived status.
- Database triggers generate audit events.

## Blog rules

- Public users see only Published posts whose publication time has arrived.
- Draft, scheduled-future and archived articles are previewed only through protected admin routes.
- Permanent post deletion requires Archived status in application logic and RLS.
- Category and tag writes require administrator RLS checks.
- Revision tables are not readable by anonymous users.
- Revision restore forces the post back to Draft.
- Rich content is generated through Tiptap's controlled schema and sanitised server-side before persistence.
- Image and link URLs are limited to HTTP or HTTPS in CMS metadata fields.

## Rich HTML boundary

The portfolio is a single-owner CMS rather than a public multi-author platform. Before persistence, the server passes Tiptap HTML through `sanitize-html` with an explicit element, attribute, CSS-property and URL-scheme allow-list. Scriptable elements, inline event handlers, data URLs and protocol-relative URLs are rejected. Direct public authoring is not exposed.

## Operational checklist

- Keep `.env.local` untracked.
- Enable MFA on Google, GitHub, Netlify and Supabase.
- Restrict Supabase SQL Editor access.
- Review OAuth redirect URLs.
- Audit RLS whenever a table is added.
- Test anonymous reads after every migration.
- Inspect audit events after lifecycle and revision operations.
