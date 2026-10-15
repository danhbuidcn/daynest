-- Sprint 6 RLS test: expense_month_budgets, expense_recurrences, new user_settings columns,
-- generate_due_expenses. Run: supabase/db test
begin;
create extension if not exists pgtap with schema extensions;
select plan(34);

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000aaaa', 'a@test.dev', '{"full_name": "User A"}'),
  ('00000000-0000-0000-0000-00000000bbbb', 'b@test.dev', '{"full_name": "User B"}');

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';
select is_empty($$ select * from public.register_device('00000000-0000-0000-0000-200000000001', 'A phone') $$, 'A signs in');
reset role;
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000bbbb", "session_id": "00000000-0000-0000-0000-100000000002", "role": "authenticated"}';
select is_empty($$ select * from public.register_device('00000000-0000-0000-0000-200000000002', 'B phone') $$, 'B signs in');
reset role;

-- Seed (as owner): a category per user, B's rule and budget, A's rules
insert into public.expense_categories (id, user_id, name, icon, color) values
  ('00000000-0000-0000-0000-600000000001', '00000000-0000-0000-0000-00000000aaaa', 'A rent', 'home', 'pink'),
  ('00000000-0000-0000-0000-600000000002', '00000000-0000-0000-0000-00000000bbbb', 'B rent', 'home', 'sky');
insert into public.expense_recurrences (id, user_id, category_id, amount, frequency, anchor_day, next_on) values
  ('00000000-0000-0000-0000-800000000002', '00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-600000000002', 5000, 'monthly', 5, '2025-10-05');
insert into public.expense_month_budgets (user_id, month, amount) values
  ('00000000-0000-0000-0000-00000000bbbb', '2025-10-01', 9000000);
update public.user_settings set monthly_budget = 7000000 where user_id = '00000000-0000-0000-0000-00000000bbbb';

-- Act as A ------------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';

select is_empty($$ select * from public.expense_recurrences $$, 'A sees none of B rules');
select is_empty($$ select * from public.expense_month_budgets $$, 'A sees none of B month budgets');
select is_empty(
  $$ update public.expense_recurrences set amount = 1 where id = '00000000-0000-0000-0000-800000000002' returning id $$,
  'A cannot update B rule');
select is_empty(
  $$ delete from public.expense_recurrences where id = '00000000-0000-0000-0000-800000000002' returning id $$,
  'A cannot delete B rule');
select is_empty(
  $$ update public.expense_month_budgets set amount = 1 returning month $$,
  'A cannot update B month budget');
select is_empty(
  $$ delete from public.expense_month_budgets returning month $$,
  'A cannot delete B month budget');
select results_eq($$ select monthly_budget from public.user_settings $$, array[null::bigint], 'A sees only own monthly_budget');
select is_empty(
  $$ update public.user_settings set theme = 'dark' where user_id = '00000000-0000-0000-0000-00000000bbbb' returning user_id $$,
  'A cannot change B appearance');
select throws_ok(
  $$ insert into public.expense_recurrences (category_id, amount, frequency, anchor_day, next_on)
     values ('00000000-0000-0000-0000-600000000002', 1000, 'monthly', 1, '2025-11-01') $$,
  '42501', null, 'A cannot make a rule under B category');
select throws_ok(
  $$ insert into public.expense_recurrences (user_id, category_id, amount, frequency, anchor_day, next_on)
     values ('00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-600000000001', 1000, 'monthly', 1, '2025-11-01') $$,
  '42501', null, 'A cannot make a rule for B');

-- Own writes
select lives_ok(
  $$ update public.user_settings set monthly_budget = 5000000, theme = 'custom', theme_primary = '#C2582F',
       theme_dark = true, background = 'gradient-3', font = 'itim', font_scale = 1.15 $$,
  'A can save budget and appearance');
select lives_ok(
  $$ insert into public.expense_month_budgets (month, amount) values ('2025-10-01', 6000000), ('2025-11-01', null) $$,
  'A can set a month budget and a month with no budget');
select throws_ok(
  $$ insert into public.expense_month_budgets (month, amount) values ('2025-12-15', 1000) $$,
  '23514', null, 'month must be day 1');

-- Rules: monthly on day 31 from Oct, weekly on Mondays (ISO 1), one that is not due yet
select lives_ok(
  $$ insert into public.expense_recurrences (id, category_id, amount, frequency, anchor_day, next_on, note) values
       ('00000000-0000-0000-0000-800000000011', '00000000-0000-0000-0000-600000000001', 1000, 'monthly', 31, '2025-10-31', 'rent'),
       ('00000000-0000-0000-0000-800000000012', '00000000-0000-0000-0000-600000000001', 2000, 'weekly', 1, '2025-10-05', ''),
       ('00000000-0000-0000-0000-800000000013', '00000000-0000-0000-0000-600000000001', 3000, 'monthly', 20, '2025-12-20', '') $$,
  'A can make rules');

select throws_ok($$ select public.generate_due_expenses(current_date + 2) $$, '22023', null, 'a date far in the future is refused');

-- To 2025-10-31: weekly 5, 12, 19, 26 (4) + monthly day 31 (1)
select is(public.generate_due_expenses('2025-10-31'), 5, 'writes 4 weekly + 1 monthly occurrence');
select is(public.generate_due_expenses('2025-10-31'), 0, 'a second call writes nothing');
select results_eq(
  $$ select next_on from public.expense_recurrences where id = '00000000-0000-0000-0000-800000000011' $$,
  array['2025-11-30'::date], 'day 31 moves to 30 Nov');
select results_eq(
  $$ select next_on from public.expense_recurrences where id = '00000000-0000-0000-0000-800000000012' $$,
  array['2025-11-02'::date], 'weekly moves 7 days');
select results_eq(
  $$ select count(*)::int from public.expenses where recurrence_id is not null and spent_on > '2025-10-31' $$,
  array[0], 'no occurrence after the given day');

-- Day 31 keeps its anchor: 30/11, then 31/12
select is(public.generate_due_expenses('2025-12-31'), 12, 'catches up Nov-Dec: 9 weekly + 2 monthly + 1 new');
select results_eq(
  $$ select next_on from public.expense_recurrences where id = '00000000-0000-0000-0000-800000000011' $$,
  array['2026-01-31'::date], '30 Nov then 31 Dec, next 31 Jan');

-- Deleting an auto expense is not written again
delete from public.expenses where recurrence_id = '00000000-0000-0000-0000-800000000011' and spent_on = '2025-10-31';
select is(public.generate_due_expenses('2025-12-31'), 0, 'a deleted auto expense is not written again');

-- Deleting a rule keeps its expenses
select lives_ok($$ delete from public.expense_recurrences where id = '00000000-0000-0000-0000-800000000011' $$, 'A can delete a rule');
select results_eq(
  $$ select count(*)::int from public.expenses where note = 'rent' and recurrence_id is null $$,
  array[2], 'expenses written by the deleted rule stay, detached');

-- Leap year: day 30 -> 29 Feb -> 30 Mar
insert into public.expense_recurrences (id, category_id, amount, frequency, anchor_day, next_on)
values ('00000000-0000-0000-0000-800000000015', '00000000-0000-0000-0000-600000000001', 1, 'monthly', 30, '2024-01-30');
select is(public.generate_due_expenses('2024-02-29'), 2, 'writes 30 Jan and 29 Feb');
select results_eq(
  $$ select next_on from public.expense_recurrences where id = '00000000-0000-0000-0000-800000000015' $$,
  array['2024-03-30'::date], 'leap year: 29 Feb, next 30 Mar');

-- At most 60 rows per call
insert into public.expense_recurrences (id, category_id, amount, frequency, anchor_day, next_on)
values ('00000000-0000-0000-0000-800000000014', '00000000-0000-0000-0000-600000000001', 1, 'weekly', 1, '2020-01-06');
select is(public.generate_due_expenses('2025-12-31'), 60, 'capped at 60 rows per call');
select results_eq(
  $$ select next_on from public.expense_recurrences where id = '00000000-0000-0000-0000-800000000014' $$,
  array['2021-03-01'::date], 'the rule resumes where the cap stopped it');
reset role;

-- B's rule was untouched by A's calls
select results_eq(
  $$ select next_on from public.expense_recurrences where id = '00000000-0000-0000-0000-800000000002' $$,
  array['2025-10-05'::date], 'A generate does not touch B rule');

-- A signed-out device (session removed) writes and reads nothing
delete from public.user_devices where session_id = '00000000-0000-0000-0000-100000000001';
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';
select is(public.generate_due_expenses('2025-12-31'), 0, 'signed-out device generates nothing');
select throws_ok(
  $$ insert into public.expense_month_budgets (month, amount) values ('2026-01-01', 1000) $$,
  '42501', null, 'signed-out device cannot write a month budget');
reset role;

select * from finish();
rollback;
