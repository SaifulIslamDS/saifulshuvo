-- Portfolio CMS v0.3.0 foundation
-- Apply with Supabase SQL Editor or `supabase db push`.
-- After this migration, add the exact Google admin email to
-- private.admin_allowlist before the first OAuth sign-in.

begin;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table if not exists private.admin_allowlist (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

comment on table private.admin_allowlist is
  'Server-side database allow-list for the single portfolio administrator.';

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.admin_allowlist as allowlist
    where allowlist.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

create table if not exists public.site_settings (
  id text primary key default 'primary' check (id = 'primary'),
  owner_name text not null,
  professional_title text not null,
  short_bio text not null,
  contact_email text not null,
  location text not null,
  availability text not null,
  social_links jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skill_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  icon text not null default 'layers',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.skill_groups(id) on delete cascade,
  name text not null,
  proficiency text,
  is_learning boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, name)
);

create index if not exists skills_group_sort_idx
  on public.skills (group_id, sort_order);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  category text not null,
  summary text not null,
  description text not null,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'published', 'archived')),
  project_state text not null default 'in_development'
    check (project_state in ('live', 'in_development', 'portfolio', 'deployed')),
  is_featured boolean not null default false,
  stack text[] not null default '{}',
  highlights text[] not null default '{}',
  accent text not null default 'blue',
  role text not null,
  source_url text,
  live_url text,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_publication_idx
  on public.projects (publication_status, is_featured, sort_order);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  excerpt text not null,
  content text not null default '',
  category text not null,
  publication_status text not null default 'draft'
    check (publication_status in ('draft', 'published', 'archived')),
  read_time_minutes integer not null default 1 check (read_time_minutes > 0),
  featured_image_url text,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_publication_idx
  on public.posts (publication_status, published_at desc);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_created_idx
  on public.audit_events (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and not public.is_portfolio_admin() then
    raise exception 'Only the portfolio administrator can change profile roles.';
  end if;
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_role text := 'member';
begin
  if exists (
    select 1 from private.admin_allowlist
    where email = lower(coalesce(new.email, ''))
  ) then
    resolved_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    resolved_role
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    role = excluded.role,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before update on public.profiles
for each row execute function public.protect_profile_role();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists skill_groups_set_updated_at on public.skill_groups;
create trigger skill_groups_set_updated_at
before update on public.skill_groups
for each row execute function public.set_updated_at();

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
before update on public.skills
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.skill_groups enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.posts enable row level security;
alter table public.audit_events enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.site_settings from anon, authenticated;
revoke all on public.skill_groups from anon, authenticated;
revoke all on public.skills from anon, authenticated;
revoke all on public.projects from anon, authenticated;
revoke all on public.posts from anon, authenticated;
revoke all on public.audit_events from anon, authenticated;

grant select on public.site_settings, public.skill_groups, public.skills, public.projects, public.posts to anon;
grant select on public.profiles, public.site_settings, public.skill_groups, public.skills, public.projects, public.posts, public.audit_events to authenticated;
grant insert, update, delete on public.site_settings, public.skill_groups, public.skills, public.projects, public.posts to authenticated;
grant insert on public.audit_events to authenticated;
grant usage, select on sequence public.audit_events_id_seq to authenticated;
grant update on public.profiles to authenticated;

drop policy if exists "profiles_select_owner_or_admin" on public.profiles;
create policy "profiles_select_owner_or_admin"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id or (select public.is_portfolio_admin()));

drop policy if exists "profiles_update_owner_or_admin" on public.profiles;
create policy "profiles_update_owner_or_admin"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id or (select public.is_portfolio_admin()))
with check ((select auth.uid()) = id or (select public.is_portfolio_admin()));

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
on public.site_settings for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "skill_groups_public_read" on public.skill_groups;
create policy "skill_groups_public_read"
on public.skill_groups for select
to anon, authenticated
using (is_active or (select public.is_portfolio_admin()));

drop policy if exists "skill_groups_admin_write" on public.skill_groups;
create policy "skill_groups_admin_write"
on public.skill_groups for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read"
on public.skills for select
to anon, authenticated
using (is_active or (select public.is_portfolio_admin()));

drop policy if exists "skills_admin_write" on public.skills;
create policy "skills_admin_write"
on public.skills for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
on public.projects for select
to anon, authenticated
using (publication_status = 'published' or (select public.is_portfolio_admin()));

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write"
on public.projects for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read"
on public.posts for select
to anon, authenticated
using (
  (publication_status = 'published' and coalesce(published_at, now()) <= now())
  or (select public.is_portfolio_admin())
);

drop policy if exists "posts_admin_write" on public.posts;
create policy "posts_admin_write"
on public.posts for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "audit_events_admin_read" on public.audit_events;
create policy "audit_events_admin_read"
on public.audit_events for select
to authenticated
using ((select public.is_portfolio_admin()));

drop policy if exists "audit_events_admin_insert" on public.audit_events;
create policy "audit_events_admin_insert"
on public.audit_events for insert
to authenticated
with check ((select public.is_portfolio_admin()) and actor_id = (select auth.uid()));

insert into public.site_settings (
  id,
  owner_name,
  professional_title,
  short_bio,
  contact_email,
  location,
  availability,
  social_links,
  seo
)
values (
  'primary',
  'Saiful Islam',
  'Data Analyst & AI-Focused Software Builder',
  'I combine analytics, business understanding and modern application development to build decision-ready dashboards and practical digital products.',
  'mail@saifulshuvo.com',
  'Dhaka, Bangladesh',
  'Open to remote opportunities worldwide',
  '{"github":"https://github.com/SaifulIslamDS","linkedin":"https://www.linkedin.com/in/saifulislampro","website":"https://saifulshuvo.com"}'::jsonb,
  '{"title":"Saiful Islam | Data Analyst & AI-Focused Software Builder","description":"Data analytics, modern web applications, SaaS products and practical AI-assisted solutions."}'::jsonb
)
on conflict (id) do update set
  owner_name = excluded.owner_name,
  professional_title = excluded.professional_title,
  short_bio = excluded.short_bio,
  contact_email = excluded.contact_email,
  location = excluded.location,
  availability = excluded.availability,
  social_links = excluded.social_links,
  seo = excluded.seo;

insert into public.skill_groups (id, title, icon, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', 'Data Analytics & BI', 'chart', 10),
  ('10000000-0000-4000-8000-000000000002', 'AI & Emerging Technologies', 'brain', 20),
  ('10000000-0000-4000-8000-000000000003', 'Frontend & Application Development', 'code', 30),
  ('10000000-0000-4000-8000-000000000004', 'Backend, Database & CMS', 'layers', 40),
  ('10000000-0000-4000-8000-000000000005', 'Business, Finance & Operations', 'briefcase', 50),
  ('10000000-0000-4000-8000-000000000006', 'Marketing, Design & Communication', 'spark', 60)
on conflict (id) do update set
  title = excluded.title,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.skills (group_id, name, is_learning, is_featured, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', 'Microsoft Excel', false, true, 10),
  ('10000000-0000-4000-8000-000000000001', 'Power BI', false, true, 20),
  ('10000000-0000-4000-8000-000000000001', 'SQL', false, true, 30),
  ('10000000-0000-4000-8000-000000000001', 'Python', false, true, 40),
  ('10000000-0000-4000-8000-000000000001', 'Pandas', false, false, 50),
  ('10000000-0000-4000-8000-000000000001', 'Data Storytelling', false, false, 60),
  ('10000000-0000-4000-8000-000000000002', 'Prompt Engineering', false, true, 10),
  ('10000000-0000-4000-8000-000000000002', 'Large Language Models', false, true, 20),
  ('10000000-0000-4000-8000-000000000002', 'Machine Learning', true, false, 30),
  ('10000000-0000-4000-8000-000000000002', 'Agentic AI', true, false, 40),
  ('10000000-0000-4000-8000-000000000003', 'HTML5', false, false, 10),
  ('10000000-0000-4000-8000-000000000003', 'CSS3', false, false, 20),
  ('10000000-0000-4000-8000-000000000003', 'JavaScript', false, true, 30),
  ('10000000-0000-4000-8000-000000000003', 'TypeScript', false, true, 40),
  ('10000000-0000-4000-8000-000000000003', 'React', false, true, 50),
  ('10000000-0000-4000-8000-000000000003', 'Next.js', false, true, 60),
  ('10000000-0000-4000-8000-000000000004', 'Node.js', false, false, 10),
  ('10000000-0000-4000-8000-000000000004', 'PostgreSQL', false, true, 20),
  ('10000000-0000-4000-8000-000000000004', 'Supabase', false, true, 30),
  ('10000000-0000-4000-8000-000000000004', 'WordPress Development', false, false, 40),
  ('10000000-0000-4000-8000-000000000005', 'Project Management', false, true, 10),
  ('10000000-0000-4000-8000-000000000005', 'Accounting', false, false, 20),
  ('10000000-0000-4000-8000-000000000005', 'Business Process Analysis', false, false, 30),
  ('10000000-0000-4000-8000-000000000006', 'Digital Marketing', false, false, 10),
  ('10000000-0000-4000-8000-000000000006', 'SEO', false, false, 20),
  ('10000000-0000-4000-8000-000000000006', 'Visual Communication', false, false, 30)
on conflict (group_id, name) do update set
  is_learning = excluded.is_learning,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.projects (
  slug, title, category, summary, description, publication_status,
  project_state, is_featured, stack, highlights, accent, role,
  source_url, live_url, sort_order, published_at
)
values
  (
    'data-analytics-portfolio',
    'Data Analytics Portfolio',
    'Analytics & Business Intelligence',
    'Four end-to-end business case studies using Excel, SQL, Python and Power BI with cleaning, KPIs, dashboards and recommendations.',
    'Business-first analytical case studies across retail profitability, financial transactions, marketing campaign performance and HR attrition.',
    'published', 'portfolio', true,
    array['Excel','Power BI','PostgreSQL','Python','Pandas','DAX'],
    array['Excel retail dashboard','100,000-row SQL analysis','Python marketing EDA','Power BI HR dashboard'],
    'blue',
    'Data cleaning, analysis, dashboard development, insight writing and case-study documentation',
    'https://github.com/SaifulIslamDS/data-analytics-portfolio', null, 10, now()
  ),
  (
    'promptkarigor',
    'PromptKarigor',
    'AI Productivity Application',
    'A structured prompt-building application that helps users create, organise, improve and reuse professional prompts.',
    'PromptKarigor evolved from a personal prompt generator into a production-deployed full-stack application through iterative product development.',
    'published', 'live', true,
    array['React','TypeScript','Supabase','Netlify','Prompt Engineering'],
    array['Guided prompt workflow','Reusable prompt management','Versioned releases','Custom domain deployment'],
    'violet',
    'Product idea, requirements, UX direction, implementation workflow, testing and release management',
    null, 'https://promptkarigor.xyz', 20, now()
  ),
  (
    'insightreport',
    'InsightReport',
    'Data Analytics SaaS',
    'A secure CSV/XLSX analytics workflow for quality checks, cleaning, insights, decisions and evidence-backed reports.',
    'InsightReport is designed around owner-scoped projects, reproducible analytics and exact evidence lineage.',
    'published', 'in_development', true,
    array['Next.js','TypeScript','Supabase','PostgreSQL','Netlify'],
    array['Secure analytics workflow','Data quality profiling','Cleaning studio','Versioned evidence reports'],
    'cyan',
    'Product architecture, analytics workflow design, UI direction, development auditing and release planning',
    null, null, 30, now()
  ),
  (
    'hsf-erp',
    'HSF ERP',
    'NGO Operations Platform',
    'A role-based operational system for the finance, HR, procurement, education and healthcare workflows of Human Safety Foundation.',
    'HSF ERP models real multi-project NGO operations including financial requests, approvals, salaries, education records and medical activity.',
    'published', 'in_development', true,
    array['Next.js','TypeScript','Supabase','PostgreSQL','pnpm'],
    array['NGO workflow modelling','Role-based approvals','Education and healthcare scope','Responsive staff interface'],
    'green',
    'Requirements analysis, process modelling, product planning, UI direction and development workflow',
    null, null, 40, now()
  ),
  (
    'ayatfinder',
    'AyatFinder',
    'Quran Knowledge Application',
    'A subject-based Quran verse discovery application built around verified local data and scalable search.',
    'AyatFinder focuses on trustworthy Quran data import, Supabase search and carefully bounded AI assistance.',
    'published', 'in_development', false,
    array['Next.js','Supabase','PostgreSQL','pnpm'],
    array['Verified local Quran data','Subject search','Bengali and English direction','Future contextual discovery'],
    'green',
    'Product concept, data workflow, architecture, quality verification and release planning',
    null, null, 50, now()
  ),
  (
    'qc-bondhu-ai',
    'QC Bondhu AI',
    'Garments Quality Workflow',
    'A Bengali-friendly QC application that turns defect selection or voice input into professional English reports and emails.',
    'QC Bondhu AI applies garments-domain knowledge to a short and practical inspection reporting flow.',
    'published', 'in_development', false,
    array['React','Responsive UI','AI Workflows','Vercel'],
    array['Bengali-first workflow','Defect selection','QC report generation','Email-ready output'],
    'orange',
    'Domain workflow design, product planning, UI simplification and AI-output structure',
    null, null, 60, now()
  ),
  (
    'edunexa',
    'EduNexa',
    'School Management Application',
    'A scalable multi-school management concept with modular academic workflows.',
    'EduNexa explores institutional data, students, academic records and optional attendance in a modern monorepo.',
    'published', 'deployed', false,
    array['Next.js','pnpm','Monorepo','Netlify'],
    array['Multi-school direction','Academic scalability','Modern monorepo','Netlify deployment'],
    'blue',
    'Product scope, architecture direction, setup troubleshooting and deployment guidance',
    null, null, 70, now()
  ),
  (
    'nexora-erp',
    'Nexora ERP',
    'SME ERP Architecture',
    'A modular ERP foundation for SMEs using a modern TypeScript monorepo and domain-oriented structure.',
    'Nexora ERP uses shared domain, contract and UI packages with PostgreSQL, Prisma and pnpm.',
    'published', 'in_development', false,
    array['Next.js','NestJS','TypeScript','Prisma','PostgreSQL','Turborepo'],
    array['Shared packages','Type-safe frontend and backend','ERP roadmap','Structured quality workflow'],
    'violet',
    'Architecture planning, repository setup, technical troubleshooting and release workflow',
    null, null, 80, now()
  )
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  summary = excluded.summary,
  description = excluded.description,
  publication_status = excluded.publication_status,
  project_state = excluded.project_state,
  is_featured = excluded.is_featured,
  stack = excluded.stack,
  highlights = excluded.highlights,
  accent = excluded.accent,
  role = excluded.role,
  source_url = excluded.source_url,
  live_url = excluded.live_url,
  sort_order = excluded.sort_order,
  published_at = coalesce(public.projects.published_at, excluded.published_at);

insert into public.posts (
  slug, title, excerpt, content, category, publication_status,
  read_time_minutes, seo_title, seo_description
)
values
  (
    'from-data-to-intelligent-products',
    'From Data Analysis to Intelligent Products',
    'How analytics, business understanding and AI-assisted development can work together.',
    '', 'Career Journey', 'draft', 6,
    'From Data Analysis to Intelligent Products',
    'A practical career and product-development reflection.'
  ),
  (
    'building-products-with-ai-coding-tools',
    'Building Products with AI Coding Tools',
    'A practical approach to planning, milestone development, auditing and responsible releases.',
    '', 'SaaS Development', 'draft', 8,
    'Building Products with AI Coding Tools',
    'Planning and releasing maintainable products with AI-assisted development.'
  ),
  (
    'business-first-data-analytics',
    'Business-First Data Analytics',
    'Why useful dashboards begin with decisions, stakeholders and measurable questions.',
    '', 'Data Analytics', 'draft', 5,
    'Business-First Data Analytics',
    'How to connect data analysis with real business decisions.'
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  read_time_minutes = excluded.read_time_minutes,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

commit;
