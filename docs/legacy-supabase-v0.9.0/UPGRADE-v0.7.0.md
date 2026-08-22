# Upgrade to v0.7.0

## 1. Preserve the current working state

```powershell
cd D:\MyProjects\portfolio
git status
git add .
git commit -m "chore: preserve v0.6.0 working state"
git push origin main
```

Skip the commit when the working tree is already clean and v0.6.0 is committed.

## 2. Apply the upgrade package

```powershell
cd "D:\Path\To\portfolio-v0.7.0-upgrade"
powershell -ExecutionPolicy Bypass `
  -File .\apply-v0.7.0.ps1 `
  -Target "D:\MyProjects\portfolio"
```

The script preserves `.git`, `.env.local` and `pnpm-lock.yaml`, replaces changed source and documentation files, and removes stale `.next` output.

## 3. Apply the migration once

Run the complete SQL file in Supabase SQL Editor:

```text
supabase/migrations/202607310005_profile_homepage_cms.sql
```

Verify:

```sql
select version, hero_heading, homepage_section_visibility
from public.site_settings
where id = 'primary';

select title, is_active, is_featured, sort_order
from public.skill_groups
order by sort_order;

select title, organization, is_active, is_featured
from public.experience_entries
order by sort_order;

select title, is_active, sort_order
from public.services
order by sort_order;
```

No new environment variable is required.

## 4. Install and build

```powershell
cd D:\MyProjects\portfolio
nvm use 22.23.2
corepack enable
corepack prepare pnpm@11.18.0 --activate
pnpm install
pnpm typecheck
pnpm build
```

## 5. Functional audit

Test:

```text
/
/admin
/admin/homepage
/admin/skills
/admin/experience
/admin/experience/new
```

Use the detailed `TESTING-CHECKLIST.md` before deployment.

## 6. Commit and deploy

```powershell
git add .
git commit -m "feat: build skills experience and homepage CMS"
git push origin main
```

After production audit:

```powershell
git tag -a v0.7.0 -m "v0.7.0 - Skills, Experience and Homepage CMS"
git push origin v0.7.0
```
