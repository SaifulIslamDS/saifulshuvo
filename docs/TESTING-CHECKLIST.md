# Testing Checklist

## Build

- [ ] `pnpm install`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] Direct refresh works on all public and admin routes.

## Migration

- [ ] `202607310005_profile_homepage_cms.sql` runs once without error.
- [ ] `experience_entries` and `services` exist with RLS enabled.
- [ ] New `site_settings`, `skill_groups` and `skills` columns exist.
- [ ] Existing projects, posts, media, CV and authentication remain intact.

## Homepage CMS

- [ ] Identity, social, hero, About, statistics, process and CTA fields save.
- [ ] Public homepage updates after save.
- [ ] Header and footer use the managed owner, contact and social data.
- [ ] Each homepage section can be hidden and restored without data loss.
- [ ] Internal paths and external URLs validate correctly.
- [ ] `site_settings.version` increments after updates.

## Services

- [ ] Service create and edit work.
- [ ] Icon, accent, order and visibility render publicly.
- [ ] Hidden service disappears from the homepage.
- [ ] Active service cannot be permanently deleted through the UI.
- [ ] Hidden service can be permanently deleted.

## Skills

- [ ] Skill group create and edit work.
- [ ] Skill create, edit and group reassignment work.
- [ ] Featured skills appear in the primary stack.
- [ ] Learning labels render honestly.
- [ ] Hidden groups and skills disappear publicly.
- [ ] Hidden skills can be deleted.
- [ ] Non-empty groups cannot be deleted.

## Experience

- [ ] Experience create and edit work.
- [ ] Current entry clears its end date.
- [ ] End date earlier than start date is rejected.
- [ ] Featured visible entries render on the homepage in order.
- [ ] Hidden entries disappear publicly and can be deleted.

## Security and audit

- [ ] Non-admin users cannot access new admin routes.
- [ ] Anonymous database writes are rejected.
- [ ] Audit events are created for homepage, service, skill and experience changes.
- [ ] Hidden skill records in hidden groups are not anonymously readable.

## Responsive and themes

- [ ] `/admin/homepage`, `/admin/skills` and `/admin/experience` work on desktop, tablet and mobile.
- [ ] Public homepage remains responsive with 1–6 service cards and 1–4 statistics.
- [ ] Light and dark mode contrast remains readable.
- [ ] No horizontal overflow occurs.
