# v0.5.0 — Full Blog CMS

## Summary

This release adds a complete single-owner publishing workflow to the portfolio. Articles are stored in Supabase, written with Tiptap, protected by Google-only admin authentication and RLS, versioned automatically and rendered through dynamic public blog routes.

## Added

- Supabase-backed post CRUD
- Tiptap rich editor with common long-form formatting
- HTML and JSON article persistence
- Automatic reading-time calculation
- Categories and tags with full create, update and delete controls
- Draft, published and archived lifecycle
- Future publication timestamps
- Featured-post and display-order controls
- Admin article preview
- Immutable revision history
- Historical revision preview and restore
- Public blog search and filtering
- Category and tag archive pages
- Dynamic article metadata
- Canonical and Open Graph fields
- Article JSON-LD
- Blog sitemap integration
- Latest-insights homepage section
- Post audit events
- Blog-specific documentation and testing guidance
- Final TypeScript relation normalization for category and tag data returned by Supabase
- Deterministic Next.js cache cleanup before type generation and production builds
- `.next/dev` exclusion to prevent stale generated validator files from breaking TypeScript checks

## Database

New migration:

```text
supabase/migrations/202607310003_blog_cms.sql
```

New tables:

- `post_categories`
- `post_tags`
- `post_tag_links`
- `post_revisions`

Expanded table:

- `posts`

## Dependencies

Added pinned Tiptap `3.27.1` packages:

- `@tiptap/react`
- `@tiptap/pm`
- `@tiptap/starter-kit`
- `@tiptap/extension-image`
- `@tiptap/extension-placeholder`
- `@tiptap/extension-text-align`
- `sanitize-html@2.17.6`
- `@types/sanitize-html@2.16.1`

## Security

- Public readers only see posts whose status is Published and publication time has arrived.
- Only database allow-listed administrators can modify posts and taxonomies.
- Only archived posts can be permanently deleted.
- Revision history is readable only by administrators.
- Rich HTML is sanitised before persistence with a strict `sanitize-html` allow-list and is generated through a controlled editor schema.

## Deferred

- Direct image upload and media library
- Image processing and storage selection
- Skills, experience and homepage CMS
- Contact inbox and notifications
- CV management
