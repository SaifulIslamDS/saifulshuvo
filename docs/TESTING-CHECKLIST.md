# Testing Checklist

## Build and runtime

- [ ] Node.js `24.18.1` is active.
- [ ] `pnpm install` completes.
- [ ] `pnpm typecheck` completes.
- [ ] `pnpm build` completes.
- [ ] Direct refresh works on public and protected routes.

## Migration

- [ ] `202607310006_contact_inbox.sql` runs once without error.
- [ ] `contact_messages` exists with RLS enabled.
- [ ] `submit_contact_message` is executable by `anon` and `authenticated`.
- [ ] `finalize_contact_notification` is executable by `anon` and `authenticated`.
- [ ] Anonymous direct table reads and writes are rejected.
- [ ] Existing profile, skills, experience, project, blog, media and CV data remain intact.

## Public contact form

- [ ] Required-field validation works.
- [ ] Invalid email is rejected.
- [ ] Message shorter than 20 characters is rejected.
- [ ] Valid submission shows success feedback and resets the form.
- [ ] Valid submission appears in `/admin/inbox`.
- [ ] Honeypot submissions are rejected.
- [ ] Rapid automated submission is rejected.
- [ ] Fourth submission from the same fingerprint within fifteen minutes is rate-limited.
- [ ] Raw IP addresses are not stored in `contact_messages`.
- [ ] Form remains usable on desktop, tablet and mobile.

## Inbox

- [ ] Dashboard inbox count and unread count are correct.
- [ ] Search works for name, email, company, subject and topic.
- [ ] Status filters work.
- [ ] Pagination works with more than twenty records.
- [ ] Message detail shows sender, topic, source, body and timeline.
- [ ] Notes and priority save.
- [ ] Unread, read, replied, archived and spam transitions work.
- [ ] Reply-by-email link is correctly prefilled.
- [ ] Archived/spam message can be restored.
- [ ] Active message cannot be permanently deleted through the UI.
- [ ] Archived/spam message can be permanently deleted.

## Email notifications

- [ ] Without email variables, submission is saved with `skipped` status.
- [ ] With valid Resend variables, notification is delivered.
- [ ] Notification reply-to uses the visitor email.
- [ ] Notification links to the correct admin inbox detail.
- [ ] Invalid provider configuration records `failed` status and error detail.
- [ ] Retry succeeds after configuration is corrected.
- [ ] Duplicate provider sends are prevented by the idempotency key.

## Security and audit

- [ ] Non-admin users cannot access `/admin/inbox`.
- [ ] Only allow-listed admins can read/update/delete contact records.
- [ ] Contact received, updated, status, retry and delete audit events are created.
- [ ] Sensitive variables are not committed to Git.
- [ ] Light and dark theme contrast is readable.
- [ ] No horizontal overflow occurs.
