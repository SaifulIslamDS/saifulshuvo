# v0.7.0 — Skills, Experience and Homepage CMS

## Added

- Database-driven homepage identity, hero, About, statistics, process, principles and CTA.
- Section-level public visibility without content deletion.
- Homepage service-card CRUD.
- Skill group and individual skill CRUD with ordering, learning, evidence and proficiency metadata.
- Experience timeline CRUD with achievements, technologies and homepage controls.
- Dynamic public header and footer identity, links, contact details and CV state.
- Profile-content audit events and automatic homepage content-version increments.
- Responsive desktop/mobile admin interfaces for the new modules.
- Static public fallback when Supabase public configuration is unavailable.

## Database

Migration: `202607310005_profile_homepage_cms.sql`

New tables:

- `experience_entries`
- `services`

Extended tables:

- `site_settings`
- `skill_groups`
- `skills`

## Security

- Owner-only Server Actions.
- Owner-only database writes through RLS.
- Anonymous reads limited to active groups, skills, experience and services.
- Server-side URL validation and audit events.

## Documentation

All Markdown documentation remains in `docs/`; only `README.md` remains in the project root.
