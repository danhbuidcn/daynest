-- Sprint 5 RLS test: todos, todo_exceptions, period_days, cycle settings, bug_reports,
-- developer_emails, bug-reports bucket. 2 fake users cannot read/write each other's rows,
-- nobody reads bug reports or their images from the app, 6th report in 24 hours is blocked.
-- Run: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(33);

-- 2 fake users
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000aaaa', 'a@test.dev', '{"full_name": "User A"}'),
  ('00000000-0000-0000-0000-00000000bbbb', 'b@test.dev', '{"full_name": "User B"}');

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

-- Seed (as owner) ---------------------------------------------------------------------------
insert into public.todos (id, user_id, title, color, all_day, start_date, end_date, span_start, span_end, subtasks) values
  ('00000000-0000-0000-0000-800000000001', '00000000-0000-0000-0000-00000000aaaa', 'A todo', 'mint', true,
   '2026-10-13', '2026-10-13', '2026-10-13', '2026-10-13',
   '[{"id": "00000000-0000-0000-0000-900000000001", "text": "Step 1"}]'),
  ('00000000-0000-0000-0000-800000000002', '00000000-0000-0000-0000-00000000bbbb', 'B todo', '#C2582F', true,
   '2026-10-13', '2026-10-13', '2026-10-13', '2026-10-13', '[]');
update public.todos set repeat = 'daily' where id = '00000000-0000-0000-0000-800000000002';
insert into public.todo_exceptions (user_id, todo_id, occurrence_date, kind, done) values
  ('00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-800000000002', '2026-10-14', 'status', true);
insert into public.period_days (user_id, day) values
  ('00000000-0000-0000-0000-00000000aaaa', '2026-10-01'),
  ('00000000-0000-0000-0000-00000000bbbb', '2026-10-02');
insert into public.bug_reports (user_id, body) values
  ('00000000-0000-0000-0000-00000000bbbb', 'B found a bug here');
insert into storage.objects (bucket_id, name) values
  ('bug-reports', '00000000-0000-0000-0000-00000000aaaa/r1/1.jpg'),
  ('bug-reports', '00000000-0000-0000-0000-00000000bbbb/r2/1.jpg');

-- Act as A ------------------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';

-- todos, todo_exceptions
select results_eq($$ select count(*)::int from public.todos $$, array[1], 'A sees only own todo');
select is_empty(
  $$ update public.todos set title = 'hack' where id = '00000000-0000-0000-0000-800000000002' returning id $$,
  'A cannot update B todo');
select is_empty(
  $$ delete from public.todos where id = '00000000-0000-0000-0000-800000000002' returning id $$,
  'A cannot delete B todo');
select results_eq($$ select count(*)::int from public.todo_exceptions $$, array[0], 'A cannot read B todo exceptions');
select is_empty(
  $$ update public.todo_exceptions set done = false returning id $$,
  'A cannot update B todo exception');
select throws_ok(
  $$ insert into public.todo_exceptions (user_id, todo_id, occurrence_date, kind, done)
     values ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-800000000002', '2026-10-15', 'status', true) $$,
  '42501', null, 'A cannot attach an exception to B todo');
select lives_ok(
  $$ insert into public.todo_exceptions (user_id, todo_id, occurrence_date, kind, done, done_subtasks)
     values ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-800000000001', '2026-10-13', 'status', true,
             '{00000000-0000-0000-0000-900000000001}')
     on conflict (todo_id, occurrence_date) do update set done = excluded.done, done_subtasks = excluded.done_subtasks $$,
  'A can tick one repeat of own todo (upsert status)');
select lives_ok(
  $$ update public.todos set done = true, done_subtasks = '{00000000-0000-0000-0000-900000000001}'
     where id = '00000000-0000-0000-0000-800000000001' $$,
  'A can tick own todo');

-- period_days
select results_eq($$ select count(*)::int from public.period_days $$, array[1], 'A sees only own period days');
select is_empty(
  $$ delete from public.period_days where user_id = '00000000-0000-0000-0000-00000000bbbb' returning id $$,
  'A cannot delete B period day');
select throws_ok(
  $$ insert into public.period_days (user_id, day) values ('00000000-0000-0000-0000-00000000bbbb', '2026-10-03') $$,
  '42501', null, 'A cannot add a period day for B');
select lives_ok(
  $$ insert into public.period_days (user_id, day) values ('00000000-0000-0000-0000-00000000aaaa', '2026-10-02') $$,
  'A can add own period day');
select lives_ok(
  $$ insert into public.period_days (user_id, day) values ('00000000-0000-0000-0000-00000000aaaa', '2026-10-02')
     on conflict (user_id, day) do nothing $$,
  'saving the same day again is a no-op');

-- cycle settings
select lives_ok(
  $$ update public.user_settings set cycle_enabled = true, cycle_length = 30, period_length = 4,
       period_reminder_days = 3, period_reminder_time = '20:35' $$,
  'A can change own cycle settings');
select throws_ok(
  $$ update public.user_settings set cycle_length = 20 $$, '23514', null, 'cycle length must be 21-45');
select throws_ok(
  $$ update public.user_settings set period_length = 11 $$, '23514', null, 'period length must be 2-10');
select throws_ok(
  $$ update public.user_settings set period_reminder_days = 8 $$, '23514', null, 'reminder days must be 1-7');
select throws_ok(
  $$ update public.user_settings set period_reminder_time = '09:03' $$, '23514', null, 'reminder time is on a 5-minute step');

-- bug_reports, developer_emails
select throws_ok($$ select * from public.bug_reports $$, '42501', null, 'A cannot read bug reports');
select throws_ok($$ select * from public.developer_emails $$, '42501', null, 'A cannot read developer emails');
select lives_ok(
  $$ insert into public.bug_reports (user_id, body, images, app_version)
     values ('00000000-0000-0000-0000-00000000aaaa', 'The app froze on save', '{00000000-0000-0000-0000-00000000aaaa/r1/1.jpg}', '5.0.0') $$,
  'A can send a report');
select throws_ok(
  $$ insert into public.bug_reports (user_id, body) values ('00000000-0000-0000-0000-00000000bbbb', 'Pretending to be B') $$,
  '42501', null, 'A cannot send a report as B');
select throws_ok(
  $$ insert into public.bug_reports (user_id, body) values ('00000000-0000-0000-0000-00000000aaaa', 'too short') $$,
  '23514', null, 'report body must be at least 10 chars');
select lives_ok(
  $$ insert into public.bug_reports (user_id, body)
     select '00000000-0000-0000-0000-00000000aaaa', 'Report number ' || n from generate_series(2, 5) n $$,
  'A can send 5 reports in 24 hours');
select throws_ok(
  $$ insert into public.bug_reports (user_id, body) values ('00000000-0000-0000-0000-00000000aaaa', 'Report number 6') $$,
  'P0001', 'rate_limited', 'the 6th report in 24 hours is blocked');

-- bug-reports bucket
select results_eq(
  $$ select count(*)::int from storage.objects where bucket_id = 'bug-reports' $$,
  array[0], 'A cannot read any report image, even own');
select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('bug-reports', '00000000-0000-0000-0000-00000000aaaa/r3/1.jpg') $$,
  'A can upload into own folder');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('bug-reports', '00000000-0000-0000-0000-00000000bbbb/r3/1.jpg') $$,
  '42501', null, 'A cannot upload into B folder');
-- No delete test: storage blocks direct SQL deletes; with no delete policy the Storage API refuses too.
reset role;

-- Value checks (as owner, bypassing RLS) -----------------------------------------------------
select throws_ok(
  $$ update public.todos set subtasks = (
       select jsonb_agg(jsonb_build_object('id', gen_random_uuid(), 'text', 'x')) from generate_series(1, 51))
     where id = '00000000-0000-0000-0000-800000000001' $$,
  '23514', null, 'at most 50 subtasks');
select throws_ok(
  $$ update public.todos set subtasks = jsonb_build_array(jsonb_build_object('id', gen_random_uuid(), 'text', repeat('x', 201)))
     where id = '00000000-0000-0000-0000-800000000001' $$,
  '23514', null, 'subtask text is at most 200 chars');
select throws_ok(
  $$ update public.todos set subtasks = '[{"id": "not-a-uuid", "text": "x"}]'
     where id = '00000000-0000-0000-0000-800000000001' $$,
  '23514', null, 'subtask id must be a uuid');

select * from finish();
rollback;
