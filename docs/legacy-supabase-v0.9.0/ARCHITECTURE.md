# Architecture

## High-level flow

```text
Public visitor
  └── Next.js App Router
       ├── Database-driven homepage, projects and articles
       ├── Media and active CV delivery
       └── Contact Server Action
            ├── field, honeypot and timing validation
            ├── SHA-256 request fingerprint
            ├── rate-limited Supabase RPC
            ├── contact_messages insert
            └── optional Resend notification

Approved administrator
  └── /admin/login
       └── Google OAuth through Supabase Auth
            └── /auth/callback code exchange
                 └── ADMIN_EMAILS verification
                      └── Protected /admin route group
                           ├── Project and Blog CMS
                           ├── Media, profile and CV CMS
                           ├── Homepage, Skills and Experience CMS
                           └── Contact Inbox

Database access
  └── Supabase publishable key + authenticated JWT
       ├── PostgreSQL Row Level Security
       │    └── private.admin_allowlist
       ├── validated anonymous contact RPC
       └── Supabase Storage policies
            └── portfolio-media bucket
```

## Public presentation

- `src/app/page.tsx`: homepage, featured projects and latest insights.
- `src/app/projects`: public project library and case studies.
- `src/app/blog`: article list, search, filters and public archives.
- `src/app/cv`: active CV redirect.
- `src/app/contact`: public enquiry form.
- `src/app/sitemap.ts`: public project, article and taxonomy routes.

## Authentication

- `src/lib/supabase/client.ts`: browser client.
- `src/lib/supabase/server.ts`: cookie-aware server client.
- `src/lib/supabase/proxy.ts`: auth cookie refresh.
- `src/proxy.ts`: Next.js request proxy.
- `src/app/admin/login/actions.ts`: Google login and logout.
- `src/app/auth/callback/route.ts`: PKCE exchange and application allow-list.
- `src/lib/auth/admin.ts`: current-admin resolution and route guard.

## Protected administration

```text
/admin
/admin/projects
/admin/posts
/admin/inbox
/admin/homepage
/admin/skills
/admin/experience
/admin/media
/admin/settings
```

Every mutation verifies authorization inside its Server Action. Database RLS independently enforces admin access.

## Contact flow

```text
ContactForm client component
  → useActionState
  → submitContactAction
  → Next.js request headers
  → one-way fingerprint hash
  → submit_contact_message()
       ├── validation
       ├── duplicate protection
       └── database rate limit
  → sendContactNotification()
       └── Resend REST API with idempotency key
  → finalize_contact_notification()
```

The notification API is called with native `fetch`, avoiding an additional runtime dependency. Database capture is the source of truth; email is a secondary alert channel.

## Content flows

Project, blog, media and profile mutations follow this pattern:

```text
Admin form
  → authenticated Server Action
  → validation and normalisation
  → Supabase RLS
  → audit event / lifecycle trigger
  → revalidatePath()
  → public server rendering
```

## Database migrations

```text
202607310001_cms_foundation.sql
202607310002_project_cms.sql
202607310003_blog_cms.sql
202607310004_media_library.sql
202607310005_profile_homepage_cms.sql
202607310006_contact_inbox.sql
```

## v0.9.0 observability and discovery layer

```text
Public route render
  ├── CMS SEO settings → Next.js Metadata API
  ├── Published content → sitemap + JSON-LD
  ├── Consent/DNT decision
  │     ├── Optional GA4 or Plausible script
  │     └── First-party page views / Web Vitals / bounded errors
  └── POST /api/telemetry
          ↓
     server-side session hashing
          ↓
     submit_telemetry_event(...)
          ↓
     telemetry_events (admin read only)
```

`/api/health` performs a bounded database connectivity check. Security headers are returned from Next.js configuration so they also apply to SSR and route-handler responses on Netlify.
