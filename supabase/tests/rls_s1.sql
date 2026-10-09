-- Sprint 1 RLS test: user A cannot read/update user B data or avatar.
-- Run: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

-- 2 fake users -> trigger creates profiles + user_settings
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.dev', '{"full_name": "User A", "avatar_url": "https://example.com/a.png"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.dev', '{"name": "User B"}');

select is((select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'User A', 'trigger: takes full_name from Google');
select is((select avatar_url from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'https://example.com/a.png', 'trigger: takes avatar_url from Google');
select is((select language from public.user_settings where user_id = '00000000-0000-0000-0000-00000000000b'), 'en', 'trigger: user_settings defaults to language = en');

-- Act as user A
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}';

select results_eq('select count(*)::int from public.profiles', array[1], 'A sees only 1 profile (own)');
select results_eq('select count(*)::int from public.user_settings', array[1], 'A sees only 1 user_settings (own)');

select is_empty(
  $$ update public.profiles set display_name = 'hack' where id = '00000000-0000-0000-0000-00000000000b' returning id $$,
  'A cannot update B profile');
select is_empty(
  $$ update public.user_settings set language = 'vi' where user_id = '00000000-0000-0000-0000-00000000000b' returning user_id $$,
  'A cannot update B user_settings');

select lives_ok(
  $$ update public.profiles set display_name = 'An', avatar_url = 'x' where id = '00000000-0000-0000-0000-00000000000a' $$,
  'A can update own name + avatar');
select throws_ok(
  $$ update public.profiles set email = 'x@x.dev' where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501', null, 'A cannot update email');
select throws_ok(
  $$ update public.profiles set display_name = repeat('a', 51) where id = '00000000-0000-0000-0000-00000000000a' $$,
  '23514', null, 'Name > 50 characters is rejected');
select throws_ok(
  $$ update public.user_settings set language = 'fr' where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  '23514', null, 'language accepts only en/vi');
select throws_ok(
  $$ insert into public.profiles (id, display_name, email) values (gen_random_uuid(), 'x', 'x') $$,
  '42501', null, 'App cannot insert profile');

select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-0000-0000-00000000000a/avatar.jpg') $$,
  'A can write avatar to own folder');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-0000-0000-00000000000b/avatar.jpg') $$,
  '42501', null, 'A cannot write avatar to B folder');

select * from finish();
rollback;
