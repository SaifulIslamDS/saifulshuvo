# Security Model

## Authentication

- Google OAuth only
- No public account registration UI
- No password login UI
- Cookie-based Supabase SSR session
- Session tokens refreshed in the Next.js root proxy
- Server-side `getUser()` used when current user email is required

## Application authorization

`ADMIN_EMAIL` is a server-only environment variable. The callback rejects and signs out any Google account whose normalized email does not match.

## Database authorization

The environment variable cannot protect direct Data API requests by itself. The database independently checks the authenticated JWT email against `private.admin_allowlist` through `public.is_portfolio_admin()`.

This provides two separate gates:

```text
Next.js route gate: ADMIN_EMAIL
PostgreSQL data gate: private.admin_allowlist + RLS
```

Both values must contain the same email.

## Key handling

The Supabase publishable key is intentionally available to the browser. It does not bypass Row Level Security.

Do not use or expose a service-role key in this project. A service-role key bypasses RLS and is unnecessary for the single-owner CMS foundation.

## RLS principles

- Policies name explicit `anon` or `authenticated` roles.
- Public users can select only public content.
- Authenticated non-admin users cannot modify CMS tables.
- Admin checks use verified JWT email rather than user-editable metadata.
- Profile role changes are protected by a database trigger.
- The private allow-list schema is not granted to API roles.

## Operational checklist

- Keep `.env.local` untracked.
- Restrict access to the Supabase and Netlify accounts.
- Enable MFA on Google, GitHub, Netlify and Supabase accounts.
- Review OAuth redirect URLs before production.
- Remove obsolete Netlify preview wildcard redirects when no longer needed.
- Audit RLS whenever a new table is introduced.
