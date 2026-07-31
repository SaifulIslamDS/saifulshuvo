# Database Schema

## Core tables

- `profiles`
- `site_settings`
- `skill_groups`
- `skills`
- `experience_entries`
- `services`
- `projects`
- `posts`
- `media_assets`
- `cv_documents`
- `contact_messages`
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

### `site_settings`

Stores public identity, social links, hero, About, statistics, professional positioning, process, work principles, CTA content, section visibility and a content version.

### `skill_groups` and `skills`

Store grouped public capabilities, proficiency, experience, learning, evidence, visibility and ordering metadata.

### `experience_entries`

Stores role, organisation, dates, public period label, summary, achievements, technologies, featured status, visibility and display order.

### `services`

Stores homepage capability cards with title, icon, description, accent, visibility and display order.

## Contact Inbox

### `contact_messages`

Stores:

- Visitor name, email and optional company.
- Subject, discussion topic and message.
- Source page.
- Workflow status and priority.
- Private admin notes.
- One-way request fingerprint.
- Notification status, provider ID and error.
- Read, replied and archived timestamps.

Anonymous users receive no direct table privileges. The `submit_contact_message(...)` security-definer function validates and rate-limits public inserts. `finalize_contact_notification(...)` allows the originating Server Action to record one notification result using a one-time unguessable token.

Indexes support inbox status, email, fingerprint, notification status and newest-first access.
