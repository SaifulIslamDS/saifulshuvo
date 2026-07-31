# Security

## Authentication and authorization

- Google OAuth only.
- Application allow-list through `ADMIN_EMAILS`.
- Database allow-list through `private.admin_allowlist`.
- RLS protects all CMS writes.

## Media controls

- Storage writes require `public.is_portfolio_admin()`.
- The bucket accepts only JPG, PNG, WebP, GIF and PDF.
- Maximum object size is 10 MB; the application limits images to 8 MB.
- SHA-256 duplicate checks reduce accidental duplicate storage.
- SVG and active-content file types are rejected.
- Assigned media cannot be archived or deleted.
- Permanent deletion requires archived status and zero references.

## Public data boundary

The bucket is public because profile, project, blog and CV assets are intended for public portfolio pages. Do not upload confidential documents or private personal records.
