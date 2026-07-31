-- Portfolio CMS v0.7.0 — Skills, Experience and Homepage CMS
-- Apply after 202607310004_media_library.sql.

begin;

alter table public.site_settings
  add column if not exists hero_eyebrow text not null default 'DATA ANALYTICS · WEB APPLICATIONS · APPLIED AI',
  add column if not exists hero_heading text not null default 'Turning business problems into',
  add column if not exists hero_emphasis text not null default 'useful digital solutions.',
  add column if not exists hero_lead text not null default 'I combine professional experience, business understanding and modern data technologies to create dashboards, applications and practical AI-assisted workflows.',
  add column if not exists hero_primary_label text not null default 'Explore my work',
  add column if not exists hero_primary_href text not null default '/projects',
  add column if not exists hero_secondary_label text not null default 'Discuss an opportunity',
  add column if not exists hero_secondary_href text not null default '/contact',
  add column if not exists about_eyebrow text not null default 'About me',
  add column if not exists about_title text not null default 'A multidisciplinary professional moving deeper into data and intelligent systems.',
  add column if not exists about_description text not null default 'My advantage is the ability to connect business processes, data, users and technology to create practical outcomes.',
  add column if not exists about_paragraphs text[] not null default '{}',
  add column if not exists positioning_title text not null default 'Business-aware data and software execution',
  add column if not exists positioning_points text[] not null default '{}',
  add column if not exists process_items jsonb not null default '[]'::jsonb,
  add column if not exists work_principles text[] not null default '{}',
  add column if not exists cta_eyebrow text not null default 'Open to remote opportunities',
  add column if not exists cta_title text not null default 'Looking for someone who can understand data, products and business operations?',
  add column if not exists cta_description text not null default 'I am open to data and BI roles, web application work, SaaS collaboration, WordPress projects and practical AI-assisted initiatives.',
  add column if not exists cta_primary_label text not null default 'Start a conversation',
  add column if not exists cta_primary_href text not null default '/contact',
  add column if not exists cta_secondary_label text not null default 'LinkedIn profile',
  add column if not exists cta_secondary_href text not null default 'https://www.linkedin.com/in/saifulislampro',
  add column if not exists homepage_section_visibility jsonb not null default '{"about":true,"experience":true,"services":true,"skills":true,"projects":true,"insights":true,"process":true,"cta":true}'::jsonb,
  add column if not exists homepage_stats jsonb not null default '[]'::jsonb,
  add column if not exists version integer not null default 1;

alter table public.skill_groups
  add column if not exists description text,
  add column if not exists accent text not null default 'blue',
  add column if not exists is_featured boolean not null default true;

alter table public.skills
  add column if not exists description text,
  add column if not exists proficiency_level integer check (proficiency_level between 0 and 100),
  add column if not exists years_experience numeric(4,1) check (years_experience is null or years_experience >= 0),
  add column if not exists evidence_url text;

create table if not exists public.experience_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  employment_type text,
  location text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  period_label text,
  summary text not null,
  achievements text[] not null default '{}',
  technologies text[] not null default '{}',
  is_featured boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create index if not exists experience_entries_public_idx
  on public.experience_entries (is_active, is_featured, sort_order, start_date desc);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  icon text not null default 'spark',
  description text not null,
  accent text not null default 'blue',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_public_idx
  on public.services (is_active, sort_order);

create or replace function public.increment_profile_content_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.version = coalesce(old.version, 0) + 1;
  return new;
end;
$$;

drop trigger if exists site_settings_increment_version on public.site_settings;
create trigger site_settings_increment_version
before update on public.site_settings
for each row execute function public.increment_profile_content_version();

drop trigger if exists experience_entries_set_updated_at on public.experience_entries;
create trigger experience_entries_set_updated_at
before update on public.experience_entries
for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

alter table public.experience_entries enable row level security;
alter table public.services enable row level security;

revoke all on public.experience_entries from anon, authenticated;
revoke all on public.services from anon, authenticated;

grant select on public.experience_entries, public.services to anon;
grant select, insert, update, delete on public.experience_entries, public.services to authenticated;

drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read"
on public.skills for select
to anon, authenticated
using (
  (
    is_active
    and exists (
      select 1 from public.skill_groups as groups
      where groups.id = skills.group_id and groups.is_active
    )
  )
  or (select public.is_portfolio_admin())
);

drop policy if exists "experience_entries_public_read" on public.experience_entries;
create policy "experience_entries_public_read"
on public.experience_entries for select
to anon, authenticated
using (is_active or (select public.is_portfolio_admin()));

drop policy if exists "experience_entries_admin_write" on public.experience_entries;
create policy "experience_entries_admin_write"
on public.experience_entries for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "services_public_read" on public.services;
create policy "services_public_read"
on public.services for select
to anon, authenticated
using (is_active or (select public.is_portfolio_admin()));

drop policy if exists "services_admin_write" on public.services;
create policy "services_admin_write"
on public.services for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

update public.site_settings
set
  about_paragraphs = case when cardinality(about_paragraphs) = 0 then array[
    'I began my development journey with HTML, CSS, JavaScript, PHP and WordPress, delivering responsive websites, customisation and digital work for local and international clients. Today, I build modern application interfaces with React, Next.js, TypeScript, Node.js, Supabase and PostgreSQL.',
    'Alongside development, I am building a professional analytics portfolio with Excel, Power BI, SQL and Python. My career direction is toward Data Analytics, Data Science, Data Engineering, Machine Learning, Deep Learning, LLMs and Agentic AI, with a focus on international remote teams and business-oriented technology products.'
  ] else about_paragraphs end,
  positioning_points = case when cardinality(positioning_points) = 0 then array[
    'Analyse data and communicate decisions clearly',
    'Build responsive, maintainable web applications',
    'Translate workflows into structured digital products',
    'Apply LLMs and AI tools responsibly to real work'
  ] else positioning_points end,
  process_items = case when jsonb_array_length(process_items) = 0 then '[
    {"number":"01","title":"Understand","description":"Clarify users, business context, available data, constraints and success criteria."},
    {"number":"02","title":"Design","description":"Create a clean information architecture, workflow, requirements and technical direction."},
    {"number":"03","title":"Build","description":"Implement in small, reviewable milestones with maintainable components and version control."},
    {"number":"04","title":"Audit","description":"Run type checks and builds, inspect the output, document changes and improve with evidence."}
  ]'::jsonb else process_items end,
  work_principles = case when cardinality(work_principles) = 0 then array[
    'Analytical, organised and detail-oriented',
    'Comfortable across business and technology',
    'Strong documentation and project discipline',
    'Adaptable, self-driven and committed to learning',
    'Open to remote collaboration worldwide'
  ] else work_principles end,
  homepage_stats = case when jsonb_array_length(homepage_stats) = 0 then '[
    {"value":"13+","label":"Years of professional experience"},
    {"value":"7+","label":"Years in website development"},
    {"value":"4","label":"End-to-end analytics projects"},
    {"value":"8+","label":"Software and product initiatives"}
  ]'::jsonb else homepage_stats end
where id = 'primary';

insert into public.experience_entries (
  id, title, organization, period_label, summary, is_featured, is_active, sort_order
)
values
  ('30000000-0000-4000-8000-000000000001', 'Professional and industry experience', 'Business, operations and client service', '13+ years', 'A long practical foundation across garments, business operations, administration, project work, finance-related tasks and client service.', true, true, 10),
  ('30000000-0000-4000-8000-000000000002', 'Website development experience', 'Independent and client projects', '7+ years', 'Hands-on delivery of responsive websites, WordPress projects, customisation, maintenance, landing pages and client-facing digital work.', true, true, 20),
  ('30000000-0000-4000-8000-000000000003', 'Data analytics and BI portfolio', 'Professional portfolio development', 'Current', 'Business-focused case studies using Excel, Power BI, PostgreSQL, SQL, Python, Pandas and documented analytical storytelling.', true, true, 30),
  ('30000000-0000-4000-8000-000000000004', 'Full-stack, SaaS and applied AI', 'Product and application initiatives', 'Growing', 'Building modern applications with Next.js, TypeScript, Supabase and structured AI-assisted planning, testing and release workflows.', true, true, 40)
on conflict (id) do update set
  title = excluded.title,
  organization = excluded.organization,
  period_label = excluded.period_label,
  summary = excluded.summary,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.services (id, title, icon, description, accent, is_active, sort_order)
values
  ('40000000-0000-4000-8000-000000000001', 'Data Analytics & BI', 'chart', 'Clean, analyse and communicate business data through Excel, SQL, Python, Power BI dashboards, KPIs and decision-ready reports.', 'blue', true, 10),
  ('40000000-0000-4000-8000-000000000002', 'Web & Application Development', 'code', 'Build responsive websites, portfolios, landing pages and database-driven interfaces with modern frontend and backend technologies.', 'cyan', true, 20),
  ('40000000-0000-4000-8000-000000000003', 'SaaS & Business Systems', 'layers', 'Translate operational requirements into structured product scopes, admin dashboards, ERP workflows and maintainable application releases.', 'violet', true, 30),
  ('40000000-0000-4000-8000-000000000004', 'AI-Assisted Solutions', 'brain', 'Apply prompt engineering, LLM workflows and AI-assisted development to content, reporting, automation and practical business processes.', 'green', true, 40),
  ('40000000-0000-4000-8000-000000000005', 'WordPress, SEO & Digital Growth', 'search', 'Develop and customise WordPress websites while improving technical structure, search visibility, landing pages and digital campaign support.', 'orange', true, 50),
  ('40000000-0000-4000-8000-000000000006', 'Business & Project Operations', 'briefcase', 'Support projects with accounting knowledge, documentation, administration, HR understanding, process mapping and disciplined delivery.', 'blue', true, 60)
on conflict (id) do update set
  title = excluded.title,
  icon = excluded.icon,
  description = excluded.description,
  accent = excluded.accent,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

commit;
