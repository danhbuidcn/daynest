-- Sprint 8: income / expense. Spec: docs/specs/sprint-8/design/db.md
-- Builds before S8 do not know `kind`: they would add income to the expense totals,
-- so they must update first: min_version_code = 13 (S8 build).
-- Held in supabase/pending/ until the S8 release, then moved to migrations/.

alter table public.expenses
  add column kind text not null default 'expense' check (kind in ('expense', 'income'));
alter table public.expense_recurrences
  add column kind text not null default 'expense' check (kind in ('expense', 'income'));

-- Same as before but a rule's kind goes to the rows it writes.
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
      insert into public.expenses (category_id, amount, spent_on, note, recurrence_id, kind)
      values (r.category_id, r.amount, v_next, r.note, r.id, r.kind);
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

-- The old function keeps its shape and now counts expenses only.
create or replace function public.expense_monthly_totals(p_from date, p_to date)
returns table (month date, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select date_trunc('month', e.spent_on)::date, sum(e.amount)::bigint
  from public.expenses e
  where e.user_id = (select auth.uid()) and e.kind = 'expense' and e.spent_on between p_from and p_to
  group by 1
  order by 1;
$$;

-- "Last 6 months" chart: one row per month and kind.
create or replace function public.expense_monthly_totals_by_kind(p_from date, p_to date)
returns table (month date, kind text, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select date_trunc('month', e.spent_on)::date, e.kind, sum(e.amount)::bigint
  from public.expenses e
  where e.user_id = (select auth.uid()) and e.spent_on between p_from and p_to
  group by 1, 2
  order by 1, 2;
$$;

grant execute on function public.expense_monthly_totals_by_kind(date, date) to authenticated;

update public.app_config set min_version_code = 13;
