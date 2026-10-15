-- Sprint 6: budgets, recurring expenses, appearance. Spec: docs/specs/sprint-6/design/db.md
-- Additive only (defaults, new tables, function): builds before S6 never read these, so no min_version_code bump.

-- user_settings: budget + appearance ----------------------------------------------------
alter table public.user_settings
  add column monthly_budget bigint check (monthly_budget between 1 and 100000000000),
  add column theme text not null default 'mint' check (
    theme in ('mint', 'rose', 'sky', 'lavender', 'clay', 'lemon', 'slate', 'dark', 'system', 'custom')
  ),
  add column theme_primary text check (theme_primary ~ '^#[0-9A-F]{6}$'),
  add column theme_dark boolean not null default false,
  add column background text not null default 'plain' check (
    background ~ '^(plain|color|photo|color-[1-8]|gradient-[1-8]|pattern-[1-6])$'
  ),
  add column background_color text check (background_color ~ '^#[0-9A-F]{6}$'),
  add column font text not null default 'nunito' check (
    font in ('nunito', 'be-vietnam-pro', 'quicksand', 'baloo-2', 'itim', 'patrick-hand')
  ),
  add column font_scale real not null default 1 check (font_scale in (0.9, 1, 1.15));

grant update (monthly_budget, theme, theme_primary, theme_dark, background, background_color, font, font_scale)
  on public.user_settings to authenticated;

-- expense_month_budgets: one month's own budget (amount null = no budget that month) ------
create table public.expense_month_budgets (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  amount bigint check (amount between 1 and 100000000000),
  updated_at timestamptz not null default now(),
  primary key (user_id, month)
);

create trigger expense_month_budgets_updated_at
before update on public.expense_month_budgets
for each row execute function public.set_updated_at();

alter table public.expense_month_budgets enable row level security;

create policy "expense_month_budgets: all own" on public.expense_month_budgets
for all to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()))
with check (user_id = (select auth.uid()) and (select public.session_active()));

revoke all on public.expense_month_budgets from anon, authenticated;
grant select, insert, update, delete on public.expense_month_budgets to authenticated;

-- expense_recurrences -------------------------------------------------------------------
create table public.expense_recurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id uuid not null references public.expense_categories (id) on delete cascade,
  amount bigint not null check (amount between 1 and 100000000000),
  note text not null default '' check (char_length(note) <= 200),
  frequency text not null check (frequency in ('weekly', 'monthly')),
  -- weekly: ISO weekday 1-7; monthly: day 1-31, kept so a short month does not drift the day.
  anchor_day smallint not null check (anchor_day between 1 and 31),
  next_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (frequency = 'monthly' or anchor_day <= 7)
);

create index expense_recurrences_user_idx on public.expense_recurrences (user_id, next_on);

create trigger expense_recurrences_updated_at
before update on public.expense_recurrences
for each row execute function public.set_updated_at();

alter table public.expense_recurrences enable row level security;

-- category_id must belong to the same user, like expenses.
create policy "expense_recurrences: all own" on public.expense_recurrences
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

revoke all on public.expense_recurrences from anon, authenticated;
grant select, insert, update, delete on public.expense_recurrences to authenticated;

-- Deleting a rule keeps the expenses it already wrote.
alter table public.expenses
  add column recurrence_id uuid references public.expense_recurrences (id) on delete set null;

create index expenses_recurrence_idx on public.expenses (recurrence_id) where recurrence_id is not null;

-- generate_due_expenses -------------------------------------------------------------------
-- Writes every due occurrence up to p_today (at most 60 per call), moves next_on forward and
-- returns how many rows it wrote. security invoker: RLS applies. for update: a second device
-- calling at the same time waits, then sees the moved next_on and writes nothing twice.
create or replace function public.generate_due_expenses(p_today date)
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r record;
  v_next date;
  v_month date;
  v_count int := 0;
begin
  if p_today > current_date + 1 then
    raise exception 'p_today is too far in the future' using errcode = '22023';
  end if;

  for r in
    select * from public.expense_recurrences
    where user_id = (select auth.uid()) and next_on <= p_today
    order by next_on
    for update
  loop
    v_next := r.next_on;
    while v_next <= p_today and v_count < 60 loop
      insert into public.expenses (category_id, amount, spent_on, note, recurrence_id)
      values (r.category_id, r.amount, v_next, r.note, r.id);
      v_count := v_count + 1;

      if r.frequency = 'weekly' then
        v_next := v_next + 7;
      else
        v_month := (date_trunc('month', v_next) + interval '1 month')::date;
        v_next := v_month + (least(
          r.anchor_day,
          extract(day from (v_month + interval '1 month - 1 day'))::int
        ) - 1);
      end if;
    end loop;

    update public.expense_recurrences set next_on = v_next where id = r.id;
    exit when v_count >= 60;
  end loop;

  return v_count;
end;
$$;

revoke execute on function public.generate_due_expenses(date) from public, anon;
grant execute on function public.generate_due_expenses(date) to authenticated;
