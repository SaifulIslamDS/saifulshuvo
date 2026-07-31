# Testing Checklist

## Build

- [ ] `pnpm install`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] Direct refresh works on all public and admin routes.

## Migration and Storage

- [ ] `202607310004_media_library.sql` runs once without error.
- [ ] `portfolio-media` bucket is public.
- [ ] JPG, PNG, WebP, GIF and PDF uploads work within limits.
- [ ] Unsupported files and oversized files are rejected.
- [ ] Duplicate files are rejected by SHA-256.

## Media library

- [ ] Search and kind/purpose/status filters work.
- [ ] Alt text and captions update.
- [ ] URL copy works.
- [ ] Unused media can be archived and restored.
- [ ] Assigned media cannot be archived.
- [ ] Archived unused media can be permanently deleted.

## Profile and CV

- [ ] Profile image selection updates the homepage.
- [ ] Clearing selection restores the initials placeholder.
- [ ] CV PDF upload creates a version record.
- [ ] Active CV selection exposes `/cv`.
- [ ] Inactive CV metadata can be edited and deleted.
- [ ] Active CV cannot be deleted.

## Project and Blog media

- [ ] Project cover and gallery save correctly.
- [ ] Public project card/detail/gallery render selected media.
- [ ] Blog featured and Open Graph image selections save.
- [ ] Existing external image URLs remain supported.

## Responsive and themes

- [ ] `/admin/media` works on desktop, tablet and mobile.
- [ ] Light and dark theme contrast is readable.
- [ ] No horizontal overflow occurs.
