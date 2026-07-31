# Blog CMS

## Purpose

The Blog CMS turns the portfolio into a publishing platform for practical writing on data analytics, AI, SaaS development, web development, project case studies and career transition.

## Admin routes

```text
/admin/posts
/admin/posts/new
/admin/posts/[id]/edit
/admin/posts/[id]/preview
/admin/posts/[id]/revisions
/admin/posts/[id]/revisions/[revisionId]
/admin/posts/taxonomies
```

## Public routes

```text
/blog
/blog/[slug]
/blog/category/[slug]
/blog/tag/[slug]
```

## Rich editor

The editor uses Tiptap 3 with:

- Paragraphs and H2–H4 headings
- Bold, italic, underline and strikethrough
- Bullet and numbered lists
- Blockquotes
- Inline code and code blocks
- Links with automatic HTTPS defaults
- Images inserted by public URL
- Horizontal rules
- Left, centre and right alignment
- Undo and redo
- HTML and JSON persistence

`immediatelyRender: false` is configured to avoid Next.js server-rendering hydration mismatch.

Before storage, generated HTML is processed server-side through `sanitize-html`. Only supported article elements, safe attributes, controlled text alignment and HTTP/HTTPS/mailto URL schemes are retained.

## Post fields

- Title and slug
- Excerpt
- Rich HTML and Tiptap JSON
- Category and tags
- Publication status
- Optional future publication time
- Featured flag and display order
- Automatic reading time
- Featured-image URL
- SEO title and description
- Canonical URL
- Open Graph image URL
- Version and lifecycle timestamps

## Lifecycle

```text
Draft
  ├─ Publish now
  ├─ Publish at a future time
  └─ Archive

Published
  ├─ Return to draft
  └─ Archive

Archived
  ├─ Restore to draft
  └─ Permanently delete
```

Public queries require both:

- `publication_status = 'published'`
- `published_at <= now()`

## Revisions

A revision snapshot is preserved before every meaningful update. The snapshot contains the article fields and, when the update is made through the application, its linked tag IDs.

Restoring a revision:

1. Preserves the current version as another immutable revision.
2. Copies the selected snapshot into the current post.
3. Restores the snapshot's tags when available.
4. Forces the restored post to Draft.
5. Creates a `post.revision_restored` audit event.

## Taxonomies

Categories and tags have independent public archive pages. Categories include descriptions, accent colours and display order. A category cannot be deleted while posts still reference it. Deleting a tag removes its relationships through foreign-key cascade.

## SEO

Every published post can generate:

- Dynamic title and description
- Canonical URL
- Article Open Graph metadata
- Twitter/X card metadata
- `Article` JSON-LD
- Sitemap entry
- Category and tag archive sitemap entries

## Current media boundary

v0.5.0 accepts public image URLs in the editor and metadata. Direct upload, optimisation and Supabase Storage integration are scheduled for v0.6.0.
