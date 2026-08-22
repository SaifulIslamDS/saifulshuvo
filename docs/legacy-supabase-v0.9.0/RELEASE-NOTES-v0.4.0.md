# v0.4.0 — Project CMS

## Added

- Functional Supabase project CRUD
- Create and edit screens
- Protected preview for drafts, published and archived projects
- Draft, publish, unpublish, archive and restore actions
- Archived-only permanent deletion
- Featured and display-order controls
- Project problem, solution, outcomes and cover URL fields
- Project SEO fields
- Dynamic homepage, project listing, detail pages and sitemap
- Project lifecycle/version trigger
- Database-generated audit trail
- `ADMIN_EMAILS` multi-admin application configuration

## Changed

- Admin dashboard reads project counts and recent content from Supabase
- Public project content now reads published database records
- Static project data remains a build-safe fallback when Supabase is not configured
- Package version updated to `0.4.0`

## Security

- Public RLS exposes published projects only
- Explicit INSERT, UPDATE and DELETE policies replace the broad project write policy
- DELETE policy requires both admin status and archived content
- Mutations verify an authenticated administrator server-side

## Deferred

- Media upload
- Blog CMS
- Skills CMS
- Settings CMS
