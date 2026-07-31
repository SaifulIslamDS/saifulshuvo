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
