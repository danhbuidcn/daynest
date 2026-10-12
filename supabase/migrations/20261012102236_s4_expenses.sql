-- Sprint 4: expense_categories, expenses, monthly totals. Spec: docs/specs/sprint-4/design/db.md
-- Additive only: builds before S4 never touch these tables, so no min_version_code bump here.

-- expense_categories ----------------------------------------------------------
-- Built-in rows have a key (app shows the name from i18n) and are read-only; user rows have a name.
create table public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text check (key in ('food', 'transport', 'bills')),
  name text check (char_length(name) between 1 and 30),
  icon text not null default 'tag' check (icon ~ '^[a-z]{2,20}$'),
  color text not null check (
    color in ('mint', 'sky', 'lavender', 'pink', 'peach', 'lemon') or color ~ '^#[0-9A-F]{6}$'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((key is null) <> (name is null))
);

create unique index expense_categories_user_key_key on public.expense_categories (user_id, key)
  where key is not null;
create unique index expense_categories_user_name_key on public.expense_categories (user_id, lower(name))
  where name is not null;

create trigger expense_categories_updated_at
before update on public.expense_categories
for each row execute function public.set_updated_at();

alter table public.expense_categories enable row level security;

create policy "expense_categories: read own" on public.expense_categories
for select to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()));

-- Only user-made rows (key is null) can be created, edited or deleted from the app.
create policy "expense_categories: insert own" on public.expense_categories
for insert to authenticated
with check (user_id = (select auth.uid()) and (select public.session_active()) and key is null);

create policy "expense_categories: update own" on public.expense_categories
for update to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()) and key is null)
with check (user_id = (select auth.uid()) and (select public.session_active()) and key is null);

create policy "expense_categories: delete own" on public.expense_categories
for delete to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()) and key is null);

revoke all on public.expense_categories from anon, authenticated;
grant select, insert, update, delete on public.expense_categories to authenticated;

-- expenses -----------------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid not null references public.expense_categories (id) on delete cascade,
  amount bigint not null check (amount between 1 and 100000000000),
  spent_on date not null,
  note text not null default '' check (char_length(note) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_period_idx on public.expenses (user_id, spent_on desc, created_at desc);
create index expenses_category_idx on public.expenses (category_id);

create trigger expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

alter table public.expenses enable row level security;

-- category_id must belong to the same user, so A cannot file an expense under B's category.
create policy "expenses: all own" on public.expenses
for all to authenticated
using (
  user_id = (select auth.uid())
  and (select public.session_active())
  and exists (
    select 1 from public.expense_categories c where c.id = category_id and c.user_id = (select auth.uid())
  )
)
with check (
  user_id = (select auth.uid())
  and (select public.session_active())
  and exists (
    select 1 from public.expense_categories c where c.id = category_id and c.user_id = (select auth.uid())
  )
);

revoke all on public.expenses from anon, authenticated;
grant select, insert, update, delete on public.expenses to authenticated;

-- Monthly totals for the "last 6 months" chart, summed in the DB so the app never downloads
-- every row. RLS still applies — caller's own role runs this.
create or replace function public.expense_monthly_totals(p_from date, p_to date)
returns table (month date, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select date_trunc('month', e.spent_on)::date, sum(e.amount)::bigint
  from public.expenses e
  where e.user_id = (select auth.uid()) and e.spent_on between p_from and p_to
  group by 1
  order by 1;
$$;

grant execute on function public.expense_monthly_totals(date, date) to authenticated;

-- Built-in categories --------------------------------------------------------------
create or replace function public.add_default_expense_categories(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.expense_categories (user_id, key, icon, color) values
    (p_user_id, 'food', 'food', 'peach'),
    (p_user_id, 'transport', 'car', 'sky'),
    (p_user_id, 'bills', 'bill', 'lemon')
  on conflict do nothing;
$$;

revoke execute on function public.add_default_expense_categories(uuid) from public, anon, authenticated;

-- New users get them from a trigger of their own, so handle_new_user stays untouched.
create or replace function public.handle_new_user_expense_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.add_default_expense_categories(new.id);
  return new;
end;
$$;

create trigger on_auth_user_created_expense_categories
after insert on auth.users
for each row execute function public.handle_new_user_expense_categories();

-- Existing users.
select public.add_default_expense_categories(id) from auth.users;
