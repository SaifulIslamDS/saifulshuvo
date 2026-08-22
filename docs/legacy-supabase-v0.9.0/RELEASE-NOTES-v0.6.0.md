# v0.6.0 — Media Library, Profile Image and CV Management

## Added

- Supabase Storage bucket provisioning and policies.
- Admin-only image and PDF uploads.
- SHA-256 duplicate detection.
- Searchable and filterable media library.
- Alt text, caption and purpose metadata.
- Active/archive/delete media lifecycle.
- Database-backed orphan protection.
- Profile image selection with public homepage rendering.
- CV uploads, version metadata, activation and public `/cv` access.
- Project cover-image and gallery assignment.
- Blog featured-image and Open Graph image assignment.
- Public project galleries.
- Media and CV audit events.
- Responsive light/dark admin media UI.

## Security

- Only allow-listed authenticated administrators may mutate Storage objects or media metadata.
- Public bucket MIME types and file size are constrained.
- SVG and executable uploads are blocked.
- Assigned media cannot be archived or permanently deleted.
- Active CV versions cannot be deleted.

## Compatibility

- Existing external image URL fields continue to work.
- No new package or environment variable was added.
- Existing v0.1.0–v0.5.0 migrations and documentation are preserved.
