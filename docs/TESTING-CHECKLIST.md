# Testing Checklist

## Existing regression suite

- [ ] Google-only allow-listed admin login works.
- [ ] Public projects and project CMS lifecycle work.
- [ ] Blog editor, revisions, taxonomies and scheduling work.
- [ ] Media upload, profile image and CV versions work.
- [ ] Homepage, skills, experience and services CMS work.
- [ ] Contact submission, inbox workflow and email retry work.
- [ ] Light/dark themes work on desktop and mobile.

## v0.9.0 SEO

- [ ] `/admin/seo` loads current settings.
- [ ] Valid SEO settings save and revalidate public metadata.
- [ ] Invalid title template without `%s` is rejected.
- [ ] Social image selection updates Open Graph metadata.
- [ ] Indexing switch changes robots and root robots metadata.
- [ ] `/sitemap.xml` contains published public routes only.
- [ ] `/opengraph-image` returns a 1200×630 image.
- [ ] Homepage, project and article JSON-LD is valid JSON.

## v0.9.0 analytics

- [ ] Consent-required mode shows the preference panel.
- [ ] Necessary-only prevents `/api/telemetry` requests.
- [ ] Allow analytics stores page-view events.
- [ ] DNT prevents collection when enabled.
- [ ] Web Vitals appear after production page loads.
- [ ] A test client error appears without private form data.
- [ ] `/admin/analytics` filters 7, 30, 90 and 365 days.
- [ ] Retention purge deletes only expired events.
- [ ] Invalid telemetry type receives HTTP 400.
- [ ] Excessive telemetry receives HTTP 429.

## v0.9.0 hardening

- [ ] `/api/health` reports a healthy database.
- [ ] CSP and other security headers appear on SSR pages.
- [ ] Google OAuth still succeeds.
- [ ] Admin/auth/API routes are noindex and no-store.
- [ ] Global and segment error boundaries render recovery UI.
- [ ] Skip link and visible keyboard focus work.
- [ ] Reduced-motion preference is respected.
- [ ] No unexpected horizontal overflow exists.

## Build

```powershell
pnpm clean
pnpm typecheck
pnpm build
```

- [ ] Footer **Analytics choices** reopens the consent prompt.
