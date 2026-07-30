-- Portfolio CMS v0.4.0 — Project CMS
-- Apply after 202607310001_cms_foundation.sql.

begin;

alter table public.projects
  add column if not exists problem_statement text not null default '',
  add column if not exists solution_overview text not null default '',
  add column if not exists outcomes text[] not null default '{}',
  add column if not exists cover_image_url text,
  add column if not exists version integer not null default 1 check (version > 0),
  add column if not exists archived_at timestamptz;

create index if not exists projects_admin_library_idx
  on public.projects (publication_status, sort_order, updated_at desc);

create index if not exists projects_featured_public_idx
  on public.projects (is_featured, sort_order)
  where publication_status = 'published';

create or replace function public.manage_project_lifecycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.version := greatest(coalesce(new.version, 1), 1);
  elsif (to_jsonb(new) - 'updated_at' - 'version')
      is distinct from (to_jsonb(old) - 'updated_at' - 'version') then
    new.version := old.version + 1;
  else
    new.version := old.version;
  end if;

  if new.publication_status = 'published' then
    new.published_at := coalesce(new.published_at, now());
    new.archived_at := null;
  elsif new.publication_status = 'archived' then
    new.archived_at := coalesce(new.archived_at, now());
  else
    new.published_at := null;
    new.archived_at := null;
  end if;

  return new;
end;
$$;

create or replace function public.audit_project_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_name text;
  record_id text;
  record_slug text;
  record_title text;
  record_status text;
begin
  if tg_op = 'DELETE' then
    event_name := 'project.deleted';
    record_id := old.id::text;
    record_slug := old.slug;
    record_title := old.title;
    record_status := old.publication_status;
  else
    record_id := new.id::text;
    record_slug := new.slug;
    record_title := new.title;
    record_status := new.publication_status;

    if tg_op = 'INSERT' then
      event_name := 'project.created';
    elsif old.publication_status is distinct from new.publication_status then
      event_name := case new.publication_status
        when 'published' then 'project.published'
        when 'archived' then 'project.archived'
        when 'draft' then case when old.publication_status = 'archived' then 'project.restored' else 'project.unpublished' end
        else 'project.updated'
      end;
    else
      event_name := 'project.updated';
    end if;
  end if;

  insert into public.audit_events (actor_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    event_name,
    'project',
    record_id,
    jsonb_build_object(
      'slug', record_slug,
      'title', record_title,
      'publication_status', record_status
    )
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

comment on function public.audit_project_change() is
  'Creates an immutable project audit event from authenticated CMS mutations.';

drop trigger if exists projects_manage_lifecycle on public.projects;
create trigger projects_manage_lifecycle
before insert or update on public.projects
for each row execute function public.manage_project_lifecycle();

drop trigger if exists projects_audit_change on public.projects;
create trigger projects_audit_change
after insert or update or delete on public.projects
for each row execute function public.audit_project_change();

-- Replace the broad write policy with explicit operation policies.
drop policy if exists "projects_admin_write" on public.projects;
drop policy if exists "projects_admin_insert" on public.projects;
drop policy if exists "projects_admin_update" on public.projects;
drop policy if exists "projects_admin_delete" on public.projects;

create policy "projects_admin_insert"
on public.projects for insert
to authenticated
with check ((select public.is_portfolio_admin()));

create policy "projects_admin_update"
on public.projects for update
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

create policy "projects_admin_delete"
on public.projects for delete
to authenticated
using (
  (select public.is_portfolio_admin())
  and publication_status = 'archived'
);

-- Enrich the seeded case studies. Future changes are managed in /admin/projects.
update public.projects set
  problem_statement = 'Business datasets are often presented as files and charts without a clear connection to decisions, data-quality risks or stakeholder questions.',
  solution_overview = 'Four end-to-end case studies were structured around business questions, repeatable cleaning, validated KPIs, visual analysis and written recommendations.',
  outcomes = array['Four documented portfolio case studies','Decision-oriented KPI dashboards','Reproducible SQL and Python analysis','Business recommendations linked to evidence']
where slug = 'data-analytics-portfolio' and problem_statement = '';

update public.projects set
  problem_statement = 'Writing useful prompts repeatedly is time-consuming, inconsistent and difficult for users who do not know prompt-engineering structures.',
  solution_overview = 'A guided prompt workflow was developed and iterated into a full-stack application with reusable content, authentication and production deployment.',
  outcomes = array['Production application on a custom domain','Structured reusable prompt workflow','Versioned product-development process','Foundation for multilingual and agentic features']
where slug = 'promptkarigor' and problem_statement = '';

update public.projects set
  problem_statement = 'Small teams need to turn uploaded spreadsheets into trustworthy findings without losing track of cleaning decisions, analytical assumptions or evidence lineage.',
  solution_overview = 'InsightReport separates upload, profiling, cleaning, semantic modelling, analytics, insights, recommendations and reporting into auditable owner-scoped stages.',
  outcomes = array['Secure analytics project workflow','Checksum-verified data lineage','Versioned reports and evidence exports','Clear path from uploaded data to decisions']
where slug = 'insightreport' and problem_statement = '';

update public.projects set
  problem_statement = 'The NGO manages finance, HR, procurement, education and healthcare activities through connected processes that require clear roles, approvals and reporting.',
  solution_overview = 'Real operating procedures were translated into a modular ERP scope with role-based workflows, project accounting and responsive staff interfaces.',
  outcomes = array['Documented cross-functional operating model','Role and approval architecture','Modular development roadmap','Foundation for staff-wide digital operations']
where slug = 'hsf-erp' and problem_statement = '';

update public.projects set
  problem_statement = 'Users need a trustworthy way to discover Qur’an verses by subject without relying on unverified generated text.',
  solution_overview = 'The application begins with verified local Qur’an data and database search, while future AI assistance remains bounded by source evidence.',
  outcomes = array['Verified local data import','Scalable subject-search foundation','Bengali and English product direction']
where slug = 'ayatfinder' and problem_statement = '';

update public.projects set
  problem_statement = 'Garments quality professionals often need to turn quick Bengali observations into consistent professional English reports and emails.',
  solution_overview = 'A short guided workflow combines basic inspection information, selected defects and future Bengali voice input to produce practical QC outputs.',
  outcomes = array['Simplified QC reporting flow','Bengali-friendly product direction','Professional report and email structure']
where slug = 'qc-bondhu-ai' and problem_statement = '';

update public.projects set
  problem_statement = 'Institutions at different education levels need modular academic records without being locked into a rigid single-school design.',
  solution_overview = 'A scalable multi-school application architecture and deployment workflow were explored using a modern pnpm monorepo.',
  outcomes = array['Multi-school architecture direction','Modular academic scope','Verified Netlify deployment workflow']
where slug = 'edunexa' and problem_statement = '';

update public.projects set
  problem_statement = 'SME ERP projects become difficult to maintain when domain rules, API contracts and interface components are tightly coupled.',
  solution_overview = 'A TypeScript monorepo separated domain, contracts, UI, web and API concerns while documenting a milestone-based ERP roadmap.',
  outcomes = array['Shared type-safe packages','Domain-oriented repository structure','Structured quality and release workflow']
where slug = 'nexora-erp' and problem_statement = '';

commit;
