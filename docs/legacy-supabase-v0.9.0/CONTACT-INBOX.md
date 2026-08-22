# Contact Inbox and Email Notifications

## Purpose

v0.8.0 replaces the static contact-form preview with a secure operational workflow. A submission is committed to PostgreSQL first. Email notification is attempted only after the database returns a message ID, so a provider outage cannot discard the enquiry.

## Public submission flow

```text
/contact form
  → React useActionState
  → Next.js Server Action
  → field, honeypot and timing validation
  → privacy-preserving request fingerprint
  → submit_contact_message RPC
  → database validation and rate limit
  → contact_messages insert
  → optional Resend notification
  → finalize_contact_notification RPC
```

## Spam and abuse controls

- Hidden honeypot field.
- Minimum form-interaction time.
- Server-side field lengths and email validation.
- No raw IP address is stored.
- IP and user-agent data are hashed with `CONTACT_FINGERPRINT_SECRET`.
- Maximum three submissions per fingerprint within fifteen minutes.
- Maximum eight submissions per email address within twenty-four hours.
- Identical email/message pairs within ten minutes reuse the existing record.
- Direct anonymous table inserts are denied; public submissions must use the validated RPC.

These controls reduce ordinary automated abuse. CAPTCHA can be added later if production traffic justifies the added friction.

## Inbox workflow

Statuses:

```text
Unread → Read → Replied → Archived
          └──────────────→ Spam
Archived or Spam → Read
Archived or Spam → Permanent deletion
```

Priorities:

```text
Low
Normal
High
```

Admin capabilities:

- Search sender name, email, company, subject or discussion topic.
- Filter by unread, read, replied, archived or spam.
- Maintain private notes.
- Open a prefilled email reply.
- Mark the operational state and priority.
- Review notification status and provider errors.
- Retry failed or skipped email notifications.
- Permanently delete only archived or spam records.

## Email notifications

Provider: Resend Email API.

Required variables:

```text
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_NOTIFICATION_TO
CONTACT_FINGERPRINT_SECRET
```

`CONTACT_NOTIFICATION_TO` accepts comma-separated recipients. `CONTACT_FROM_EMAIL` must use a sender identity permitted by the configured Resend account. A verified custom domain is recommended for production.

Notification states:

```text
pending
sent
failed
skipped
```

`skipped` means the message was stored but email variables were not configured. Failed notifications remain visible and can be retried from the inbox.

The visitor email is assigned as the notification `reply_to`, allowing the administrator to respond directly from the mail client.

## Privacy boundary

Stored visitor data is limited to information intentionally submitted through the form plus a one-way request fingerprint. Do not copy sensitive personal data into admin notes unless it is operationally necessary.
