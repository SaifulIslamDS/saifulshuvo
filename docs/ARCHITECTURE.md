# Architecture

## High-level flow

```text
Visitor
  └── Next.js public routes
       └── Static v0.2 portfolio data

Owner
  └── /admin/login
       └── Google OAuth through Supabase Auth
            └── /auth/callback exchanges the code
                 └── ADMIN_EMAILS verification
                      └── Protected /admin route group
                           └── Future CMS mutations

Database access
  └── Supabase publishable key
       └── Authenticated JWT
            └── PostgreSQL Row Level Security
                 └── private.admin_allowlist
```

## Application layers

### Public presentation

The homepage, projects, blog and contact pages continue to use `src/data/portfolio.ts` in v0.3.0. This preserves the stable UI while the CMS backend is introduced in controlled milestones.

### Authentication

- `src/lib/supabase/client.ts`: browser client
- `src/lib/supabase/server.ts`: cookie-aware server client
- `src/lib/supabase/proxy.ts`: refreshes and forwards auth cookies
- `src/proxy.ts`: Next.js 16 request proxy
- `src/app/admin/login/actions.ts`: Google login and logout actions
- `src/app/auth/callback/route.ts`: PKCE code exchange and allow-list check
- `src/lib/auth/admin.ts`: current-admin resolution and route guard

### Protected administration

The public login route is outside the protected route group:

```text
src/app/admin/login
src/app/admin/(protected)
```

The route group does not appear in URLs, so the protected dashboard remains `/admin`.

### Database

The migration is stored at:

```text
supabase/migrations/202607310001_cms_foundation.sql
```

The private schema stores the database administrator allow-list. Public content tables use RLS for public reads and owner-only writes.

## v0.4.0 Project content flow

```text
Admin form
  → Next.js Server Action
  → server-verified Supabase user
  → PostgreSQL RLS write policy
  → lifecycle/version trigger
  → audit event trigger
  → route revalidation
  → published public portfolio
```

The public project queries request published rows only. RLS independently enforces the same visibility boundary.
