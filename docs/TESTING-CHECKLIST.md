# v0.5.0 Testing Checklist

## Build

- [ ] Node.js is 22.x
- [ ] pnpm is 11.18.0
- [ ] `pnpm install` succeeds
- [ ] `pnpm clean` removes `.next` safely
- [ ] `pnpm typecheck` succeeds
- [ ] `pnpm build` succeeds
- [ ] No ignored dependency build scripts remain

## Migration

- [ ] Migration 001 is applied
- [ ] Migration 002 is applied
- [ ] Migration 003 is applied
- [ ] Initial categories exist
- [ ] Initial tags exist
- [ ] Existing seed posts remain drafts
- [ ] RLS is enabled on all new tables

## Authentication

- [ ] Approved Google admin can access `/admin/posts`
- [ ] Unapproved Google account is rejected
- [ ] Signed-out visitor is redirected from protected routes
- [ ] Sign out works

## Rich editor

- [ ] Editor loads without hydration warnings
- [ ] Bold, italic, underline and strike work
- [ ] H2, H3 and paragraph work
- [ ] Bullet and numbered lists work
- [ ] Blockquote and code block work
- [ ] Link insertion and removal work
- [ ] Image URL and alt text work
- [ ] Horizontal rule works
- [ ] Text alignment works
- [ ] Undo and redo work
- [ ] HTML and JSON survive save/reload

## Post lifecycle

- [ ] Create draft
- [ ] Edit draft
- [ ] Preview draft
- [ ] Publish immediately
- [ ] Published article appears on `/blog`
- [ ] Published article appears on `/blog/[slug]`
- [ ] Move published post back to draft
- [ ] Schedule a future post
- [ ] Scheduled post stays hidden before publication time
- [ ] Archive post
- [ ] Archived post disappears publicly
- [ ] Restore archived post to draft
- [ ] Permanent delete is blocked for non-archived posts
- [ ] Permanent delete succeeds for archived post

## Categories and tags

- [ ] Create category
- [ ] Update category
- [ ] Category archive route works
- [ ] Category with linked posts cannot be deleted
- [ ] Create tag
- [ ] Update tag
- [ ] Tag archive route works
- [ ] Delete tag
- [ ] Filtering by category and tag works

## Revisions

- [ ] Editing creates a new version
- [ ] Revision list shows earlier versions
- [ ] Historical revision preview renders
- [ ] Restoring a revision creates a new draft
- [ ] Current version remains in history
- [ ] Tag relationships restore when present in snapshot
- [ ] `post.revision_restored` audit event exists

## SEO

- [ ] Dynamic article title is correct
- [ ] Meta description is correct
- [ ] Canonical URL is correct
- [ ] Open Graph image fallback works
- [ ] Article JSON-LD is present
- [ ] Published article is in sitemap
- [ ] Category and tag archives are in sitemap
- [ ] Draft and archived posts are absent from sitemap

## Responsive and themes

- [ ] Blog list works on mobile
- [ ] Article page works on mobile
- [ ] Admin post list scrolls safely on mobile
- [ ] Rich-editor toolbar remains usable on mobile
- [ ] Taxonomy forms work on mobile
- [ ] Light theme contrast is acceptable
- [ ] Dark theme contrast is acceptable
