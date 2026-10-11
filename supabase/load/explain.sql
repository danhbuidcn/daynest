-- EXPLAIN ANALYZE of the 4 main queries as load user #1234, through RLS (LOCAL ONLY, after seed.sql).
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
rollback;
