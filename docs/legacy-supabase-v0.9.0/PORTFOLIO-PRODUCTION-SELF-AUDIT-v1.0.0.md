# Portfolio Production Self-Audit and v1.0.0 Release Checklist

**Project:** Saiful Shuvo Portfolio CMS  
**Frozen baseline:** `v0.9.0 — SEO, Analytics, Performance and Production Hardening`  
**Target release:** `v1.0.0 — Production Portfolio CMS`  
**Audit owner:** Saiful Islam / Saiful Shuvo  

---

## 1. Recommended Release Strategy

`v0.9.0` এখন feature-frozen baseline হিসেবে থাকবে।

এই পর্যায়ে:

- নতুন বড় feature যোগ করা হবে না।
- Audit-এ পাওয়া defect, security issue, broken workflow, content error, accessibility issue, performance regression এবং deployment problem শুধু ঠিক করা হবে।
- প্রতিটি correction release হবে `v0.9.1`, `v0.9.2`, `v0.9.3` ইত্যাদি।
- সব production criteria pass করার পর `v1.0.0` release করা হবে।
- `v1.0.0` release-এর পরে পাওয়া bug হবে `v1.0.1`, `v1.0.2` ইত্যাদি।

### Important clarification

`v0.9.x` transitional releases ব্যবহার করতে চাইলে full self-audit **v1.0.0-এর আগে** করতে হবে।

`v1.0.0` release করার পরে audit করলে transitional version আর `v0.9.x` হবে না; তখন fixes semantic versioning অনুযায়ী `v1.0.1` বা প্রয়োজন অনুসারে `v1.1.0` হবে।

---

## 2. Freeze the v0.9.0 Baseline

### 2.1 Confirm clean repository

```powershell
git status
git log --oneline -5
```

Expected:

- Working tree clean
- Correct production commit on `main`
- No untracked secret or environment file

### 2.2 Run final baseline verification

```powershell
node -v
pnpm -v
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

Record:

- Node version
- pnpm version
- Build date
- Commit SHA
- Netlify deploy ID

### 2.3 Tag the frozen baseline

Only if the production deployment has been checked:

```powershell
git tag -a v0.9.0 -m "v0.9.0 - SEO, Analytics, Performance and Production Hardening"
git push origin v0.9.0
```

### 2.4 Create an audit branch

Recommended:

```powershell
git checkout main
git pull origin main
git checkout -b audit/v1.0.0
```

Use this branch for audit notes only. Individual fixes may be made on focused branches or directly through the established main-branch workflow.

---

## 3. Audit Evidence Folder

Create:

```text
docs/audit/v1.0.0/
├── README.md
├── AUDIT-RESULTS.md
├── ISSUE-REGISTER.md
├── ROUTE-MATRIX.md
├── SECURITY-RESULTS.md
├── PERFORMANCE-RESULTS.md
├── ACCESSIBILITY-RESULTS.md
├── SEO-RESULTS.md
├── DATABASE-RESULTS.md
├── RELEASE-GO-NO-GO.md
└── evidence/
```

The `evidence/` folder may contain:

- Screenshots
- Lighthouse exports
- Browser console logs
- Netlify deploy logs
- Supabase screenshots
- SQL verification outputs
- Search Console screenshots
- Mobile-device screenshots

Do not commit:

- API keys
- Access tokens
- Private email contents
- Raw IP addresses
- `.env.local`
- Supabase service-role key

---

# 4. Step-by-Step Production Audit

## Phase 1 — Build and Repository Integrity

### 4.1 Local build

- [ ] `pnpm install --frozen-lockfile` succeeds
- [ ] `pnpm typecheck` succeeds
- [ ] `pnpm build` succeeds
- [ ] No ignored dependency build remains
- [ ] No unsupported Node engine warning
- [ ] No stale `.next` generated-type error
- [ ] No uncommitted generated file
- [ ] `pnpm-lock.yaml` is committed
- [ ] `.nvmrc` matches production Node version
- [ ] `package.json` engine matches `.nvmrc`
- [ ] `packageManager` pins the expected pnpm version

### 4.2 Repository hygiene

- [ ] Root contains only `README.md` among Markdown documents
- [ ] All other project documentation is under `docs/`
- [ ] `.env.local` is ignored
- [ ] No secret appears in Git history
- [ ] No unused ZIP, screenshot or generated output is committed
- [ ] Migrations are sequential and immutable
- [ ] Release notes exist for every release
- [ ] README setup instructions match the real project

### 4.3 Netlify build

- [ ] Production deploy succeeds from a clean build
- [ ] Correct branch is deployed
- [ ] Correct Node and pnpm versions appear in logs
- [ ] No warning hides a failed optional step
- [ ] Environment variables are available in the correct deploy context
- [ ] Deploy Preview does not accidentally use production-only secrets
- [ ] Rollback to a previous deploy is understood and tested

---

## Phase 2 — Route and Navigation Audit

Test every route in:

- Desktop Chrome
- Desktop Firefox or Edge
- Android Chrome
- One narrow mobile viewport
- Light theme
- Dark theme
- Logged-out state
- Logged-in admin state

### 4.4 Public routes

- [ ] `/`
- [ ] `/projects`
- [ ] Every published `/projects/[slug]`
- [ ] `/blog`
- [ ] Every published `/blog/[slug]`
- [ ] Every category route
- [ ] Every tag route
- [ ] `/contact`
- [ ] `/privacy`
- [ ] `/cv`
- [ ] `/robots.txt`
- [ ] `/sitemap.xml`
- [ ] `/manifest.webmanifest`
- [ ] `/opengraph-image`
- [ ] `/api/health`
- [ ] Invalid route shows the correct 404 page

For every public route:

- [ ] Direct URL load works
- [ ] Browser refresh works
- [ ] Back/forward navigation works
- [ ] Header and footer links work
- [ ] No horizontal overflow
- [ ] No broken image
- [ ] No visible placeholder content
- [ ] No hydration warning
- [ ] No browser-console error
- [ ] No failed network request

### 4.5 Admin routes

- [ ] `/admin/login`
- [ ] `/admin`
- [ ] `/admin/homepage`
- [ ] `/admin/projects`
- [ ] `/admin/posts`
- [ ] `/admin/posts/taxonomies`
- [ ] `/admin/media`
- [ ] `/admin/settings`
- [ ] `/admin/skills`
- [ ] `/admin/experience`
- [ ] `/admin/inbox`
- [ ] `/admin/seo`
- [ ] `/admin/analytics`

Verify:

- [ ] Logged-out user is redirected to login
- [ ] Approved admin can enter
- [ ] Unapproved Google account is rejected
- [ ] Direct refresh on protected route works
- [ ] Sign-out invalidates the session
- [ ] Browser back button does not reopen protected data after sign-out
- [ ] Admin page is not indexed
- [ ] Admin data is not cached publicly

---

## Phase 3 — Authentication and Authorization Audit

### 4.6 Google authentication

- [ ] Production redirect URL is correct
- [ ] Netlify URL is correct if still used
- [ ] Final custom-domain redirect is correct
- [ ] Only intended Google provider is enabled
- [ ] Approved email matches application allow-list
- [ ] Approved email matches database allow-list
- [ ] Removed admin loses access
- [ ] Expired session is handled gracefully

### 4.7 Authorization tests

Use an unapproved account and anonymous browser.

Attempt to:

- [ ] Open protected admin routes
- [ ] Call mutation endpoints directly
- [ ] Read draft projects
- [ ] Read draft posts
- [ ] Read archived records
- [ ] Read contact messages
- [ ] Read analytics events
- [ ] Upload media
- [ ] Delete media
- [ ] Change site settings

Expected result: every unauthorized operation fails safely.

---

## Phase 4 — Database, RLS and Migration Audit

### 4.8 Migration verification

- [ ] All migrations have run exactly once
- [ ] Migration order matches repository order
- [ ] Production schema matches expected schema
- [ ] No manual production-only schema change is undocumented
- [ ] Functions and triggers exist
- [ ] Indexes exist for common filters and RLS columns
- [ ] Foreign keys behave correctly
- [ ] Delete restrictions behave correctly

### 4.9 RLS verification

For every public table:

- [ ] RLS is enabled
- [ ] Anonymous read is limited to intended published/active rows
- [ ] Anonymous insert is denied unless routed through a controlled RPC
- [ ] Anonymous update is denied
- [ ] Anonymous delete is denied
- [ ] Authenticated non-admin write is denied
- [ ] Admin write is allowed only when allow-listed

Audit these areas specifically:

- [ ] Projects
- [ ] Posts
- [ ] Categories and tags
- [ ] Skills and groups
- [ ] Experience
- [ ] Services
- [ ] Media metadata
- [ ] CV documents
- [ ] Contact messages
- [ ] Telemetry events
- [ ] Site settings
- [ ] Audit events
- [ ] Storage objects

### 4.10 Backup and recovery

- [ ] Confirm the backup capability of the active Supabase plan
- [ ] Export a pre-v1.0.0 schema backup
- [ ] Export critical content data
- [ ] Preserve all migration files
- [ ] Document restore procedure
- [ ] Confirm media originals exist in Storage
- [ ] Test restoring into a non-production project where practical

---

## Phase 5 — CMS Functional Audit

### 4.11 Project CMS

Test complete lifecycle:

- [ ] Create draft
- [ ] Preview draft
- [ ] Edit
- [ ] Publish
- [ ] Featured ordering
- [ ] Public rendering
- [ ] Return to draft
- [ ] Archive
- [ ] Restore
- [ ] Delete only when allowed
- [ ] Audit event created
- [ ] Sitemap updates correctly
- [ ] SEO metadata updates correctly

### 4.12 Blog CMS

- [ ] Create article
- [ ] Rich editor formatting
- [ ] Link insertion
- [ ] Image insertion/selection
- [ ] Category assignment
- [ ] Tag assignment
- [ ] Draft preview
- [ ] Immediate publish
- [ ] Scheduled publish
- [ ] Unpublish
- [ ] Revision history
- [ ] Revision preview
- [ ] Revision restore
- [ ] Archive/restore/delete
- [ ] HTML sanitizer blocks unsafe markup
- [ ] Reading time is reasonable
- [ ] Public article metadata is correct

### 4.13 Homepage, skills and experience

- [ ] Hero content update
- [ ] Profile image update
- [ ] Active CV update
- [ ] About content update
- [ ] Section visibility
- [ ] Statistics
- [ ] Services
- [ ] Skill group ordering
- [ ] Skill ordering
- [ ] Experience ordering
- [ ] Hidden content disappears publicly
- [ ] Hidden content remains editable in admin

### 4.14 Media and CV

- [ ] Valid JPG upload
- [ ] Valid PNG/WebP upload
- [ ] Valid PDF upload
- [ ] Oversized file blocked
- [ ] Unsupported file blocked
- [ ] Duplicate detection works
- [ ] Alt text and caption save
- [ ] Assigned media cannot be deleted
- [ ] Unassigned media can be archived/restored/deleted
- [ ] Profile image renders without layout shift
- [ ] Active CV route works
- [ ] Old CV version remains manageable
- [ ] Private documents are not uploaded to public bucket

### 4.15 Contact Inbox

- [ ] Valid message saves
- [ ] Invalid message fails with clear feedback
- [ ] Honeypot works
- [ ] Timing check works
- [ ] Rate limit works
- [ ] Notification email sends
- [ ] Message still saves when notification fails
- [ ] Retry works
- [ ] Read/replied/archive/spam lifecycle works
- [ ] Admin note saves
- [ ] Permanent delete restriction works
- [ ] No raw IP is stored

---

## Phase 6 — Content and Personal Branding Audit

### 4.16 Identity consistency

- [ ] Decide one public display name: `Saiful Shuvo` or `Saiful Islam`
- [ ] Legal/full name can appear in About or CV where appropriate
- [ ] Logo text matches the public brand
- [ ] GitHub name and link are correct
- [ ] LinkedIn name and link are correct
- [ ] Email is correct
- [ ] Location is correct
- [ ] Professional title is honest and current

### 4.17 Content quality

- [ ] No placeholder copy
- [ ] No exaggerated claim
- [ ] No unfinished sentence
- [ ] No spelling or grammar issue
- [ ] Consistent English capitalization
- [ ] Projects have problem, solution, role, stack and outcome
- [ ] In-development projects are clearly labelled
- [ ] Every external link is valid
- [ ] Every public image has useful alt text
- [ ] CV is current
- [ ] Contact availability is current
- [ ] Copyright year is current

### 4.18 Portfolio positioning

The homepage should communicate within a few seconds:

- [ ] Who you are
- [ ] What roles you target
- [ ] Your strongest skills
- [ ] Evidence through projects
- [ ] How to contact or hire you

Recommended primary positioning:

```text
Data Analyst & AI-Focused Software Builder
```

Recommended supporting stack:

```text
Python • SQL • Power BI • Excel • Next.js • Supabase • Applied AI
```

Keep broader skills available, but do not let them dilute the primary Data/AI/Software positioning.

---

## Phase 7 — Responsive and Cross-Browser Audit

Test at minimum:

```text
360 × 800
390 × 844
768 × 1024
1024 × 768
1366 × 768
1440 × 900
1920 × 1080
```

Verify:

- [ ] Navigation fits
- [ ] Mobile menu opens and closes
- [ ] Theme toggle is usable
- [ ] Dialogs fit viewport
- [ ] Admin tables remain usable
- [ ] Forms do not overflow
- [ ] Rich editor toolbar wraps properly
- [ ] Images crop correctly
- [ ] Cards align
- [ ] Buttons meet comfortable touch size
- [ ] No text overlaps
- [ ] Landscape mobile remains usable
- [ ] Zoom to 200% remains navigable

---

## Phase 8 — Accessibility Audit

### 4.19 Keyboard

- [ ] Entire public site works without mouse
- [ ] Entire admin login flow works without mouse
- [ ] Focus order is logical
- [ ] Visible focus indicator exists
- [ ] Mobile menu traps no focus
- [ ] Dialog can be closed with keyboard
- [ ] Skip-to-content works

### 4.20 Semantics

- [ ] One meaningful H1 per page
- [ ] Heading order is logical
- [ ] Form fields have labels
- [ ] Errors are associated with fields
- [ ] Buttons use button elements
- [ ] Links use link elements
- [ ] Decorative images have empty alt
- [ ] Informative images have descriptive alt
- [ ] Icon-only controls have accessible names
- [ ] Main, nav, header and footer landmarks exist

### 4.21 Visual accessibility

- [ ] Text contrast works in light theme
- [ ] Text contrast works in dark theme
- [ ] Focus contrast is visible
- [ ] Information is not communicated by colour alone
- [ ] Reduced-motion preference is respected
- [ ] 200% zoom does not hide essential actions

Recommended tools:

- Browser accessibility tree
- Lighthouse accessibility audit
- axe DevTools
- Keyboard-only testing
- Windows Narrator or another screen reader

---

## Phase 9 — Performance Audit

Audit at least:

```text
/
 /projects
 /blog
 /contact
 one project detail
 one article detail
 /admin/login
```

### 4.22 Lighthouse and Web Vitals

Run mobile and desktop tests.

Target:

- [ ] No severe Lighthouse error
- [ ] LCP is in the good range
- [ ] INP is in the good range
- [ ] CLS is in the good range
- [ ] Images use appropriate dimensions
- [ ] Hero image does not cause layout shift
- [ ] Third-party analytics waits for consent
- [ ] No unnecessary blocking font
- [ ] No large unused JavaScript warning requiring immediate correction
- [ ] No repeated API waterfall
- [ ] Admin pages do not block public rendering

### 4.23 Real-user telemetry

After enough real visits:

- [ ] Compare field Web Vitals with Lighthouse
- [ ] Review poor routes
- [ ] Review client errors
- [ ] Confirm telemetry retention purge works
- [ ] Confirm analytics consent behaviour
- [ ] Confirm Do Not Track behaviour

Do not fail v1.0.0 only because a lab score is below 100. Prioritize real defects, poor Core Web Vitals, layout instability and user-visible delays.

---

## Phase 10 — SEO Audit

### 4.24 Crawlability

- [ ] Production domain returns HTTPS
- [ ] Only one canonical production origin is used
- [ ] `robots.txt` references the correct sitemap
- [ ] Admin/Auth/API routes are blocked or noindexed
- [ ] Public pages intended for search are indexable
- [ ] Netlify preview domain is not treated as canonical
- [ ] Temporary domain indexing is disabled before domain migration where needed

### 4.25 Metadata

For homepage, projects, articles and contact:

- [ ] Unique title
- [ ] Useful meta description
- [ ] Correct canonical URL
- [ ] Correct Open Graph title
- [ ] Correct Open Graph description
- [ ] Correct Open Graph image
- [ ] Correct Twitter/X card
- [ ] No placeholder domain
- [ ] No duplicated canonical URL

### 4.26 Structured data

Validate:

- [ ] `ProfilePage`
- [ ] `Person`
- [ ] `CreativeWork`
- [ ] `Article`

Confirm:

- [ ] Valid JSON-LD
- [ ] Public values match visible content
- [ ] URLs use production domain
- [ ] No unsupported or misleading property
- [ ] No private/admin information is exposed

### 4.27 Search Console

After custom domain launch:

- [ ] Verify domain property
- [ ] Submit sitemap
- [ ] Inspect homepage
- [ ] Inspect one project
- [ ] Inspect one article
- [ ] Check indexing report
- [ ] Check Core Web Vitals report
- [ ] Check manual actions
- [ ] Check security issues
- [ ] Monitor 404 and redirect problems

---

## Phase 11 — Security Audit

### 4.28 Headers

Check public and protected responses:

- [ ] HTTPS enforced
- [ ] HSTS present
- [ ] Content Security Policy present
- [ ] Frame protection present
- [ ] MIME sniffing protection present
- [ ] Referrer Policy present
- [ ] Permissions Policy present
- [ ] Admin responses are no-store
- [ ] Protected pages are noindex

### 4.29 Secrets

- [ ] No secret in repository
- [ ] Supabase service-role key is not exposed to browser
- [ ] Resend key is server-only
- [ ] Hash secrets are server-only
- [ ] Old/unused keys are revoked
- [ ] Netlify environment scopes are correct
- [ ] Preview deploys have only required secrets

### 4.30 Input and output security

- [ ] Blog HTML sanitizer tested
- [ ] Contact fields validated server-side
- [ ] URL fields reject unsafe protocols
- [ ] File uploads validate MIME type and size
- [ ] Server Actions call `requireAdmin()` where required
- [ ] Error pages do not expose stack trace
- [ ] Health endpoint exposes no secret
- [ ] Rate limiting cannot be trivially bypassed
- [ ] Audit logs do not store secret content

### 4.31 Dependency security

```powershell
pnpm audit
pnpm outdated
```

Review rather than blindly upgrading.

- [ ] No known critical vulnerability
- [ ] High vulnerabilities are assessed
- [ ] Lockfile is trusted
- [ ] Build scripts remain explicitly approved
- [ ] Node version is supported
- [ ] Major dependency upgrades are not mixed into final bug-fix release without testing

---

## Phase 12 — Email and Notification Audit

- [ ] Sending domain verified
- [ ] SPF passes
- [ ] DKIM passes
- [ ] From address matches verified domain
- [ ] Reply-To uses visitor email correctly
- [ ] Admin receives notification
- [ ] Email renders on mobile
- [ ] Email contains no unsafe HTML
- [ ] Retry does not create excessive duplicates
- [ ] Failed provider response is recorded safely
- [ ] Contact message remains in database during provider outage

---

## Phase 13 — Analytics and Privacy Audit

- [ ] Consent dialog appears when required
- [ ] Necessary-only choice blocks third-party analytics
- [ ] Allow choice loads configured provider
- [ ] Analytics choice can be reset
- [ ] Do Not Track setting is respected when enabled
- [ ] GA4 or Plausible ID is correct
- [ ] No duplicate page-view event
- [ ] Admin routes are excluded where intended
- [ ] First-party telemetry stores no raw IP
- [ ] Privacy notice matches actual behaviour
- [ ] Retention purge function works
- [ ] Contact data is not sent to analytics

---

## Phase 14 — Domain Migration Audit

Before pointing `saifulshuvo.com` to Netlify:

- [ ] Full WordPress backup
- [ ] Current DNS records exported
- [ ] Existing URL inventory
- [ ] Important old pages mapped to new URLs
- [ ] 301 redirects prepared
- [ ] Email-related DNS records preserved
- [ ] Netlify domain added
- [ ] Supabase Site URL updated
- [ ] Supabase redirect allow-list updated
- [ ] Google OAuth origin/redirect reviewed
- [ ] Resend domain configuration preserved
- [ ] `NEXT_PUBLIC_SITE_URL` updated
- [ ] Canonical URLs updated
- [ ] Sitemap updated
- [ ] Search Console property prepared

After DNS change:

- [ ] Root domain works
- [ ] `www` behaviour is correct
- [ ] HTTPS certificate is active
- [ ] HTTP redirects to HTTPS
- [ ] One preferred host is canonical
- [ ] Admin login works
- [ ] Contact email works
- [ ] CV download works
- [ ] Old URLs redirect
- [ ] No mixed content
- [ ] Search Console sitemap resubmitted

---

## Phase 15 — Failure and Recovery Audit

Test controlled failures:

- [ ] Supabase temporarily unavailable
- [ ] Resend temporarily unavailable
- [ ] Missing optional analytics configuration
- [ ] Broken public image URL
- [ ] Expired admin session
- [ ] Rate-limit response
- [ ] Invalid slug
- [ ] Deleted content URL
- [ ] Netlify rollback

Expected behaviour:

- Clear user-facing message
- No secret or stack trace
- No lost contact submission where database save succeeded
- No corrupted content state
- Recoverable admin workflow

---

# 5. Issue Classification

Use these severities.

## P0 — Release blocker

Examples:

- Public site unavailable
- Unauthorized admin/database access
- Secret exposed
- Data loss
- Authentication bypass
- Contact messages silently lost
- Destructive migration problem

Action:

- Fix immediately
- Do not release v1.0.0

## P1 — High

Examples:

- Core CMS workflow broken
- Mobile navigation unusable
- Published content unavailable
- CV or contact route broken
- Serious accessibility blocker
- Broken canonical or production-domain configuration

Action:

- Must fix before v1.0.0

## P2 — Medium

Examples:

- Layout defect on one viewport
- Incorrect metadata on a secondary page
- Minor CMS inconvenience
- Non-critical console warning
- Moderate performance regression

Action:

- Prefer fixing before v1.0.0
- May be deferred only with explicit decision

## P3 — Low

Examples:

- Tiny spacing inconsistency
- Optional wording refinement
- Cosmetic issue with no functional impact

Action:

- Fix when convenient
- May be documented for post-v1.0.0

---

# 6. Issue Report Template

Send each issue using this format:

```markdown
## Audit Issue

- Audit ID: PORT-AUDIT-001
- Found in version: v0.9.0
- Environment: Production / Local / Netlify Preview
- Route:
- Device:
- Browser:
- Theme: Light / Dark
- User state: Guest / Admin
- Severity: P0 / P1 / P2 / P3

### Expected

What should happen?

### Actual

What happened?

### Reproduction Steps

1.
2.
3.

### Evidence

Screenshot, console error, network error, SQL result or deploy log.

### Suspected Area

Optional.

### Additional Notes

Optional.
```

When reporting multiple issues, use one audit ID per issue.

---

# 7. Transitional Release Rules

Example sequence:

```text
v0.9.0  Frozen production-hardening baseline
v0.9.1  First audit correction set
v0.9.2  Second audit correction set
v0.9.3  Security/accessibility corrections
v0.9.4  Domain and content corrections
v1.0.0  Final production release
```

Each `v0.9.x` release should:

- Contain related fixes
- Include updated migration only when necessary
- Update `docs/CURRENT-STATUS.md`
- Update audit issue statuses
- Include release notes
- Pass typecheck and production build
- Pass regression testing
- Be deployed and audited before tagging

Avoid:

- Unrelated major features
- Large framework migrations
- Dependency upgrades without a reason
- Schema rewrites late in the release cycle
- Combining too many unrelated defects in one opaque commit

---

# 8. Fix Validation Template

For every fixed issue:

```markdown
- Audit ID:
- Fixed in version:
- Fix commit:
- Local verification: Pass / Fail
- Production verification: Pass / Fail
- Regression routes tested:
- Migration required: Yes / No
- Documentation updated: Yes / No
- Closed by:
- Closed on:
```

An issue is not closed until production verification passes.

---

# 9. v1.0.0 Go/No-Go Criteria

Release `v1.0.0` only when:

## Mandatory

- [ ] No open P0 issue
- [ ] No open P1 issue
- [ ] All critical CMS workflows pass
- [ ] Authentication and admin authorization pass
- [ ] RLS and Storage policies pass
- [ ] Production build passes
- [ ] Main public routes pass
- [ ] Contact message persistence passes
- [ ] Backup/export exists
- [ ] Production domain and HTTPS pass
- [ ] No secret exposure
- [ ] Search indexing configuration is intentional
- [ ] Privacy notice matches behaviour
- [ ] Final CV, profile image, logo and content are present

## Recommended

- [ ] No unresolved P2 issue without documented acceptance
- [ ] Core Web Vitals have no known severe failure
- [ ] Accessibility audit has no serious blocker
- [ ] Search Console and sitemap are configured
- [ ] Analytics and consent are verified
- [ ] Rollback procedure is documented
- [ ] Final release notes are ready

### Go decision

```text
GO:
All mandatory criteria passed.

CONDITIONAL GO:
No P0/P1 issue; accepted P2 issues are documented with post-release plan.

NO-GO:
Any P0/P1 issue, data-loss risk, auth/security failure, or critical workflow failure remains.
```

---

# 10. Final v1.0.0 Release Procedure

## 10.1 Final verification

```powershell
git checkout main
git pull origin main

pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

## 10.2 Confirm migration state

- Compare repository migrations with production.
- Export pre-release schema/data backup.
- Confirm no pending manual SQL.

## 10.3 Deploy

```powershell
git push origin main
```

Wait for production deployment and run smoke tests.

## 10.4 Tag only after production passes

```powershell
git tag -a v1.0.0 -m "v1.0.0 - Production Portfolio CMS"
git push origin v1.0.0
```

## 10.5 GitHub release

Suggested title:

```text
v1.0.0 — Production Portfolio CMS
```

Release notes should include:

- Public portfolio
- Project CMS
- Blog CMS
- Media and CV management
- Homepage/skills/experience CMS
- Contact inbox and email notifications
- SEO and structured data
- Analytics and privacy controls
- Performance and security hardening
- Known limitations, if any
- Migration list
- Required environment variables
- Production domain

## 10.6 Post-release smoke test

Immediately test:

- [ ] Homepage
- [ ] One project
- [ ] One article
- [ ] Contact submission
- [ ] Admin login
- [ ] Admin inbox
- [ ] Media upload
- [ ] CV route
- [ ] Sitemap
- [ ] Health endpoint
- [ ] Analytics consent
- [ ] HTTPS and canonical domain

---

# 11. Post-v1.0.0 Policy

After `v1.0.0`:

```text
v1.0.1 — Bug/security patch
v1.0.2 — Additional patch
v1.1.0 — Backward-compatible feature
v2.0.0 — Breaking architecture/product change
```

Do not rewrite or move old migrations after release. Add new migrations.

---

# 12. Recommended Audit Order

Use this exact order to avoid wasted effort:

1. Build and repository integrity
2. Deployment and environment variables
3. Authentication and authorization
4. Database/RLS/Storage
5. Core CMS workflows
6. Public route regression
7. Contact and email
8. Responsive design
9. Accessibility
10. Performance
11. SEO and structured data
12. Analytics and privacy
13. Domain migration
14. Backup and rollback
15. Final content and branding
16. Go/No-Go decision

Security, data integrity and core functionality should be fixed before cosmetic issues.

---

## Final Recommendation

Treat `v0.9.0` as a **feature-complete release candidate baseline**, not as the final product.

From now until `v1.0.0`:

- Freeze new feature scope.
- Record every issue with an audit ID.
- Group related fixes into small `v0.9.x` releases.
- Re-test affected and neighbouring workflows.
- Never tag a release before production verification.
- Keep an explicit issue register and go/no-go record.
- Release `v1.0.0` only when no P0/P1 issue remains.

This process gives the project a professional, auditable path to a stable first production release.
