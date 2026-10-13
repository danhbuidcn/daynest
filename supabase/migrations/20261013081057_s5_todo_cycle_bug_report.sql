-- Sprint 5: todos, todo_exceptions, period_days, cycle settings, bug_reports, developer_emails,
-- bug-reports bucket. Spec: docs/specs/sprint-5/design/db.md
-- Additive only: builds before S5 never touch these tables/columns, so no min_version_code bump.

-- Subtasks: array of {id, text}, at most 50, text 1-200 chars. A function, because a check
-- constraint cannot use a subquery.
create or replace function public.subtasks_valid(p jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(p) = 'array'
    and jsonb_array_length(p) <= 50
    and not exists (
      select 1 from jsonb_array_elements(p) s
      where jsonb_typeof(s) <> 'object'
        or jsonb_typeof(s -> 'id') <> 'string'
        or (s ->> 'id') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        or jsonb_typeof(s -> 'text') <> 'string'
        or char_length(s ->> 'text') not between 1 and 200
    );
$$;

-- todos: like events, without the google_* columns (todos never sync) ------------------
create table public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 1000),
  note text check (char_length(note) <= 8000),
  color text not null check (
    color in ('mint', 'sky', 'lavender', 'pink', 'peach', 'lemon') or color ~ '^#[0-9A-F]{6}$'
  ),
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
  subtasks jsonb not null default '[]'::jsonb check (public.subtasks_valid(subtasks)),
  -- done / done_subtasks: for a non-repeating todo; each repeat keeps its own in todo_exceptions.
  done boolean not null default false,
  done_subtasks uuid[] not null default '{}'::uuid[],
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

create index todos_span_idx on public.todos (user_id, span_start);

create trigger todos_updated_at
before update on public.todos
for each row execute function public.set_updated_at();

alter table public.todos enable row level security;

create policy "todos: all own" on public.todos
for all to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()))
with check (user_id = (select auth.uid()) and (select public.session_active()));

revoke all on public.todos from anon, authenticated;
grant select, insert, update, delete on public.todos to authenticated;

-- todo_exceptions: like event_exceptions, plus kind 'status' (only the done state of one repeat)
create table public.todo_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  todo_id uuid not null references public.todos (id) on delete cascade,
  occurrence_date date not null,
  kind text not null check (kind in ('skip', 'override', 'status')),
  title text check (char_length(title) between 1 and 1000),
  note text check (char_length(note) <= 8000),
  color text check (
    color in ('mint', 'sky', 'lavender', 'pink', 'peach', 'lemon') or color ~ '^#[0-9A-F]{6}$'
  ),
  all_day boolean,
  starts_at timestamptz,
  ends_at timestamptz,
  start_date date,
  end_date date,
  reminder_minutes int[] check (array_length(reminder_minutes, 1) is null or array_length(reminder_minutes, 1) <= 5),
  -- null = this repeat uses the todo's own subtasks
  subtasks jsonb check (subtasks is null or public.subtasks_valid(subtasks)),
  done boolean,
  done_subtasks uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (todo_id, occurrence_date)
);

create index todo_exceptions_todo_idx on public.todo_exceptions (todo_id);

create trigger todo_exceptions_updated_at
before update on public.todo_exceptions
for each row execute function public.set_updated_at();

alter table public.todo_exceptions enable row level security;

-- todo_id must belong to the same user, so A cannot attach an exception to B's todo.
create policy "todo_exceptions: all own" on public.todo_exceptions
for all to authenticated
using (
  user_id = (select auth.uid())
  and (select public.session_active())
  and exists (select 1 from public.todos t where t.id = todo_id and t.user_id = (select auth.uid()))
)
with check (
  user_id = (select auth.uid())
  and (select public.session_active())
  and exists (select 1 from public.todos t where t.id = todo_id and t.user_id = (select auth.uid()))
);

revoke all on public.todo_exceptions from anon, authenticated;
grant select, insert, update, delete on public.todo_exceptions to authenticated;

-- period_days: one row per day with a period; the app groups consecutive days into periods ----
create table public.period_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

alter table public.period_days enable row level security;

create policy "period_days: all own" on public.period_days
for all to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()))
with check (user_id = (select auth.uid()) and (select public.session_active()));

revoke all on public.period_days from anon, authenticated;
grant select, insert, update, delete on public.period_days to authenticated;

-- user_settings: cycle columns ----------------------------------------------------------
alter table public.user_settings
  add column cycle_enabled boolean not null default false,
  add column cycle_length smallint not null default 28 check (cycle_length between 21 and 45),
  add column period_length smallint not null default 5 check (period_length between 2 and 10),
  add column period_reminder boolean not null default true,
  add column period_reminder_days smallint not null default 2 check (period_reminder_days between 1 and 7),
  add column period_reminder_time time not null default '09:00'
    check (extract(second from period_reminder_time) = 0 and extract(minute from period_reminder_time)::int % 5 = 0);

grant update (cycle_enabled, cycle_length, period_length, period_reminder, period_reminder_days, period_reminder_time)
  on public.user_settings to authenticated;

-- bug_reports: users can only insert their own; only developers read them on Supabase ------
create table public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 10 and 2000),
  images text[] not null default '{}'::text[]
    check (array_length(images, 1) is null or array_length(images, 1) <= 3),
  app_version text check (char_length(app_version) <= 100),
  device text check (char_length(device) <= 100),
  os text check (char_length(os) <= 100),
  locale text check (char_length(locale) <= 100),
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index bug_reports_user_created_idx on public.bug_reports (user_id, created_at);

alter table public.bug_reports enable row level security;

create policy "bug_reports: insert own" on public.bug_reports
for insert to authenticated
with check (user_id = (select auth.uid()) and (select public.session_active()));

revoke all on public.bug_reports from anon, authenticated;
grant insert on public.bug_reports to authenticated;

-- 5 reports per user per 24 hours. Security definer: the caller cannot select bug_reports.
-- The advisory lock stops two parallel inserts from both passing the count.
create or replace function public.check_bug_report_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('bug_reports:' || new.user_id::text));
  if (
    select count(*) from public.bug_reports
    where user_id = new.user_id and created_at > now() - interval '24 hours'
  ) >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger bug_reports_limit
before insert on public.bug_reports
for each row execute function public.check_bug_report_limit();

-- developer_emails: RLS on, no policy -> only the Edge Function (service role) reads it ------
create table public.developer_emails (
  email text primary key check (email ~ '^[^@\s]+@[^@\s]+$')
);

alter table public.developer_emails enable row level security;
revoke all on public.developer_emails from anon, authenticated;

insert into public.developer_emails (email) values ('danhbuidcn@gmail.com');

-- Storage: private bucket, path <user_id>/<report_id>/<n>.jpg -------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bug-reports', 'bug-reports', false, 2097152, array['image/jpeg']);

-- Upload into own folder only; no select/update/delete policy, so nobody reads them from the app.
create policy "bug-reports: upload own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'bug-reports'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select public.session_active())
);
