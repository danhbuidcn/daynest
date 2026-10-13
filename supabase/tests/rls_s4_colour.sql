-- Sprint 4 (any colour): events, event exceptions and note categories accept a hex colour besides the 6 names;
-- min_version_code is raised to the S4 build. Lives with its migration in supabase/pending/
-- until the S4 release. Run: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000aaaa', 'a@test.dev');

select lives_ok(
  $$ insert into public.events (user_id, title, color, all_day, start_date, end_date, span_start, span_end)
     values ('00000000-0000-0000-0000-00000000aaaa', 'Hex', '#C2582F', true, '2026-10-12', '2026-10-12', '2026-10-12', '2026-10-12') $$,
  'event accepts a hex colour');
select throws_ok(
  $$ insert into public.events (user_id, title, color, all_day, start_date, end_date, span_start, span_end)
     values ('00000000-0000-0000-0000-00000000aaaa', 'Bad', '#c2582f', true, '2026-10-12', '2026-10-12', '2026-10-12', '2026-10-12') $$,
  '23514', null, 'event rejects a lower-case hex');
insert into public.events (id, user_id, title, color, all_day, start_date, end_date, span_start, span_end, repeat)
values ('00000000-0000-0000-0000-e00000000001', '00000000-0000-0000-0000-00000000aaaa', 'Series', 'mint', true, '2026-10-12', '2026-10-12', '2026-10-12', '9999-12-31', 'daily');
select lives_ok(
  $$ insert into public.event_exceptions (user_id, event_id, occurrence_date, kind, color)
     values ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-e00000000001', '2026-10-13', 'override', '#C2582F') $$,
  'event exception accepts a hex colour');
select throws_ok(
  $$ insert into public.event_exceptions (user_id, event_id, occurrence_date, kind, color)
     values ('00000000-0000-0000-0000-00000000aaaa', '00000000-0000-0000-0000-e00000000001', '2026-10-14', 'override', '#abc') $$,
  '23514', null, 'event exception rejects a short hex');
select lives_ok(
  $$ insert into public.note_categories (user_id, name, color) values ('00000000-0000-0000-0000-00000000aaaa', 'Hex', '#2F6FC2') $$,
  'note category accepts a hex colour');
select throws_ok(
  $$ insert into public.note_categories (user_id, name, color) values ('00000000-0000-0000-0000-00000000aaaa', 'Bad', 'blue') $$,
  '23514', null, 'note category rejects an unknown name');
select is((select min_version_code from public.app_config), 6, 'min_version_code is the S4 build');

select * from finish();
rollback;
