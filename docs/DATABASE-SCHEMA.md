# Database Schema

## Core tables

- `profiles`
- `site_settings`
- `skill_groups`
- `skills`
- `projects`
- `posts`
- `audit_events`

## Project CMS

- `project_media` — ordered screenshot relations.
- `projects.cover_image_asset_id` — selected media-library cover.

## Blog CMS

- `post_categories`
- `post_tags`
- `post_tag_links`
- `post_revisions`
- `posts.featured_image_asset_id`
- `posts.og_image_asset_id`

## Media CMS

### `media_assets`

Stores object path, public URL, original filename, MIME type, purpose, lifecycle status, file size, dimensions, alt text, caption and SHA-256.

### `cv_documents`

Stores title, version label, notes and a required PDF media reference.

### Site assignments

- `site_settings.profile_image_asset_id`
- `site_settings.active_cv_document_id`

The function `media_asset_usage_count(uuid)` protects assigned media from archival and deletion.

## Profile and Homepage CMS

### Extended `site_settings`

Stores public identity, social links, hero, About, statistics, professional positioning, process, work principles, CTA content, homepage section visibility and a monotonically increasing content version.

### Extended `skill_groups`

Adds description, accent and homepage-feature controls.

### Extended `skills`

Adds description, proficiency level, years of experience and optional evidence URL while retaining learning, featured, active and ordering controls.

### `experience_entries`

Stores role, organisation, dates, public period label, summary, achievements, technologies, featured status, public visibility and display order.

### `services`

Stores homepage capability cards with title, icon, description, accent, visibility and display order.
