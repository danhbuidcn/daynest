-- Sprint 2: calendar settings, events, event_exceptions, user_devices (2-device limit),
-- google_sync_state, note_categories, notes. Spec: docs/specs/sprint-2/design/db.md, F7-device-limit.md

-- user_settings: new columns ------------------------------------------------
alter table public.user_settings
  add column notifications_enabled boolean not null default true,
  add column show_lunar boolean not null default true,
  add column show_holidays boolean not null default true,
  add column time_zone text not null default 'Asia/Ho_Chi_Minh';

-- check constraints cannot use a subquery, so time_zone is validated by trigger.
create or replace function public.check_user_settings_time_zone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.time_zone) then
    raise exception 'invalid time zone: %', new.time_zone;
  end if;
  return new;
end;
$$;

create trigger user_settings_check_time_zone
before insert or update on public.user_settings
for each row execute function public.check_user_settings_time_zone();

grant update (notifications_enabled, show_lunar, show_holidays, time_zone)
  on public.user_settings to authenticated;

-- user_devices ---------------------------------------------------------------
create table public.user_devices (
  user_id uuid not null references auth.users (id) on delete cascade,
  device_id uuid not null,
  device_name text not null check (char_length(device_name) <= 100),
  session_id uuid not null,
  signed_in_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (user_id, device_id)
);

create unique index user_devices_session_id_key on public.user_devices (session_id);

alter table public.user_devices enable row level security;

-- No insert/update/delete policy: only the security-definer functions below
-- (owned by the table owner, so they bypass RLS) may change this table.
create policy "user_devices: select own" on public.user_devices
for select to authenticated using (user_id = (select auth.uid()));

revoke all on public.user_devices from anon, authenticated;
grant select on public.user_devices to authenticated;

-- session_active(): used by RLS on every table to stop a kicked-out device immediately.
create or replace function public.session_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_devices
    where session_id = (auth.jwt() ->> 'session_id')::uuid
  );
$$;

grant execute on function public.session_active() to authenticated;

-- register_device(): call right after sign-in. Locks the user's profile row so two
-- concurrent sign-ins on different devices still cap at 2 devices.
create or replace function public.register_device(p_device_id uuid, p_device_name text)
returns table (kicked_name text, kicked_signed_in_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid := (auth.jwt() ->> 'session_id')::uuid;
  v_device_count int;
  v_kicked_device_id uuid;
  v_kicked_name text;
  v_kicked_signed_in_at timestamptz;
  v_kicked_session_id uuid;
begin
  perform 1 from public.profiles where id = v_user_id for update;

  insert into public.user_devices (user_id, device_id, device_name, session_id, signed_in_at, last_seen_at)
  values (v_user_id, p_device_id, left(p_device_name, 100), v_session_id, now(), now())
  on conflict (user_id, device_id) do update
    set session_id = excluded.session_id,
        device_name = excluded.device_name,
        signed_in_at = excluded.signed_in_at,
        last_seen_at = excluded.last_seen_at;

  select count(*) into v_device_count from public.user_devices where user_id = v_user_id;

  if v_device_count > 2 then
    select d.device_id, d.device_name, d.signed_in_at, d.session_id
      into v_kicked_device_id, v_kicked_name, v_kicked_signed_in_at, v_kicked_session_id
    from public.user_devices d
    where d.user_id = v_user_id
    order by d.signed_in_at asc
    limit 1;

    delete from public.user_devices
    where user_id = v_user_id and device_id = v_kicked_device_id;
    delete from auth.sessions where id = v_kicked_session_id;
    kicked_name := v_kicked_name;
    kicked_signed_in_at := v_kicked_signed_in_at;
    return next;
  end if;
  return;
end;
$$;

grant execute on function public.register_device(uuid, text) to authenticated;

create or replace function public.touch_device()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.user_devices
  set last_seen_at = now()
  where session_id = (auth.jwt() ->> 'session_id')::uuid
    and last_seen_at < now() - interval '5 minutes';
end;
$$;

grant execute on function public.touch_device() to authenticated;

create or replace function public.unregister_device()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.user_devices
  where session_id = (auth.jwt() ->> 'session_id')::uuid;
end;
$$;

grant execute on function public.unregister_device() to authenticated;

-- S1 tables: add the session_active() check so a kicked-out device stops immediately. ----
drop policy "profiles: select own" on public.profiles;
create policy "profiles: select own" on public.profiles
for select to authenticated
using (id = (select auth.uid()) and (select public.session_active()));

drop policy "user_settings: select own" on public.user_settings;
create policy "user_settings: select own" on public.user_settings
for select to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()));

drop policy "user_settings: update own" on public.user_settings;
create policy "user_settings: update own" on public.user_settings
for update to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()))
with check (user_id = (select auth.uid()) and (select public.session_active()));

-- events -----------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 1000),
  note text check (char_length(note) <= 8000),
  color text not null check (color in ('mint', 'sky', 'lavender', 'pink', 'peach', 'lemon')),
  all_day boolean not null,
  starts_at timestamptz,
  ends_at timestamptz,
  start_date date,
  end_date date,
  repeat text not null default 'none'
    check (repeat in ('none', 'daily', 'weekly', 'monthly', 'yearly', 'lunar_yearly')),
  repeat_interval smallint not null default 1 check (repeat_interval between 1 and 99),
  repeat_until date,
  lunar_month smallint check (lunar_month between 1 and 12),
  lunar_day smallint check (lunar_day between 1 and 30),
  reminder_minutes int[] not null default '{}'::int[]
    check (array_length(reminder_minutes, 1) is null or array_length(reminder_minutes, 1) <= 5),
  span_start date not null,
  span_end date not null,
  google_event_id text,
  google_etag text,
  google_updated_at timestamptz,
  google_status text not null default 'none' check (google_status in ('none', 'synced', 'pending')),
  google_readonly boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at),
  check (end_date is null or start_date is null or end_date >= start_date),
  check (
    (all_day and start_date is not null and end_date is not null and starts_at is null and ends_at is null)
    or
    (not all_day and starts_at is not null and ends_at is not null and start_date is null and end_date is null)
  ),
  check (repeat <> 'lunar_yearly' or (lunar_month is not null and lunar_day is not null))
);

create unique index events_google_event_id_key on public.events (user_id, google_event_id)
  where google_event_id is not null;
create index events_span_idx on public.events (user_id, span_start);
create index events_pending_idx on public.events (user_id) where google_status = 'pending';

create trigger events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

create policy "events: all own" on public.events
for all to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()))
with check (user_id = (select auth.uid()) and (select public.session_active()));

revoke all on public.events from anon, authenticated;
grant select, insert, update, delete on public.events to authenticated;

-- event_exceptions ---------------------------------------------------------
create table public.event_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  occurrence_date date not null,
  kind text not null check (kind in ('skip', 'override')),
  title text check (char_length(title) between 1 and 1000),
  note text check (char_length(note) <= 8000),
  color text check (color in ('mint', 'sky', 'lavender', 'pink', 'peach', 'lemon')),
  all_day boolean,
  starts_at timestamptz,
  ends_at timestamptz,
  start_date date,
  end_date date,
  reminder_minutes int[] check (array_length(reminder_minutes, 1) is null or array_length(reminder_minutes, 1) <= 5),
  google_status text not null default 'none' check (google_status in ('none', 'synced', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, occurrence_date)
);

create index event_exceptions_event_idx on public.event_exceptions (event_id);

create trigger event_exceptions_updated_at
before update on public.event_exceptions
for each row execute function public.set_updated_at();

alter table public.event_exceptions enable row level security;

-- event_id must belong to the same user, so A cannot attach an exception to B's event.
create policy "event_exceptions: all own" on public.event_exceptions
for all to authenticated
using (
  user_id = (select auth.uid())
  and (select public.session_active())
  and exists (select 1 from public.events e where e.id = event_id and e.user_id = (select auth.uid()))
)
with check (
  user_id = (select auth.uid())
  and (select public.session_active())
  and exists (select 1 from public.events e where e.id = event_id and e.user_id = (select auth.uid()))
);

revoke all on public.event_exceptions from anon, authenticated;
grant select, insert, update, delete on public.event_exceptions to authenticated;

-- google_sync_state ---------------------------------------------------------
create table public.google_sync_state (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  enabled boolean not null default false,
  sync_token text,
  synced_year smallint,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger google_sync_state_updated_at
before update on public.google_sync_state
for each row execute function public.set_updated_at();

alter table public.google_sync_state enable row level security;

create policy "google_sync_state: all own" on public.google_sync_state
for all to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()))
with check (user_id = (select auth.uid()) and (select public.session_active()));

revoke all on public.google_sync_state from anon, authenticated;
grant select, insert, update, delete on public.google_sync_state to authenticated;

-- note_categories ------------------------------------------------------------
create table public.note_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  color text not null check (color in ('mint', 'sky', 'lavender', 'pink', 'peach', 'lemon')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index note_categories_user_name_key on public.note_categories (user_id, lower(name));

create trigger note_categories_updated_at
before update on public.note_categories
for each row execute function public.set_updated_at();

alter table public.note_categories enable row level security;

create policy "note_categories: all own" on public.note_categories
for all to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()))
with check (user_id = (select auth.uid()) and (select public.session_active()));

revoke all on public.note_categories from anon, authenticated;
grant select, insert, update, delete on public.note_categories to authenticated;

-- notes ----------------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid references public.note_categories (id) on delete set null,
  title text not null default '' check (char_length(title) <= 200),
  body text not null default '' check (char_length(body) <= 20000),
  checklist jsonb not null default '[]'::jsonb
    check (jsonb_typeof(checklist) = 'array' and jsonb_array_length(checklist) <= 100),
  search_text text not null default '',
  pinned boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_list_idx on public.notes (user_id, pinned desc, updated_at desc, id)
  where deleted_at is null;
create index notes_trash_idx on public.notes (user_id, deleted_at)
  where deleted_at is not null;

create trigger notes_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

alter table public.notes enable row level security;

-- category_id must belong to the same user, so A cannot file a note under B's category.
create policy "notes: all own" on public.notes
for all to authenticated
using (
  user_id = (select auth.uid())
  and (select public.session_active())
  and (category_id is null or exists (
    select 1 from public.note_categories c where c.id = category_id and c.user_id = (select auth.uid())
  ))
)
with check (
  user_id = (select auth.uid())
  and (select public.session_active())
  and (category_id is null or exists (
    select 1 from public.note_categories c where c.id = category_id and c.user_id = (select auth.uid())
  ))
);

revoke all on public.notes from anon, authenticated;
grant select, insert, update, delete on public.notes to authenticated;

-- Deleting a category trashes its notes first (FK set null would otherwise strand them
-- in the active list with no category). RLS still applies — caller's own role runs this.
create or replace function public.delete_note_categories(p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.notes
  set deleted_at = now()
  where category_id = any(p_ids) and deleted_at is null;

  delete from public.note_categories where id = any(p_ids);
end;
$$;

grant execute on function public.delete_note_categories(uuid[]) to authenticated;
