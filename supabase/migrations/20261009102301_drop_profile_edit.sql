-- Profile editing removed: name + avatar always come from Google (saves Storage). Spec: docs/specs/sprint-1/F2-dang-nhap-google.md

drop policy "profiles: update own" on public.profiles;
revoke update on public.profiles from authenticated;

drop policy "avatars: select own" on storage.objects;
drop policy "avatars: insert own" on storage.objects;
drop policy "avatars: update own" on storage.objects;
drop policy "avatars: delete own" on storage.objects;

-- Reset edited names/avatars to the Google values (same rules as handle_new_user).
update public.profiles p
set
  display_name = left(coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'User'
  ), 50),
  avatar_url = coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
where u.id = p.id;

-- Bucket `avatars` and its files are removed through the Storage API (SQL deletes on storage tables are blocked).
