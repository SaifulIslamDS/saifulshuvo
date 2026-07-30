# Project CMS Guide

## Lifecycle

```text
Draft → Published → Draft
  │         │
  └─────────┴──→ Archived → Draft
                         └→ Permanent delete
```

A project must be archived before permanent deletion. This rule is checked by the server action and the database RLS delete policy.

## Managed fields

- Title, slug and category
- Summary and full overview
- Problem statement and solution overview
- Outcomes, highlights and technology stack
- Role, live URL and source URL
- Optional cover-image URL
- Project state and publication status
- Featured flag and display order
- SEO title and SEO description

## Public visibility

Only `publication_status = 'published'` records can be read publicly. Admin users can preview every status through `/admin/projects/[id]/preview`.

## Ordering

Projects are ordered by ascending `sort_order`, then by most recent publication/update. Use increments of 10 to leave room for later insertion.

## Audit and versioning

Every meaningful project insert or update increments `version`. Database triggers write create, update, publish, unpublish, archive, restore and delete events to `public.audit_events`.
