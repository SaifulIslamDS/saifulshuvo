-- Portfolio CMS v0.9.0 — SEO, Analytics, Performance and Production Hardening
-- Apply after 202607310006_contact_inbox.sql.

begin;

alter table public.site_settings
  add column if not exists seo_default_title text not null default 'Saiful Islam | Data Analyst & AI-Focused Software Builder',
  add column if not exists seo_title_template text not null default '%s | Saiful Islam',
  add column if not exists seo_default_description text not null default 'Portfolio of Saiful Islam, a data analyst, web developer and SaaS builder creating dashboards, business applications and practical AI-assisted solutions.',
  add column if not exists seo_keywords text[] not null default array['Saiful Islam','Data Analyst Bangladesh','Power BI Developer','Python Data Analyst','SQL Analyst','Next.js Developer','SaaS Builder','Remote Data Analyst'],
  add column if not exists seo_og_image_asset_id uuid references public.media_assets(id) on delete set null,
  add column if not exists seo_twitter_handle text,
  add column if not exists seo_index_site boolean not null default true,
  add column if not exists seo_google_site_verification text,
  add column if not exists seo_bing_site_verification text,
  add column if not exists analytics_provider text not null default 'none',
  add column if not exists analytics_measurement_id text,
  add column if not exists analytics_domain text,
  add column if not exists analytics_consent_required boolean not null default true,
  add column if not exists analytics_respect_dnt boolean not null default true,
  add column if not exists analytics_collect_page_views boolean not null default true,
  add column if not exists analytics_collect_web_vitals boolean not null default true,
  add column if not exists analytics_collect_client_errors boolean not null default true,
  add column if not exists analytics_retention_days integer not null default 90;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'site_settings_analytics_provider_check'
      and conrelid = 'public.site_settings'::regclass
  ) then
    alter table public.site_settings
      add constraint site_settings_analytics_provider_check
      check (analytics_provider in ('none', 'google', 'plausible'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'site_settings_analytics_retention_check'
      and conrelid = 'public.site_settings'::regclass
  ) then
    alter table public.site_settings
      add constraint site_settings_analytics_retention_check
      check (analytics_retention_days between 7 and 730);
  end if;
end;
$$;

create table if not exists public.telemetry_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'web_vital', 'client_error')),
  path text not null,
  session_hash text not null,
  metric_name text,
  metric_value numeric,
  metric_rating text check (metric_rating is null or metric_rating in ('good', 'needs-improvement', 'poor')),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists telemetry_events_time_idx
  on public.telemetry_events (occurred_at desc);
create index if not exists telemetry_events_type_time_idx
  on public.telemetry_events (event_type, occurred_at desc);
create index if not exists telemetry_events_path_time_idx
  on public.telemetry_events (path, occurred_at desc);
create index if not exists telemetry_events_session_time_idx
  on public.telemetry_events (session_hash, occurred_at desc);

alter table public.telemetry_events enable row level security;
revoke all on public.telemetry_events from anon, authenticated;
grant select, delete on public.telemetry_events to authenticated;

drop policy if exists "telemetry_admin_read" on public.telemetry_events;
create policy "telemetry_admin_read"
on public.telemetry_events for select
to authenticated
using ((select public.is_portfolio_admin()));

drop policy if exists "telemetry_admin_delete" on public.telemetry_events;
create policy "telemetry_admin_delete"
on public.telemetry_events for delete
to authenticated
using ((select public.is_portfolio_admin()));

create or replace function public.submit_telemetry_event(
  p_event_type text,
  p_path text,
  p_session_hash text,
  p_metric_name text default null,
  p_metric_value numeric default null,
  p_metric_rating text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_id uuid;
  recent_events integer;
  clean_path text;
begin
  if p_event_type not in ('page_view', 'web_vital', 'client_error') then
    raise exception 'Unsupported telemetry event type.';
  end if;

  clean_path := left(coalesce(nullif(trim(p_path), ''), '/'), 300);

  if length(coalesce(p_session_hash, '')) < 32 or length(p_session_hash) > 128 then
    raise exception 'Invalid telemetry session.';
  end if;

  if p_metric_rating is not null and p_metric_rating not in ('good', 'needs-improvement', 'poor') then
    raise exception 'Invalid metric rating.';
  end if;

  if octet_length(coalesce(p_metadata, '{}'::jsonb)::text) > 4096 then
    raise exception 'Telemetry metadata is too large.';
  end if;

  select count(*)::integer
  into recent_events
  from public.telemetry_events
  where session_hash = p_session_hash
    and occurred_at > now() - interval '1 hour';

  if recent_events >= 120 then
    raise exception 'Telemetry rate limit exceeded.';
  end if;

  insert into public.telemetry_events (
    event_type,
    path,
    session_hash,
    metric_name,
    metric_value,
    metric_rating,
    metadata
  ) values (
    p_event_type,
    clean_path,
    p_session_hash,
    nullif(left(coalesce(p_metric_name, ''), 80), ''),
    p_metric_value,
    p_metric_rating,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into inserted_id;

  return inserted_id;
end;
$$;

revoke all on function public.submit_telemetry_event(text, text, text, text, numeric, text, jsonb) from public;
grant execute on function public.submit_telemetry_event(text, text, text, text, numeric, text, jsonb) to anon, authenticated;

create or replace function public.purge_expired_telemetry()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  retention_days integer;
  deleted_count integer;
begin
  if not public.is_portfolio_admin() then
    raise exception 'Admin access required.';
  end if;

  select greatest(7, least(730, analytics_retention_days))
  into retention_days
  from public.site_settings
  where id = 'primary';

  delete from public.telemetry_events
  where occurred_at < now() - make_interval(days => coalesce(retention_days, 90));

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_expired_telemetry() from public;
grant execute on function public.purge_expired_telemetry() to authenticated;

update public.site_settings
set
  seo_default_title = coalesce(nullif(seo_default_title, ''), 'Saiful Islam | Data Analyst & AI-Focused Software Builder'),
  seo_title_template = coalesce(nullif(seo_title_template, ''), '%s | Saiful Islam'),
  seo_default_description = coalesce(nullif(seo_default_description, ''), short_bio),
  seo_keywords = case when cardinality(seo_keywords) = 0 then array['Saiful Islam','Data Analyst Bangladesh','Power BI Developer','Python Data Analyst','SQL Analyst','Next.js Developer','SaaS Builder','Remote Data Analyst'] else seo_keywords end
where id = 'primary';

commit;
