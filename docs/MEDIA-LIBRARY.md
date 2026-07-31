# Media Library

## Purpose

v0.6.0 adds a single-owner media workflow backed by the public Supabase Storage bucket `portfolio-media` and metadata stored in `public.media_assets`.

## Supported files

| Type | MIME | Maximum size |
|---|---|---:|
| JPEG | `image/jpeg` | 8 MB |
| PNG | `image/png` | 8 MB |
| WebP | `image/webp` | 8 MB |
| GIF | `image/gif` | 8 MB |
| PDF | `application/pdf` | 10 MB |

SVG, scripts, archives and executable files are intentionally rejected.

## Upload flow

1. The authenticated allow-listed administrator submits a file through `/admin/media`.
2. The server validates MIME type, purpose and size.
3. SHA-256 is calculated and active duplicates are rejected.
4. The object is uploaded to `portfolio-media`.
5. Metadata is inserted into `public.media_assets`.
6. CV-purpose PDFs also create an immutable CV version record.
7. Audit events are appended.

## Assignment model

- `site_settings.profile_image_asset_id` — public portrait.
- `site_settings.active_cv_document_id` — active public CV.
- `projects.cover_image_asset_id` — project cover.
- `project_media` — project screenshot gallery.
- `posts.featured_image_asset_id` — article featured image.
- `posts.og_image_asset_id` — article social-preview image.

Legacy URL fields remain populated for rendering and backward compatibility.

## Lifecycle

```text
Active → Archived → Permanently deleted
```

Assigned media cannot be archived or deleted. Remove all references first. Permanent deletion is allowed only after archival and removes the object from Supabase Storage before deleting its metadata row.

## CV management

Upload a PDF with purpose `CV document`. Each upload creates a version containing title, version label, notes and its media reference. Select one active version from `/admin/settings`. The public `/cv` route redirects to the active PDF.
