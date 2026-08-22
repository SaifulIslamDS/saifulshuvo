# Production Checklist

## Build and deployment

- [ ] `node -v` reports the approved Node 24 LTS runtime.
- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build` passes.
- [ ] Netlify build uses Node 24.18.1 and pnpm 11.18.0.
- [ ] `/api/health` returns `status: ok` and `database: ok`.
- [ ] No secrets are committed to Git.

## Search and metadata

- [ ] Production `NEXT_PUBLIC_SITE_URL` is the canonical domain.
- [ ] Homepage title and description are correct.
- [ ] Project and article canonical URLs are correct.
- [ ] Open Graph image renders at `/opengraph-image`.
- [ ] `robots.txt` allows public content and blocks admin/auth/API routes.
- [ ] `sitemap.xml` contains only published public content.
- [ ] Search Console and Bing verification tags appear when configured.
- [ ] ProfilePage, CreativeWork and Article JSON-LD validate.

## Analytics and privacy

- [ ] Consent banner appears when required.
- [ ] Necessary-only choice prevents analytics requests.
- [ ] Allow-analytics choice enables configured telemetry.
- [ ] DNT: 1 prevents analytics when DNT support is enabled.
- [ ] GA4 or Plausible script loads only when configured and allowed.
- [ ] `/admin/analytics` shows page views after consented production visits.
- [ ] Web Vitals samples appear after public page loads.
- [ ] Retention purge deletes only expired telemetry.

## Accessibility

- [ ] Keyboard focus is visible.
- [ ] Skip link moves focus to main content.
- [ ] Navigation, theme toggle and forms work by keyboard.
- [ ] Mobile zoom is not disabled.
- [ ] Reduced-motion preference suppresses non-essential animation.
- [ ] Images have meaningful alt text or intentional empty alt text.
- [ ] Error pages offer a retry or safe navigation action.

## Security

- [ ] CSP is present and does not produce unexpected production violations.
- [ ] HSTS, frame, MIME, referrer and permissions headers are present.
- [ ] Admin/auth responses are private and no-store.
- [ ] API responses are no-store and noindex.
- [ ] Google OAuth still completes under the opener policy.
- [ ] Telemetry RPC rejects unsupported event types and oversized metadata.
- [ ] Contact rate limiting and inbox privacy remain functional.

## Performance

- [ ] Homepage has no unexpected layout shift.
- [ ] Hero portrait dimensions are set.
- [ ] Below-the-fold images lazy load.
- [ ] Third-party analytics does not block first render.
- [ ] Lighthouse is run for mobile and desktop.
- [ ] LCP, CLS and INP regressions are reviewed rather than hidden.

## Release

- [ ] Production routes are manually audited.
- [ ] Netlify deploy log has no warnings requiring action.
- [ ] Supabase logs show no repeated policy or RPC errors.
- [ ] GitHub release notes are prepared.
- [ ] Tag `v0.9.0` is created only after approval.
