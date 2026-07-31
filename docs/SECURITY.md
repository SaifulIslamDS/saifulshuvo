# Security

## Authentication and authorization

- Google OAuth only.
- Application allow-list through `ADMIN_EMAILS`.
- Database allow-list through `private.admin_allowlist`.
- RLS protects every CMS read/write boundary.
- Every protected Server Action calls `requireAdmin()`.

## Contact-form controls

- Anonymous users cannot directly insert, select, update or delete contact rows.
- Public submission is available only through `submit_contact_message(...)`.
- The RPC validates field length, email structure, honeypot state and request fingerprint.
- Server Action validation provides an additional layer before the RPC.
- A request fingerprint is SHA-256 hashed with a server-only secret; raw IP addresses are not stored.
- Rate limits are enforced inside PostgreSQL, not only in the browser.
- Duplicate identical messages within ten minutes reuse the existing record.
- The notification-finalisation token is random, one-time and removed after use.
- Permanent deletion through the UI requires archived or spam status.

## Email controls

- `RESEND_API_KEY` and `CONTACT_FINGERPRINT_SECRET` are server-only variables.
- The email API call uses an idempotency key based on the contact message ID.
- Visitor input is HTML escaped before notification rendering.
- Email failure never rolls back the database submission.
- No automated visitor acknowledgement is sent, avoiding use of the form as an arbitrary outbound-mail relay.

## Media controls

- Storage writes require `public.is_portfolio_admin()`.
- Only JPG, PNG, WebP, GIF and PDF are accepted.
- Assigned media cannot be archived or deleted.
- The public bucket must not contain confidential files.

## Public data boundary

Published profile, project, post and media content is intentionally public. Contact records, fingerprints, admin notes and delivery details remain private to allow-listed administrators.
