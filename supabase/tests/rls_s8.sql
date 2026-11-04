-- Sprint 8 test: expenses.kind, expense_recurrences.kind, generate_due_expenses, expense_monthly_totals(_by_kind),
-- min_version_code. Moved out of supabase/pending/ at the S8 release.
begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000aaaa', 'a@test.dev', '{"full_name": "User A"}');

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';
select is_empty($$ select * from public.register_device('00000000-0000-0000-0000-200000000001', 'A phone') $$, 'A signs in');
reset role;

insert into public.expense_categories (id, user_id, name, icon, color) values
  ('00000000-0000-0000-0000-600000000001', '00000000-0000-0000-0000-00000000aaaa', 'Work', 'tag', 'mint');

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';

select lives_ok(
  $$ insert into public.expenses (id, category_id, amount, spent_on) values
       ('00000000-0000-0000-0000-700000000001', '00000000-0000-0000-0000-600000000001', 1000, '2026-10-02') $$,
  'a row without kind is accepted');
select results_eq(
  $$ select kind from public.expenses where id = '00000000-0000-0000-0000-700000000001' $$,
  array['expense'], 'kind defaults to expense');
select lives_ok(
  $$ insert into public.expenses (category_id, amount, spent_on, kind) values
       ('00000000-0000-0000-0000-600000000001', 2000, '2026-10-09', 'income') $$,
  'A can add an income');
select throws_ok(
  $$ insert into public.expenses (category_id, amount, spent_on, kind) values
       ('00000000-0000-0000-0000-600000000001', 1, '2026-10-09', 'gift') $$,
  '23514', null, 'an unknown kind is refused');

select results_eq(
  $$ select month, kind, total from public.expense_monthly_totals_by_kind('2026-10-01', '2026-10-31') $$,
  $$ values ('2026-10-01'::date, 'expense', 1000::bigint), ('2026-10-01'::date, 'income', 2000::bigint) $$,
  'totals are split by kind');
select results_eq(
  $$ select month, total from public.expense_monthly_totals('2026-10-01', '2026-10-31') $$,
  $$ values ('2026-10-01'::date, 1000::bigint) $$,
  'the old total counts expenses only');

-- A monthly income rule writes income rows; a rule without kind writes expenses.
select lives_ok(
  $$ insert into public.expense_recurrences (id, category_id, amount, frequency, anchor_day, next_on, kind) values
       ('00000000-0000-0000-0000-800000000001', '00000000-0000-0000-0000-600000000001', 15000, 'monthly', 1, '2026-11-01', 'income'),
       ('00000000-0000-0000-0000-800000000002', '00000000-0000-0000-0000-600000000001', 500, 'monthly', 1, '2026-11-01', 'expense') $$,
  'A can make an income rule and an expense rule');
select is(public.generate_due_expenses('2026-11-01'), 2, 'writes one row per rule');
select results_eq(
  $$ select kind, amount from public.expenses where recurrence_id is not null order by amount $$,
  $$ values ('expense', 500::bigint), ('income', 15000::bigint) $$,
  'each row has the kind of its rule');
reset role;

select is((select min_version_code from public.app_config), 13, 'min_version_code is the S8 build');

select * from finish();
rollback;
