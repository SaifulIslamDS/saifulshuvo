# v0.4.0 Testing Checklist

## Build

- [ ] `pnpm install`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] No browser-console errors

## Authentication

- [ ] Approved Google account reaches `/admin`
- [ ] Unapproved account is rejected
- [ ] Sign out clears access

## Project CRUD

- [ ] Create a draft project
- [ ] Duplicate slug is rejected
- [ ] Edit every content group
- [ ] Preview a draft
- [ ] Publish the project
- [ ] Published project appears on `/projects`
- [ ] Featured project appears on `/`
- [ ] Slug change removes the old public route
- [ ] Move published project to draft
- [ ] Archive removes it from public pages
- [ ] Restore returns it as draft
- [ ] Non-archived permanent delete is rejected
- [ ] Archived permanent delete succeeds

## Database

- [ ] Version increments after update
- [ ] `published_at` is set only for published projects
- [ ] `archived_at` is set only for archived projects
- [ ] Audit events record lifecycle changes
- [ ] Anonymous query cannot read draft or archived projects

## Responsive UI

- [ ] Admin list usable on desktop, tablet and mobile
- [ ] Create/edit forms stack correctly on mobile
- [ ] Light and dark themes remain readable
- [ ] No horizontal page overflow beyond the intentionally scrollable table
