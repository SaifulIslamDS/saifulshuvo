-- Portfolio CMS v0.8.0 — Contact Inbox and Email Notifications
-- Apply after 202607310005_profile_homepage_cms.sql.

begin;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (email = lower(email) and char_length(email) <= 254),
  company text check (company is null or char_length(company) <= 160),
  subject text not null check (char_length(subject) between 3 and 180),
  interest text not null check (char_length(interest) between 2 and 120),
  message text not null check (char_length(message) between 20 and 5000),
  source_page text not null default '/contact' check (char_length(source_page) <= 300),
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived', 'spam')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 5000),
  fingerprint_hash text not null check (fingerprint_hash ~ '^[a-f0-9]{64}$'),
  notification_status text not null default 'pending'
    check (notification_status in ('pending', 'sent', 'failed', 'skipped')),
  notification_provider_id text,
  notification_error text,
  notification_attempted_at timestamptz,
  notification_token text,
  read_at timestamptz,
  replied_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages (status, created_at desc);

create index if not exists contact_messages_email_created_idx
  on public.contact_messages (email, created_at desc);

create index if not exists contact_messages_fingerprint_created_idx
  on public.contact_messages (fingerprint_hash, created_at desc);

create index if not exists contact_messages_notification_idx
  on public.contact_messages (notification_status, created_at desc);

create or replace function public.submit_contact_message(
  p_full_name text,
  p_email text,
  p_company text,
  p_subject text,
  p_interest text,
  p_message text,
  p_source_page text,
  p_fingerprint_hash text,
  p_notification_token text,
  p_honeypot text default ''
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_id uuid;
  clean_name text := btrim(coalesce(p_full_name, ''));
  clean_email text := lower(btrim(coalesce(p_email, '')));
  clean_company text := nullif(btrim(coalesce(p_company, '')), '');
  clean_subject text := btrim(coalesce(p_subject, ''));
  clean_interest text := btrim(coalesce(p_interest, ''));
  clean_message text := btrim(coalesce(p_message, ''));
  clean_source text := left(coalesce(nullif(btrim(p_source_page), ''), '/contact'), 300);
begin
  if btrim(coalesce(p_honeypot, '')) <> '' then
    raise exception 'Unable to accept this submission.' using errcode = '22023';
  end if;

  if char_length(clean_name) not between 2 and 120 then
    raise exception 'Please provide a valid full name.' using errcode = '22023';
  end if;

  if clean_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' or char_length(clean_email) > 254 then
    raise exception 'Please provide a valid email address.' using errcode = '22023';
  end if;

  if clean_company is not null and char_length(clean_company) > 160 then
    raise exception 'Company name is too long.' using errcode = '22023';
  end if;

  if char_length(clean_subject) not between 3 and 180 then
    raise exception 'Please provide a useful subject.' using errcode = '22023';
  end if;

  if char_length(clean_interest) not between 2 and 120 then
    raise exception 'Please select a discussion topic.' using errcode = '22023';
  end if;

  if char_length(clean_message) not between 20 and 5000 then
    raise exception 'Message must be between 20 and 5000 characters.' using errcode = '22023';
  end if;

  if coalesce(p_fingerprint_hash, '') !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid request fingerprint.' using errcode = '22023';
  end if;

  if char_length(coalesce(p_notification_token, '')) < 32 then
    raise exception 'Invalid notification token.' using errcode = '22023';
  end if;

  if (
    select count(*)
    from public.contact_messages
    where fingerprint_hash = p_fingerprint_hash
      and created_at >= now() - interval '15 minutes'
  ) >= 3 then
    raise exception 'Too many recent messages. Please try again later.' using errcode = 'P0001';
  end if;

  if (
    select count(*)
    from public.contact_messages
    where email = clean_email
      and created_at >= now() - interval '24 hours'
  ) >= 8 then
    raise exception 'Daily message limit reached. Please try again tomorrow.' using errcode = 'P0001';
  end if;

  select id into resolved_id
  from public.contact_messages
  where email = clean_email
    and message = clean_message
    and created_at >= now() - interval '10 minutes'
  order by created_at desc
  limit 1;

  if resolved_id is not null then
    return resolved_id;
  end if;

  insert into public.contact_messages (
    full_name,
    email,
    company,
    subject,
    interest,
    message,
    source_page,
    fingerprint_hash,
    notification_token
  )
  values (
    clean_name,
    clean_email,
    clean_company,
    clean_subject,
    clean_interest,
    clean_message,
    clean_source,
    p_fingerprint_hash,
    p_notification_token
  )
  returning id into resolved_id;

  return resolved_id;
end;
$$;

create or replace function public.finalize_contact_notification(
  p_message_id uuid,
  p_notification_token text,
  p_status text,
  p_provider_id text default null,
  p_error text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_status not in ('sent', 'failed', 'skipped') then
    raise exception 'Invalid notification status.' using errcode = '22023';
  end if;

  update public.contact_messages
  set
    notification_status = p_status,
    notification_provider_id = nullif(left(coalesce(p_provider_id, ''), 500), ''),
    notification_error = nullif(left(coalesce(p_error, ''), 2000), ''),
    notification_attempted_at = now(),
    notification_token = null,
    updated_at = now()
  where id = p_message_id
    and notification_status = 'pending'
    and notification_token = p_notification_token;

  return found;
end;
$$;

create or replace function public.log_contact_message_received()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events (
    actor_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  ) values (
    null,
    'contact.received',
    'contact_message',
    new.id::text,
    jsonb_build_object(
      'interest', new.interest,
      'source_page', new.source_page,
      'notification_status', new.notification_status
    )
  );
  return new;
end;
$$;

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

drop trigger if exists contact_messages_log_received on public.contact_messages;
create trigger contact_messages_log_received
after insert on public.contact_messages
for each row execute function public.log_contact_message_received();

alter table public.contact_messages enable row level security;

revoke all on public.contact_messages from anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;

revoke all on function public.submit_contact_message(text, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

revoke all on function public.finalize_contact_notification(uuid, text, text, text, text) from public;
grant execute on function public.finalize_contact_notification(uuid, text, text, text, text) to anon, authenticated;

revoke all on function public.log_contact_message_received() from public;

drop policy if exists "contact_messages_admin_read" on public.contact_messages;
create policy "contact_messages_admin_read"
on public.contact_messages for select
to authenticated
using ((select public.is_portfolio_admin()));

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update"
on public.contact_messages for update
to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_admin_delete"
on public.contact_messages for delete
to authenticated
using ((select public.is_portfolio_admin()));

comment on table public.contact_messages is
  'Public contact submissions. Anonymous inserts are accepted only through the validated and rate-limited submit_contact_message RPC.';

comment on column public.contact_messages.fingerprint_hash is
  'Privacy-preserving SHA-256 request fingerprint used only for abuse rate limiting; raw IP addresses are never stored.';

commit;
