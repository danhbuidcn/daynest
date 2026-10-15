-- EXPLAIN ANALYZE of the main queries as load user #1234, through RLS (LOCAL ONLY, after seed.sql).
\set ON_ERROR_STOP on
begin;
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-0000000004d2", "session_id": "10000000-0000-0000-0000-0000000004d2", "role": "authenticated"}';

\echo '--- 1. month events'
explain (analyze, costs off, timing off, summary off)
select id, title, starts_at, ends_at, start_date, end_date, repeat, updated_at from public.events
where deleted_at is null and span_start <= '2026-11-08' and span_end >= '2026-09-28';

\echo '--- 2. month exceptions'
explain (analyze, costs off, timing off, summary off)
select * from public.event_exceptions
where event_id = any (array(select id from public.events where repeat <> 'none'));

\echo '--- 3. notes first page'
explain (analyze, costs off, timing off, summary off)
select id, title, pinned, updated_at from public.notes where deleted_at is null
order by pinned desc, updated_at desc, id desc limit 30;

\echo '--- 4. note search'
explain (analyze, costs off, timing off, summary off)
select id, title, pinned, updated_at from public.notes where deleted_at is null and search_text ilike '%milk%'
order by pinned desc, updated_at desc, id desc limit 30;
\echo '--- 5. expenses of one month'
explain (analyze, costs off, timing off, summary off)
select id, category_id, amount, spent_on, note, updated_at from public.expenses
where spent_on >= '2026-10-01' and spent_on <= '2026-10-31'
order by spent_on desc, created_at desc limit 1000;

\echo '--- 6. last 6 months totals'
explain (analyze, costs off, timing off, summary off)
select * from public.expense_monthly_totals('2026-05-01', '2026-10-31');

\echo '--- 6b. the query inside expense_monthly_totals'
explain (analyze, costs off, timing off, summary off)
select date_trunc('month', e.spent_on)::date, sum(e.amount)::bigint
from public.expenses e
where e.user_id = (select auth.uid()) and e.spent_on between '2026-05-01' and '2026-10-31'
group by 1 order by 1;

\echo '--- 7. todo list (week of 2026-10-12, 30 days overdue + 7 upcoming)'
explain (analyze, costs off, timing off, summary off)
select id, title, all_day, starts_at, start_date, repeat, subtasks, done, done_subtasks, updated_at from public.todos
where deleted_at is null and span_start <= '2026-10-26' and span_end >= '2026-09-11';

\echo '--- 8. period days of the last 12 months'
explain (analyze, costs off, timing off, summary off)
select day from public.period_days where day >= '2025-10-01' order by day;

\echo '--- 9. budget (general + month rows)'
explain (analyze, costs off, timing off, summary off)
select monthly_budget from public.user_settings;
explain (analyze, costs off, timing off, summary off)
select month, amount from public.expense_month_budgets;

\echo '--- 10. month events + exceptions in one request (nested select, as PostgREST runs it)'
explain (analyze, costs off, timing off, summary off)
select e.id, (select coalesce(json_agg(x), '[]') from public.event_exceptions x where x.event_id = e.id)
from public.events e
where e.deleted_at is null and e.span_start <= '2026-11-08' and e.span_end >= '2026-09-28';

\echo '--- 11. todo list + exceptions in one request (nested select)'
explain (analyze, costs off, timing off, summary off)
select t.id, (select coalesce(json_agg(x), '[]') from public.todo_exceptions x where x.todo_id = t.id)
from public.todos t
where t.deleted_at is null and t.span_start <= '2026-10-26' and t.span_end >= '2026-09-11';

\echo '--- 12. generate_due_expenses: the due-rule lookup (the function body inserts, so it runs in the next step)'
explain (analyze, costs off, timing off, summary off)
select * from public.expense_recurrences where next_on <= '2026-10-15' for update;

\echo '--- 13. generate_due_expenses (rolled back)'
select public.generate_due_expenses('2026-10-15') as rows_written;
rollback;
