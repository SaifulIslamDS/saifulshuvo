# SEO, Analytics, Performance and Production Hardening

## Overview

v0.9.0 adds a production-readiness layer without turning the portfolio into a multi-user SaaS. Search metadata and measurement preferences remain controlled by the single-owner CMS.

## SEO management

Admin route:

```text
/admin/seo
```

Managed settings:

- Default site title and page-title template.
- Default meta description and keywords.
- Default Open Graph image from the media library.
- Twitter/X creator handle.
- Public indexing switch.
- Google Search Console verification token.
- Bing Webmaster Tools verification token.

The root layout generates Metadata API values from these settings. Project and article pages continue to provide page-specific metadata and canonical URLs.

## Structured data

Public output includes:

- `ProfilePage` and `Person` data on the homepage.
- `CreativeWork` data on project case studies.
- `Article` data on published blog posts.

Structured data contains only content visible on the corresponding public page.

## Search discovery files

- `/robots.txt` reads the CMS indexing switch.
- `/sitemap.xml` includes public pages, published projects, published articles, categories and tags.
- `/opengraph-image` generates a 1200×630 default social image.
- `/manifest.webmanifest` provides application identity and theme metadata.

Admin, auth and API routes are disallowed from crawling and receive noindex response headers.

## Analytics providers

Supported modes:

```text
none       First-party telemetry only
Google     Optional GA4 script
Plausible  Optional Plausible script
```

Third-party scripts load only when their provider is configured and privacy conditions permit them.

## Consent and privacy

The CMS can:

- Require explicit analytics consent.
- Respect the browser's `Do Not Track` signal.
- Independently enable page views, Web Vitals and client-error telemetry.
- Set a retention period between 7 and 730 days.
- Reopen the consent prompt from the footer’s **Analytics choices** control.

First-party telemetry stores a server-hashed session identifier. Raw IP addresses, email addresses, contact-form values and authenticated user IDs are not stored in the telemetry table.

## First-party telemetry

Public browser events are sent to:

```text
POST /api/telemetry
```

The route validates the request, applies CMS privacy settings, hashes the browser session identifier server-side and calls the restricted `submit_telemetry_event(...)` database function.

Supported event types:

- `page_view`
- `web_vital`
- `client_error`

The database RPC limits each session hash to 120 events per hour and rejects oversized metadata.

## Analytics dashboard

Admin route:

```text
/admin/analytics
```

It reports:

- Page views.
- Anonymous sessions.
- Top paths.
- Core Web Vitals averages and ratings.
- Recent bounded client errors.
- Retention configuration.

The cleanup action calls `purge_expired_telemetry()` and deletes only events older than the configured retention period.

## Performance work

- Core Web Vitals are captured with `useReportWebVitals`.
- Third-party scripts do not load before privacy conditions are satisfied.
- Non-critical public images use lazy loading and asynchronous decoding.
- The hero portrait receives an explicit intrinsic size and high fetch priority.
- Immutable caching is configured for Next.js static chunks.
- A lightweight client instrumentation file registers early error and navigation signals.

## Accessibility work

- Skip-to-content link.
- Visible `:focus-visible` outlines.
- Reduced-motion support.
- Error-boundary recovery UI.
- Public main landmarks have a stable `main-content` target.

## Security hardening

Next.js response headers include:

- Content Security Policy.
- HSTS.
- Frame denial.
- MIME sniffing protection.
- Referrer policy.
- Permissions Policy.
- Cross-Origin-Opener-Policy suitable for OAuth redirects/popups.

Admin, auth and API routes receive private/no-store or no-store cache directives.

## Health endpoint

```text
GET /api/health
```

The endpoint reports application version, database state, response time and timestamp. It does not return environment variables, keys, user data or stack traces.
