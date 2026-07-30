# Database Schema

## Private schema

### `private.admin_allowlist`

Stores the exact lower-case Google email permitted to modify CMS content. It is not exposed through the generated public Data API.

## Public schema

### `profiles`

Mirrors required identity fields from `auth.users`. A trigger creates or updates the row after Google authentication.

### `site_settings`

Singleton portfolio identity, social links and SEO settings.

### `skill_groups`

Ordered skill categories with icons and active status.

### `skills`

Skills linked to groups, including featured and learning-state flags.

### `projects`

Portfolio case studies with draft/published/archive workflow, project state, stack, highlights, links and SEO fields.

### `posts`

Blog content with draft/published/archive workflow, publish time and SEO fields.

### `audit_events`

Append-oriented activity records for future CMS mutations.

## Current seed data

The migration seeds:

- Portfolio identity and social links
- Six skill groups
- Core current skills
- Eight portfolio projects
- Three planned draft articles

## Public read rules

- Site settings: publicly readable
- Active skills and groups: publicly readable
- Published projects: publicly readable
- Published and due posts: publicly readable

## Write rules

All CMS writes require an authenticated JWT whose verified email exists in `private.admin_allowlist`.

## v0.4.0 project fields

The second migration extends `public.projects` with:

- `problem_statement`
- `solution_overview`
- `outcomes`
- `cover_image_url`
- `version`
- `archived_at`

`manage_project_lifecycle()` maintains version and lifecycle timestamps. `audit_project_change()` writes immutable records to `public.audit_events`.
