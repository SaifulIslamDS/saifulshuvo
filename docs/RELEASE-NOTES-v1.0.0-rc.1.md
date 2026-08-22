# Release Notes — v1.0.0-rc.1

## Purpose

First frontend release candidate for the final WordPress + cPanel static architecture.

## Major changes

- Replaced Supabase public data reads with WPGraphQL.
- Added WordPress application adapter/mappers under `src/lib/wordpress`.
- Converted contact and telemetry writes to WordPress REST.
- Removed Next.js admin/auth/API backend routes.
- Removed Supabase runtime libraries and migrations.
- Removed Tiptap/admin-CMS dependencies.
- Removed Netlify configuration.
- Enabled Next.js static export.
- Added build-time static generation for project/blog/taxonomy dynamic routes.
- Converted blog search/filter/pagination to client-side behavior.
- Added cPanel/Apache `.htaccess` generation.
- Added architecture, GraphQL-contract, static-output, and deployment checks.
- Archived Supabase-era documentation under `docs/legacy-supabase-v0.9.0`.

## Validation performed in preparation environment

- Source architecture audit: PASS.
- TypeScript syntax/transpile pass across the updated source tree: PASS.
- Internal semantic check using local framework stubs: PASS.
- Node syntax check for all deployment/verification scripts: PASS.
- `package.json` and pnpm lockfile direct dependency specification check: PASS.

## Validation still required in networked project environment

- `pnpm install --frozen-lockfile`
- `pnpm verify:wordpress`
- `pnpm typecheck`
- `pnpm build`
- `pnpm check:static`
- Preview-domain browser QA
- WordPress REST/CORS integration QA

A production cutover should not occur until these live-environment checks pass.
