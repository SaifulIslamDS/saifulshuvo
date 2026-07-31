-- Portfolio CMS v0.6.0 — Media Library, Profile Image and CV Management
-- Apply after 202607310003_blog_cms.sql.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null default 'portfolio-media',
  object_path text not null unique,
  public_url text not null,
  original_name text not null,
  mime_type text not null,
  media_kind text not null check (media_kind in ('image', 'document')),
  purpose text not null default 'general'
    check (purpose in ('general', 'profile', 'project', 'blog', 'cv')),
  status text not null default 'active' check (status in ('active', 'archived')),
  size_bytes bigint not null check (size_bytes >= 0 and size_bytes <= 10485760),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text,
  caption text,
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists media_assets_library_idx
  on public.media_assets (status, media_kind, purpose, created_at desc);
create index if not exists media_assets_sha256_idx
  on public.media_assets (sha256) where sha256 is not null;

create table if not exists public.cv_documents (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null unique references public.media_assets(id) on delete restrict,
  title text not null default 'Curriculum Vitae',
  version_label text not null,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cv_documents_created_idx
  on public.cv_documents (created_at desc);

alter table public.site_settings
  add column if not exists profile_image_asset_id uuid references public.media_assets(id) on delete set null,
  add column if not exists active_cv_document_id uuid references public.cv_documents(id) on delete set null;

alter table public.projects
  add column if not exists cover_image_asset_id uuid references public.media_assets(id) on delete set null;

alter table public.posts
  add column if not exists featured_image_asset_id uuid references public.media_assets(id) on delete set null,
  add column if not exists og_image_asset_id uuid references public.media_assets(id) on delete set null;

create table if not exists public.project_media (
  project_id uuid not null references public.projects(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  sort_order integer not null default 100,
  caption_override text,
  created_at timestamptz not null default now(),
  primary key (project_id, media_asset_id)
);

create index if not exists project_media_sort_idx
  on public.project_media (project_id, sort_order, created_at);

create or replace function public.media_asset_usage_count(target_asset_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select (
    (select count(*) from public.site_settings where profile_image_asset_id = target_asset_id)
    + (select count(*) from public.projects where cover_image_asset_id = target_asset_id)
    + (select count(*) from public.project_media where media_asset_id = target_asset_id)
    + (select count(*) from public.posts where featured_image_asset_id = target_asset_id)
    + (select count(*) from public.posts where og_image_asset_id = target_asset_id)
    + (select count(*) from public.cv_documents where media_asset_id = target_asset_id)
  )::integer;
$$;

revoke all on function public.media_asset_usage_count(uuid) from public;
grant execute on function public.media_asset_usage_count(uuid) to authenticated;

create or replace function public.protect_media_asset_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and old.status = 'active'
     and new.status = 'archived'
     and public.media_asset_usage_count(old.id) > 0 then
    raise exception 'Assigned media cannot be archived. Remove all profile, CV, project and post references first.';
  end if;

  if tg_op = 'DELETE' then
    if old.status <> 'archived' then
      raise exception 'Only archived media can be permanently deleted.';
    end if;
    if public.media_asset_usage_count(old.id) > 0 then
      raise exception 'Assigned media cannot be permanently deleted.';
    end if;
    return old;
  end if;

  if new.status = 'archived' then
    new.archived_at := coalesce(new.archived_at, now());
  else
    new.archived_at := null;
  end if;
  return new;
end;
$$;

create or replace function public.protect_cv_document_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.site_settings
    where active_cv_document_id = old.id
  ) then
    raise exception 'The active CV cannot be deleted. Activate another version or clear the active CV first.';
  end if;
  return old;
end;
$$;

create or replace function public.audit_media_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_name text;
  record_id text;
  asset_name text;
  asset_status text;
begin
  if tg_op = 'DELETE' then
    event_name := 'media.deleted';
    record_id := old.id::text;
    asset_name := old.original_name;
    asset_status := old.status;
  else
    record_id := new.id::text;
    asset_name := new.original_name;
    asset_status := new.status;
    if tg_op = 'INSERT' then
      event_name := 'media.uploaded';
    elsif old.status is distinct from new.status then
      event_name := case new.status when 'archived' then 'media.archived' else 'media.restored' end;
    else
      event_name := 'media.updated';
    end if;
  end if;

  insert into public.audit_events (actor_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(), event_name, 'media', record_id,
    jsonb_build_object('name', asset_name, 'status', asset_status)
  );

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create or replace function public.audit_cv_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events (actor_id, event_type, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    case when tg_op = 'INSERT' then 'cv.created' when tg_op = 'DELETE' then 'cv.deleted' else 'cv.updated' end,
    'cv_document',
    case when tg_op = 'DELETE' then old.id::text else new.id::text end,
    jsonb_build_object(
      'title', case when tg_op = 'DELETE' then old.title else new.title end,
      'version_label', case when tg_op = 'DELETE' then old.version_label else new.version_label end
    )
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop trigger if exists media_assets_protect_lifecycle on public.media_assets;
create trigger media_assets_protect_lifecycle
before update or delete on public.media_assets
for each row execute function public.protect_media_asset_lifecycle();

drop trigger if exists media_assets_audit_change on public.media_assets;
create trigger media_assets_audit_change
after insert or update or delete on public.media_assets
for each row execute function public.audit_media_change();

drop trigger if exists cv_documents_set_updated_at on public.cv_documents;
create trigger cv_documents_set_updated_at
before update on public.cv_documents
for each row execute function public.set_updated_at();

drop trigger if exists cv_documents_protect_delete on public.cv_documents;
create trigger cv_documents_protect_delete
before delete on public.cv_documents
for each row execute function public.protect_cv_document_delete();

drop trigger if exists cv_documents_audit_change on public.cv_documents;
create trigger cv_documents_audit_change
after insert or update or delete on public.cv_documents
for each row execute function public.audit_cv_change();

alter table public.media_assets enable row level security;
alter table public.cv_documents enable row level security;
alter table public.project_media enable row level security;

revoke all on public.media_assets from anon, authenticated;
revoke all on public.cv_documents from anon, authenticated;
revoke all on public.project_media from anon, authenticated;

grant select on public.media_assets, public.cv_documents, public.project_media to anon, authenticated;
grant insert, update, delete on public.media_assets, public.cv_documents, public.project_media to authenticated;

drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read"
on public.media_assets for select
to anon, authenticated
using (status = 'active' or (select public.is_portfolio_admin()));

drop policy if exists "media_assets_admin_write" on public.media_assets;
create policy "media_assets_admin_write"
on public.media_assets for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "cv_documents_public_active_read" on public.cv_documents;
create policy "cv_documents_public_active_read"
on public.cv_documents for select
to anon, authenticated
using (
  exists (
    select 1 from public.site_settings
    where active_cv_document_id = cv_documents.id
  )
  or (select public.is_portfolio_admin())
);

drop policy if exists "cv_documents_admin_write" on public.cv_documents;
create policy "cv_documents_admin_write"
on public.cv_documents for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "project_media_public_read" on public.project_media;
create policy "project_media_public_read"
on public.project_media for select
to anon, authenticated
using (
  exists (
    select 1 from public.projects
    where projects.id = project_media.project_id
      and (projects.publication_status = 'published' or (select public.is_portfolio_admin()))
  )
);

drop policy if exists "project_media_admin_write" on public.project_media;
create policy "project_media_admin_write"
on public.project_media for all
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

-- Public objects are readable by design; only allow-listed admins may mutate the bucket.
drop policy if exists "portfolio_media_public_read" on storage.objects;
create policy "portfolio_media_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

drop policy if exists "portfolio_media_admin_insert" on storage.objects;
create policy "portfolio_media_admin_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));

drop policy if exists "portfolio_media_admin_update" on storage.objects;
create policy "portfolio_media_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()))
with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));

drop policy if exists "portfolio_media_admin_delete" on storage.objects;
create policy "portfolio_media_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));

-- Preserve legacy external URLs by leaving existing asset references null.
-- New CMS saves synchronise selected asset URLs into the legacy URL columns.

commit;
