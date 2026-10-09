-- Test RLS Sprint 1: user A không đọc/sửa được dữ liệu và ảnh của user B.
-- Chạy: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

-- 2 user giả → trigger tạo profiles + user_settings
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.dev', '{"full_name": "User A", "avatar_url": "https://example.com/a.png"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.dev', '{"name": "User B"}');

select is((select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'User A', 'trigger: lấy full_name từ Google');
select is((select avatar_url from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'https://example.com/a.png', 'trigger: lấy avatar_url từ Google');
select is((select language from public.user_settings where user_id = '00000000-0000-0000-0000-00000000000b'), 'en', 'trigger: user_settings mặc định language = en');

-- Đóng vai user A
set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}';

select results_eq('select count(*)::int from public.profiles', array[1], 'A chỉ thấy 1 profile (của mình)');
select results_eq('select count(*)::int from public.user_settings', array[1], 'A chỉ thấy 1 user_settings (của mình)');

select is_empty(
  $$ update public.profiles set display_name = 'hack' where id = '00000000-0000-0000-0000-00000000000b' returning id $$,
  'A không sửa được profile của B');
select is_empty(
  $$ update public.user_settings set language = 'vi' where user_id = '00000000-0000-0000-0000-00000000000b' returning user_id $$,
  'A không sửa được user_settings của B');

select lives_ok(
  $$ update public.profiles set display_name = 'An', avatar_url = 'x' where id = '00000000-0000-0000-0000-00000000000a' $$,
  'A sửa được tên + ảnh của mình');
select throws_ok(
  $$ update public.profiles set email = 'x@x.dev' where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501', null, 'A không sửa được email');
select throws_ok(
  $$ update public.profiles set display_name = repeat('a', 51) where id = '00000000-0000-0000-0000-00000000000a' $$,
  '23514', null, 'Tên > 50 ký tự bị chặn');
select throws_ok(
  $$ update public.user_settings set language = 'fr' where user_id = '00000000-0000-0000-0000-00000000000a' $$,
  '23514', null, 'language chỉ nhận en/vi');
select throws_ok(
  $$ insert into public.profiles (id, display_name, email) values (gen_random_uuid(), 'x', 'x') $$,
  '42501', null, 'App không tự insert profile');

select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-0000-0000-00000000000a/avatar.jpg') $$,
  'A ghi được ảnh vào folder của mình');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('avatars', '00000000-0000-0000-0000-00000000000b/avatar.jpg') $$,
  '42501', null, 'A không ghi được ảnh vào folder của B');

select * from finish();
rollback;
