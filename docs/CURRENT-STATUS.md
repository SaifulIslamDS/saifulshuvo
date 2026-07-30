# Current Status

## Release

`v0.3.0 — CMS Foundation`

## Completed

- Real portfolio content and responsive public UI
- Light and dark themes with persistent selection
- Public project, blog and contact interfaces
- CMS-style admin interface
- Supabase browser and server clients
- Next.js 16 root `proxy.ts` session refresh
- Google-only OAuth action and callback exchange
- Single-admin server allow-list using `ADMIN_EMAIL`
- Protected `/admin` route group
- Secure sign-out action
- Configuration-safe login screen
- PostgreSQL migration for profiles, settings, skills, projects, posts and audit events
- Private database admin allow-list
- Row Level Security policies
- Initial real portfolio seed data
- Root documentation cleanup

## Still static or UI-only

- Public pages still read `src/data/portfolio.ts`
- Admin project forms do not write to the database
- Admin post editor does not save content
- Skills and settings forms do not persist
- Media upload is not implemented
- Contact submissions are not stored

## Next recommended release

`v0.4.0 — Project CMS`
