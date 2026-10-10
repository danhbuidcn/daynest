-- Sprint 2 RLS test: device limit (register_device kicks the earliest session, a kicked
-- session is cut off from every table) + 2 fake users cannot read/write each other's rows.
-- Run: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(31);

-- 2 fake users -> trigger creates profiles + user_settings
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000aaaa', 'a@test.dev', '{"full_name": "User A"}'),
  ('00000000-0000-0000-0000-00000000bbbb', 'b@test.dev', '{"full_name": "User B"}');

-- device 1: first sign-in, no eviction -------------------------------------------------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';
select is_empty(
  $$ select * from public.register_device('00000000-0000-0000-0000-200000000001', 'Device 1') $$,
  'device 1: first sign-in kicks nobody');
reset role;
update public.user_devices set signed_in_at = now() - interval '2 minutes'
  where session_id = '00000000-0000-0000-0000-100000000001';

-- device 2: second sign-in, still <= 2 devices, no eviction -----------------------------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000002", "role": "authenticated"}';
select is_empty(
  $$ select * from public.register_device('00000000-0000-0000-0000-200000000002', 'Device 2') $$,
  'device 2: second sign-in kicks nobody');
reset role;
update public.user_devices set signed_in_at = now() - interval '1 minute'
  where session_id = '00000000-0000-0000-0000-100000000002';

-- device 3: third sign-in -> device 1 (earliest) is kicked -------------------------------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000003", "role": "authenticated"}';
select results_eq(
  $$ select kicked_name from public.register_device('00000000-0000-0000-0000-200000000003', 'Device 3') $$,
  array['Device 1'], 'device 3: kicks device 1 (earliest signed_in_at)');
reset role;

select results_eq(
  $$ select count(*)::int from public.user_devices where user_id = '00000000-0000-0000-0000-00000000aaaa' $$,
  array[2], 'A has exactly 2 devices after the 3rd sign-in');

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000001", "role": "authenticated"}';
select is(public.session_active(), false, 'kicked device 1 session is no longer active');
select is((select count(*)::int from public.profiles), 0, 'kicked session cannot see its own profile');
select is((select count(*)::int from public.user_settings), 0, 'kicked session cannot see its own user_settings');
select throws_ok(
  $$ insert into public.notes (user_id, title) values ('00000000-0000-0000-0000-00000000aaaa', 'x') $$,
  '42501', null, 'kicked session cannot insert a note');
reset role;

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000002", "role": "authenticated"}';
select is(public.session_active(), true, 'device 2 session is still active');
select is((select count(*)::int from public.profiles), 1, 'device 2 can see its own profile');
reset role;

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000003", "role": "authenticated"}';
select is(public.session_active(), true, 'device 3 session is active');
reset role;

-- Sign in again on device 2 (new session_id, same device_id) -> replaces the row, kicks nobody
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000004", "role": "authenticated"}';
select is_empty(
  $$ select * from public.register_device('00000000-0000-0000-0000-200000000002', 'Device 2') $$,
  'signing in again on device 2 kicks nobody');
reset role;

select results_eq(
  $$ select count(*)::int from public.user_devices where user_id = '00000000-0000-0000-0000-00000000aaaa' $$,
  array[2], 'A still has exactly 2 devices after re-signing in on device 2');

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000002", "role": "authenticated"}';
select is(public.session_active(), false, 'device 2 old session is replaced, no longer active');
reset role;
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000004", "role": "authenticated"}';
select is(public.session_active(), true, 'device 2 new session is active');
reset role;
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000003", "role": "authenticated"}';
select is(public.session_active(), true, 'device 3 session is unaffected by device 2 re-sign-in');
reset role;

-- Register a device for B too, then seed one row per S2 table for A and B -----------------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000bbbb", "session_id": "00000000-0000-0000-0000-100000000005", "role": "authenticated"}';
select is_empty(
  $$ select * from public.register_device('00000000-0000-0000-0000-200000000004', 'Device B') $$,
  'B: first sign-in kicks nobody');
reset role;

insert into public.events (id, user_id, title, color, all_day, start_date, end_date, span_start, span_end) values
  ('00000000-0000-0000-0000-300000000001', '00000000-0000-0000-0000-00000000aaaa', 'A event', 'mint', true, '2026-10-10', '2026-10-10', '2026-10-10', '2026-10-10'),
  ('00000000-0000-0000-0000-300000000002', '00000000-0000-0000-0000-00000000bbbb', 'B event', 'mint', true, '2026-10-10', '2026-10-10', '2026-10-10', '2026-10-10');
insert into public.note_categories (id, user_id, name, color) values
  ('00000000-0000-0000-0000-400000000001', '00000000-0000-0000-0000-00000000aaaa', 'A category', 'sky'),
  ('00000000-0000-0000-0000-400000000002', '00000000-0000-0000-0000-00000000bbbb', 'B category', 'sky');
insert into public.notes (id, user_id, category_id, title) values
  ('00000000-0000-0000-0000-500000000001', '00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-400000000001', 'A note'),
  ('00000000-0000-0000-0000-500000000002', '00000000-0000-0000-0000-00000000bbbb', '00000000-0000-0000-0000-400000000002', 'B note');
insert into public.google_sync_state (user_id) values
  ('00000000-0000-0000-0000-00000000aaaa'), ('00000000-0000-0000-0000-00000000bbbb');

-- Act as A (device 3, active session) ----------------------------------------------------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000003", "role": "authenticated"}';

select results_eq($$ select count(*)::int from public.events $$, array[1], 'A sees only 1 event (own)');
select results_eq($$ select count(*)::int from public.note_categories $$, array[1], 'A sees only 1 note category (own)');
select results_eq($$ select count(*)::int from public.notes $$, array[1], 'A sees only 1 note (own)');
select results_eq($$ select count(*)::int from public.google_sync_state $$, array[1], 'A sees only 1 google_sync_state row (own)');

select is_empty(
  $$ update public.events set title = 'hack' where id = '00000000-0000-0000-0000-300000000002' returning id $$,
  'A cannot update B event');
select is_empty(
  $$ delete from public.notes where id = '00000000-0000-0000-0000-500000000002' returning id $$,
  'A cannot delete B note');
select is_empty(
  $$ update public.google_sync_state set enabled = true where user_id = '00000000-0000-0000-0000-00000000bbbb' returning user_id $$,
  'A cannot update B google_sync_state');
select throws_ok(
  $$ insert into public.notes (user_id, category_id, title) values ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-400000000002', 'x') $$,
  '42501', null, 'A cannot file a note under B category');
select throws_ok(
  $$ insert into public.event_exceptions (user_id, event_id, occurrence_date, kind) values ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-300000000002', current_date, 'skip') $$,
  '42501', null, 'A cannot attach an exception to B event');

-- delete_note_categories(B's id) must do nothing for A (RLS still applies inside the function)
select public.delete_note_categories(array['00000000-0000-0000-0000-400000000002']::uuid[]);
reset role;

select is(
  (select deleted_at is null from public.notes where id = '00000000-0000-0000-0000-500000000002'),
  true, 'B note is untouched by A''s delete_note_categories call');
select ok(
  (select count(*) = 1 from public.note_categories where id = '00000000-0000-0000-0000-400000000002'),
  'B category still exists after A''s delete_note_categories call');

-- A can delete its own category through the function, which trashes its own note ----------
set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-0000-0000-00000000aaaa", "session_id": "00000000-0000-0000-0000-100000000003", "role": "authenticated"}';
select public.delete_note_categories(array['00000000-0000-0000-0000-400000000001']::uuid[]);
reset role;

select is(
  (select deleted_at is not null from public.notes where id = '00000000-0000-0000-0000-500000000001'),
  true, 'deleting own category trashes its own note');
select ok(
  (select count(*) = 0 from public.note_categories where id = '00000000-0000-0000-0000-400000000001'),
  'own category is actually deleted');

-- time_zone must be a real IANA name -----------------------------------------------------
select throws_ok(
  $$ update public.user_settings set time_zone = 'Nowhere/Fake' where user_id = '00000000-0000-0000-0000-00000000aaaa' $$,
  'P0001', null, 'time_zone rejects a name not in pg_timezone_names');

select * from finish();
rollback;
