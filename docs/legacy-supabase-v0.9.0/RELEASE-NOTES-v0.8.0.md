# v0.8.0 — Contact Inbox and Email Notifications

## Summary

The portfolio contact experience is now operational. Public enquiries are validated, rate-limited and stored in a private Supabase inbox before optional email delivery is attempted.

## Added

- Functional public contact form with React action state.
- Supabase `contact_messages` table.
- Validated public submission RPC.
- One-time notification finalisation RPC.
- Private admin inbox with search, filtering and pagination.
- Unread, read, replied, archived and spam lifecycle.
- Low, normal and high priorities.
- Private admin notes.
- Prefilled email-reply action.
- Resend notification integration without an additional npm dependency.
- Notification delivery status, provider ID, errors and retry.
- Database and application rate limiting.
- Honeypot and minimum-interaction-time checks.
- SHA-256 request fingerprinting without raw IP storage.
- Contact audit events.
- Dashboard inbox statistics and recent enquiries.
- Node.js 24.18.1 LTS runtime baseline.

## Security

- Anonymous direct inserts, reads, updates and deletes are denied.
- Public submission is only available through a security-definer RPC with server-side validation.
- Admin inbox access remains protected by Google OAuth, the application allow-list and database RLS.
- Permanent deletion requires archived or spam status.
- Resend API keys and fingerprint secrets remain server-only.

## Environment variables

```text
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_NOTIFICATION_TO
CONTACT_FINGERPRINT_SECRET
```

## Migration

```text
supabase/migrations/202607310006_contact_inbox.sql
```

## Known boundary

The release sends an administrator notification only. It intentionally does not send automated acknowledgement emails to arbitrary visitor addresses, reducing the risk of the contact form being abused as an outbound mail relay.
