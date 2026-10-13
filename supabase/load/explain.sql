-- EXPLAIN ANALYZE of the 6 main queries as load user #1234, through RLS (LOCAL ONLY, after seed.sql).
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
rollback;
