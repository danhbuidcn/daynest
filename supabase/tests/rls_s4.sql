-- Sprint 4 RLS test: expense_categories + expenses. 2 fake users cannot read/write each
-- other's rows, built-in categories are read-only, deleting a category deletes its expenses.
-- Run: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

-- 2 fake users -> triggers create profiles, user_settings and 3 built-in categories each
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000aaaa', 'a@test.dev', '{"full_name": "User A"}'),
  ('00000000-0000-0000-0000-00000000bbbb', 'b@test.dev', '{"full_name": "User B"}');

select is(
  (select array_agg(key order by key) from public.expense_categories where user_id = '00000000-0000-0000-0000-00000000aaaa'),
  array['bills', 'food', 'transport'], 'new user gets the 3 built-in categories');

-- One active session per user
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

-- Seed: one user category + one expense per user
insert into public.expense_categories (id, user_id, name, icon, color) values
  ('00000000-0000-0000-0000-600000000001', '00000000-0000-0000-0000-00000000aaaa', 'A coffee', 'coffee', 'pink'),
  ('00000000-0000-0000-0000-600000000002', '00000000-0000-0000-0000-00000000bbbb', 'B coffee', 'coffee', '#C2582F');
insert into public.expenses (id, user_id, category_id, amount, spent_on) values
  ('00000000-0000-0000-0000-700000000001', '00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-600000000001', 35000, '2026-10-12'),
  ('00000000-0000-0000-0000-700000000002', '00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-600000000002', 29000, '2026-10-12');

-- Act as A ------------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';

select results_eq($$ select count(*)::int from public.expense_categories $$, array[4], 'A sees only own categories (3 built-in + 1)');
select results_eq($$ select count(*)::int from public.expenses $$, array[1], 'A sees only own expense');
select is_empty(
  $$ update public.expense_categories set name = 'hack' where id = '00000000-0000-0000-0000-600000000002' returning id $$,
  'A cannot update B category');
select is_empty(
  $$ delete from public.expense_categories where id = '00000000-0000-0000-0000-600000000002' returning id $$,
  'A cannot delete B category');
select is_empty(
  $$ update public.expenses set amount = 1 where id = '00000000-0000-0000-0000-700000000002' returning id $$,
  'A cannot update B expense');
select is_empty(
  $$ delete from public.expenses where id = '00000000-0000-0000-0000-700000000002' returning id $$,
  'A cannot delete B expense');
select throws_ok(
  $$ insert into public.expenses (user_id, category_id, amount, spent_on)
     values ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-600000000002', 1000, '2026-10-12') $$,
  '42501', null, 'A cannot file an expense under B category');

-- Built-in categories are read-only
select is_empty(
  $$ update public.expense_categories set color = 'mint' where key = 'food' returning id $$,
  'A cannot edit a built-in category');
select is_empty(
  $$ delete from public.expense_categories where key = 'food' returning id $$,
  'A cannot delete a built-in category');
select throws_ok(
  $$ insert into public.expense_categories (user_id, key, icon, color) values ('00000000-0000-0000-0000-00000000aaaa', 'food', 'food', 'peach') $$,
  '42501', null, 'A cannot insert a built-in category');

-- Own writes work
select lives_ok(
  $$ insert into public.expense_categories (user_id, name, icon, color) values ('00000000-0000-0000-0000-00000000aaaa', 'Pets', 'paw', '#7FD1B0') $$,
  'A can add a category with a hex colour');
select throws_ok(
  $$ insert into public.expense_categories (user_id, name, icon, color) values ('00000000-0000-0000-0000-00000000aaaa', 'pets', 'paw', 'mint') $$,
  '23505', null, 'category names are unique per user, ignoring case');
select lives_ok(
  $$ insert into public.expenses (user_id, category_id, amount, spent_on)
     select '00000000-0000-0000-0000-00000000aaaa', id, 450000, '2026-09-20' from public.expense_categories where key = 'bills' $$,
  'A can add an expense under a built-in category');
select results_eq(
  $$ select month, total from public.expense_monthly_totals('2026-05-01', '2026-10-31') $$,
  $$ values ('2026-09-01'::date, 450000::bigint), ('2026-10-01'::date, 35000::bigint) $$,
  'monthly totals sum only own expenses, by month');

-- Deleting own category deletes its expenses
select lives_ok(
  $$ delete from public.expense_categories where id = '00000000-0000-0000-0000-600000000001' $$,
  'A can delete own category');
select results_eq(
  $$ select count(*)::int from public.expenses where id = '00000000-0000-0000-0000-700000000001' $$,
  array[0], 'its expense is deleted with it');
reset role;

-- Value checks (as owner, bypassing RLS) ---------------------------------------------------
select throws_ok(
  $$ insert into public.expense_categories (user_id, name, icon, color) values ('00000000-0000-0000-0000-00000000aaaa', 'Bad', 'tag', '#abc') $$,
  '23514', null, 'colour rejects a short or lower-case hex');
select throws_ok(
  $$ insert into public.expense_categories (user_id, name, icon, color) values ('00000000-0000-0000-0000-00000000aaaa', 'Bad', 'tag', 'red') $$,
  '23514', null, 'colour rejects an unknown name');
select throws_ok(
  $$ insert into public.expenses (user_id, category_id, amount, spent_on)
     values ('00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-600000000002', 0, '2026-10-12') $$,
  '23514', null, 'amount must be at least 1');

select * from finish();
rollback;
