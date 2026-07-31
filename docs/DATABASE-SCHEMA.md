# Database Schema

## Private schema

### `private.admin_allowlist`

Stores normalized Google email addresses permitted to modify CMS content. The private schema is not exposed to public API roles.

## Public identity and settings

### `profiles`

Mirrors required identity fields from `auth.users`.

### `site_settings`

Singleton portfolio identity, social links and SEO settings.

### `skill_groups` and `skills`

Ordered skills foundation. Public UI remains static until the skills milestone.

## Project CMS

### `projects`

Portfolio case studies with lifecycle, project status, stack, highlights, links, SEO, case-study fields, version and timestamps.

## Blog CMS

### `posts`

Stores:

- Slug, title and excerpt
- Sanitised article HTML
- Tiptap JSON
- Legacy category label and category foreign key
- Draft/published/archived status
- Reading time
- Featured image
- SEO title and description
- Canonical and Open Graph image URLs
- Featured flag and sort order
- Version, publication and archive timestamps

### `post_categories`

Controlled article categories with slug, description, accent and display order.

### `post_tags`

Controlled article tags.

### `post_tag_links`

Many-to-many post and tag relationship.

### `post_revisions`

Immutable JSON snapshots keyed by post and version. Application-generated snapshots also include `tag_ids` so relationships can be restored.

### `audit_events`

Append-oriented project and post activity records.

## Blog triggers

### `manage_post_lifecycle()`

- Increments version on meaningful changes
- Sets or preserves `published_at`
- Supports future scheduled publication
- Sets `archived_at`
- Clears inappropriate lifecycle timestamps

### `capture_post_revision()`

Captures the previous post record before the current version advances.

### `audit_post_change()`

Creates events including:

- `post.created`
- `post.updated`
- `post.published`
- `post.unpublished`
- `post.archived`
- `post.restored`
- `post.deleted`

The application adds `post.revision_restored` after successful restoration.

## Public read rules

- Site settings: publicly readable
- Active skills and groups: publicly readable
- Published projects: publicly readable
- Published posts whose `published_at <= now()`: publicly readable
- Taxonomies: publicly readable
- Tag links: readable only when their post is public or the requester is admin
- Revisions: admin only

## Delete rules

- Project permanent deletion requires Archived status.
- Post permanent deletion requires Archived status.
- Category deletion is blocked by application logic while posts reference it.
- Tag deletion cascades tag links but does not delete posts.
