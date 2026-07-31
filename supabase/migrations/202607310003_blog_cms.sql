-- Portfolio CMS v0.5.0 — Full Blog CMS
-- Apply after 202607310001_cms_foundation.sql and 202607310002_project_cms.sql.

begin;

create table if not exists public.post_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique,
  description text not null default '',
  accent text not null default 'cyan'
    check (accent in ('blue', 'cyan', 'violet', 'green', 'orange')),
  sort_order integer not null default 100 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists category_id uuid references public.post_categories(id) on delete set null,
  add column if not exists content_json jsonb not null default '{}'::jsonb,
  add column if not exists is_featured boolean not null default false,
  add column if not exists sort_order integer not null default 100 check (sort_order >= 0),
  add column if not exists canonical_url text,
  add column if not exists og_image_url text,
  add column if not exists version integer not null default 1 check (version > 0),
  add column if not exists archived_at timestamptz;

create table if not exists public.post_tag_links (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.post_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

create table if not exists public.post_revisions (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  version integer not null check (version > 0),
  snapshot jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (post_id, version)
);

create index if not exists posts_admin_library_idx
  on public.posts (publication_status, sort_order, updated_at desc);
create index if not exists posts_featured_public_idx
  on public.posts (is_featured, sort_order, published_at desc)
  where publication_status = 'published';
create index if not exists posts_category_public_idx
  on public.posts (category_id, published_at desc)
  where publication_status = 'published';
create index if not exists post_tag_links_tag_idx
  on public.post_tag_links (tag_id, post_id);
create index if not exists post_revisions_post_idx
  on public.post_revisions (post_id, version desc);

create or replace function public.manage_post_lifecycle()
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

create or replace function public.capture_post_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.post_revisions (post_id, version, snapshot, created_by)
    values (new.id, new.version, to_jsonb(new), auth.uid())
    on conflict (post_id, version) do nothing;
  elsif new.version is distinct from old.version then
    insert into public.post_revisions (post_id, version, snapshot, created_by)
    values (old.id, old.version, to_jsonb(old), auth.uid())
    on conflict (post_id, version) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.audit_post_change()
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
    event_name := 'post.deleted';
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
      event_name := 'post.created';
    elsif old.publication_status is distinct from new.publication_status then
      event_name := case new.publication_status
        when 'published' then 'post.published'
        when 'archived' then 'post.archived'
        when 'draft' then case when old.publication_status = 'archived' then 'post.restored' else 'post.unpublished' end
        else 'post.updated'
      end;
    else
      event_name := 'post.updated';
    end if;
  end if;

  insert into public.audit_events (actor_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    event_name,
    'post',
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

-- Apply generic updated-at triggers to new taxonomy tables.
drop trigger if exists post_categories_set_updated_at on public.post_categories;
create trigger post_categories_set_updated_at
before update on public.post_categories
for each row execute function public.set_updated_at();

drop trigger if exists post_tags_set_updated_at on public.post_tags;
create trigger post_tags_set_updated_at
before update on public.post_tags
for each row execute function public.set_updated_at();

drop trigger if exists posts_manage_lifecycle on public.posts;
create trigger posts_manage_lifecycle
before insert or update on public.posts
for each row execute function public.manage_post_lifecycle();

drop trigger if exists posts_capture_revision on public.posts;
create trigger posts_capture_revision
after insert or update on public.posts
for each row execute function public.capture_post_revision();

drop trigger if exists posts_audit_change on public.posts;
create trigger posts_audit_change
after insert or update or delete on public.posts
for each row execute function public.audit_post_change();

alter table public.post_categories enable row level security;
alter table public.post_tags enable row level security;
alter table public.post_tag_links enable row level security;
alter table public.post_revisions enable row level security;

revoke all on public.post_categories from anon, authenticated;
revoke all on public.post_tags from anon, authenticated;
revoke all on public.post_tag_links from anon, authenticated;
revoke all on public.post_revisions from anon, authenticated;

grant select on public.post_categories, public.post_tags, public.post_tag_links to anon, authenticated;
grant insert, update, delete on public.post_categories, public.post_tags, public.post_tag_links to authenticated;
grant select, insert on public.post_revisions to authenticated;
grant usage, select on sequence public.post_revisions_id_seq to authenticated;

-- Taxonomy policies.
drop policy if exists "post_categories_public_read" on public.post_categories;
create policy "post_categories_public_read"
on public.post_categories for select
to anon, authenticated
using (true);

drop policy if exists "post_categories_admin_write" on public.post_categories;
create policy "post_categories_admin_write"
on public.post_categories for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "post_tags_public_read" on public.post_tags;
create policy "post_tags_public_read"
on public.post_tags for select
to anon, authenticated
using (true);

drop policy if exists "post_tags_admin_write" on public.post_tags;
create policy "post_tags_admin_write"
on public.post_tags for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "post_tag_links_public_read" on public.post_tag_links;
create policy "post_tag_links_public_read"
on public.post_tag_links for select
to anon, authenticated
using (
  exists (
    select 1 from public.posts
    where public.posts.id = post_tag_links.post_id
      and (
        (public.posts.publication_status = 'published' and coalesce(public.posts.published_at, now()) <= now())
        or (select public.is_portfolio_admin())
      )
  )
);

drop policy if exists "post_tag_links_admin_write" on public.post_tag_links;
create policy "post_tag_links_admin_write"
on public.post_tag_links for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "post_revisions_admin_read" on public.post_revisions;
create policy "post_revisions_admin_read"
on public.post_revisions for select
to authenticated
using ((select public.is_portfolio_admin()));

drop policy if exists "post_revisions_admin_insert" on public.post_revisions;
create policy "post_revisions_admin_insert"
on public.post_revisions for insert
to authenticated
with check ((select public.is_portfolio_admin()));

-- Replace broad post write policy with explicit lifecycle policies.
drop policy if exists "posts_admin_write" on public.posts;
drop policy if exists "posts_admin_insert" on public.posts;
drop policy if exists "posts_admin_update" on public.posts;
drop policy if exists "posts_admin_delete" on public.posts;

create policy "posts_admin_insert"
on public.posts for insert
to authenticated
with check ((select public.is_portfolio_admin()));

create policy "posts_admin_update"
on public.posts for update
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

create policy "posts_admin_delete"
on public.posts for delete
to authenticated
using (
  (select public.is_portfolio_admin())
  and publication_status = 'archived'
);

-- Initial taxonomies.
insert into public.post_categories (slug, name, description, accent, sort_order)
values
  ('data-analytics', 'Data Analytics', 'Practical analytics, BI, dashboards and decision support.', 'cyan', 10),
  ('artificial-intelligence', 'Artificial Intelligence', 'LLMs, prompt engineering, agents and applied AI.', 'violet', 20),
  ('saas-development', 'SaaS Development', 'Product architecture, milestones, release discipline and lessons learned.', 'blue', 30),
  ('web-development', 'Web Development', 'Modern web application and WordPress development.', 'green', 40),
  ('career-journey', 'Career Journey', 'Career transition, learning systems and remote-work preparation.', 'orange', 50),
  ('project-case-studies', 'Project Case Studies', 'Detailed analysis of portfolio projects and implementation choices.', 'cyan', 60)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  accent = excluded.accent,
  sort_order = excluded.sort_order;

insert into public.post_tags (slug, name)
values
  ('python', 'Python'),
  ('sql', 'SQL'),
  ('power-bi', 'Power BI'),
  ('next-js', 'Next.js'),
  ('supabase', 'Supabase'),
  ('prompt-engineering', 'Prompt Engineering'),
  ('llm', 'LLM'),
  ('agentic-ai', 'Agentic AI'),
  ('remote-career', 'Remote Career'),
  ('product-development', 'Product Development')
on conflict (slug) do update set name = excluded.name;

-- Connect existing seed posts to categories while preserving their current draft status.
update public.posts p set
  category_id = c.id,
  category = c.name,
  is_featured = case p.slug when 'from-data-to-intelligent-products' then true else false end,
  sort_order = case p.slug
    when 'from-data-to-intelligent-products' then 10
    when 'building-products-with-ai-coding-tools' then 20
    when 'business-first-data-analytics' then 30
    else p.sort_order
  end
from public.post_categories c
where
  (p.slug = 'from-data-to-intelligent-products' and c.slug = 'career-journey')
  or (p.slug = 'building-products-with-ai-coding-tools' and c.slug = 'saas-development')
  or (p.slug = 'business-first-data-analytics' and c.slug = 'data-analytics');

commit;
