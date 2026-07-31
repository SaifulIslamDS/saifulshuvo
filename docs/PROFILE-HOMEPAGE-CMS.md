# Skills, Experience and Homepage CMS

## Purpose

v0.7.0 replaces the remaining static professional profile content with database-backed, owner-managed content while preserving a safe static fallback when public Supabase configuration is unavailable.

## Homepage CMS

Route: `/admin/homepage`

The editor manages:

- Public owner name, professional title, short biography, email, location and availability.
- GitHub, LinkedIn and website URLs.
- Hero eyebrow, headline, highlighted text, introduction and two action buttons.
- About title, introduction, paragraphs and professional-positioning points.
- Homepage evidence statistics.
- Work process and professional principles.
- CTA copy and links.
- Visibility of About, Experience, Services, Skills, Projects, Insights, Process and CTA sections.
- Homepage service cards.

A hidden section keeps its content in the database. Saving the homepage increments `site_settings.version`, writes an audit event and revalidates public and admin routes.

## Skills CMS

Route: `/admin/skills`

Skill groups support title, description, icon, accent, order, visibility and homepage-feature status. Individual skills support group assignment, description, proficiency label, optional numeric proficiency, years of experience, evidence URL, learning status, featured status, visibility and order.

A visible skill must belong to a visible group before an anonymous visitor can read it. Hidden skills can be permanently deleted; groups must be empty before deletion.

## Experience CMS

Routes:

```text
/admin/experience
/admin/experience/new
/admin/experience/[id]/edit
```

Entries support organisation, role, employment type, location, dates, current-role status, public period label, summary, achievements, technologies, homepage-feature status, visibility and order.

Hidden experience records remain available to administrators and may then be permanently deleted.

## Services CMS

Service cards are managed within `/admin/homepage`. A service stores title, icon, accent, description, visibility and order. Hidden services can be permanently deleted.

## Public rendering

The homepage, header and footer read active profile content from Supabase. When the public Supabase variables are absent, the application uses the retained v0.2.0 static portfolio content so local UI development does not fail.

## Security

- Every mutation runs through a Server Action and calls `requireAdmin()`.
- Database writes require `public.is_portfolio_admin()` through RLS.
- Anonymous users only read visible profile records.
- Audit events record homepage, skill, experience and service mutations.
- URLs are validated server-side before storage.
