# Current Status

## Release

`v0.4.0 — Project CMS`

## Working now

- Responsive light/dark public portfolio UI
- Google-only Supabase authentication
- Application email allow-list and database allow-list
- Protected admin routes
- Project create, read, update and delete workflow
- Draft/published/archived lifecycle
- Published project listing and dynamic detail pages
- Admin preview for non-public content
- Featured project controls and display ordering
- SEO title and description per project
- Project version number, lifecycle timestamps and audit events

## Still static or deferred

- Blog posts
- Skills
- Site settings
- Media uploads
- Contact submissions
- CV management

## Required migrations

1. `202607310001_cms_foundation.sql`
2. `202607310002_project_cms.sql`
