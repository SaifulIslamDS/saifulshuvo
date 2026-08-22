# v0.9.0 — SEO, Analytics, Performance and Production Hardening

## Added

- Database-managed default SEO title, template, description and keywords.
- Media-library Open Graph image assignment.
- Search-engine verification tokens and indexing switch.
- Dynamic robots, sitemap and generated social artwork.
- Homepage ProfilePage/Person structured data.
- Project CreativeWork structured data.
- Consent-aware Google Analytics 4 and Plausible support.
- A persistent footer control for reopening analytics choices.
- First-party anonymous page-view telemetry.
- Core Web Vitals reporting and admin summaries.
- Bounded client-error telemetry.
- Analytics retention and purge workflow.
- `/admin/seo` and `/admin/analytics` routes.
- `/api/telemetry` and `/api/health` route handlers.
- Global and route-level error recovery UI.
- Client instrumentation for early error reporting.
- Content Security Policy and additional security headers.
- Skip navigation, focus visibility and reduced-motion support.
- Static-chunk caching and image-loading improvements.

## Database

Migration:

```text
supabase/migrations/202607310007_seo_analytics_hardening.sql
```

New table:

```text
telemetry_events
```

New functions:

```text
submit_telemetry_event(...)
purge_expired_telemetry()
```

## Environment

Optional new server-only variable:

```text
TELEMETRY_HASH_SECRET
```

No new npm dependency is required.

## Security and privacy

- Raw IP addresses are not stored in telemetry.
- Browser session IDs are hashed on the server.
- Public users receive no telemetry-table privileges.
- Public inserts occur only through a validating, rate-limited RPC.
- Third-party scripts can be consent-gated and DNT-aware.
- Admin/auth/API caching and indexing are explicitly restricted.

## Upgrade source

This release upgrades v0.8.0 and preserves all existing CMS, inbox, email, media, CV, blog and project functionality.
