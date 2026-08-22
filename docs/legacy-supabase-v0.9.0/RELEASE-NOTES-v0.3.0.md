# v0.3.0 — CMS Foundation

## Summary

Introduces the secure backend foundation for the single-owner portfolio CMS while preserving the stable v0.2.0 public UI.

## Added

- Supabase SSR and JavaScript clients
- Next.js 16 root proxy for auth-cookie refresh
- Google-only admin login
- OAuth callback code exchange
- Server-only single-admin email allow-list
- Protected `/admin` route group
- Secure sign-out action
- Responsive login interface with light and dark themes
- PostgreSQL CMS migration
- Private database administrator allow-list
- Profiles, site settings, skills, projects, posts and audit tables
- Row Level Security policies
- Updated-at and auth-profile triggers
- Initial portfolio seed data
- Centralized `docs/` documentation structure

## Changed

- Package version updated to `0.3.0`
- Admin dashboard now requires a valid owner session
- Admin interface identifies the authenticated Google user
- Root contains only `README.md` as Markdown documentation
- Footer release label updated to v0.3.0

## Deferred

- Project CRUD
- Post persistence and rich editor
- Skills and settings persistence
- Media storage
- Contact persistence
