-- Sprint 1: profiles, user_settings, bucket avatars. Spec: docs/specs/sprint-1/design/db.md

-- updated_at tự cập nhật
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 50),
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
for select to authenticated using (id = (select auth.uid()));

create policy "profiles: update own" on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- App chỉ được sửa tên + ảnh; không insert/delete (trigger tạo, xoá theo auth.users).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

-- user_settings ------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  week_start smallint not null default 1 check (week_start in (0, 1)),
  use_24h boolean not null default true,
  language text not null default 'en' check (language in ('en', 'vi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

alter table public.user_settings enable row level security;

create policy "user_settings: select own" on public.user_settings
for select to authenticated using (user_id = (select auth.uid()));

create policy "user_settings: update own" on public.user_settings
for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on public.user_settings from anon, authenticated;
grant select on public.user_settings to authenticated;
grant update (week_start, use_24h, language) on public.user_settings to authenticated;

-- User mới → tạo profiles + user_settings. Chỉ chạy lúc tạo user, nên đăng nhập lại không ghi đè tên/ảnh đã sửa.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  name text := coalesce(
    nullif(trim(meta ->> 'full_name'), ''),
    nullif(trim(meta ->> 'name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'User'
  );
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    left(coalesce(nullif(name, ''), 'User'), 50),
    coalesce(new.email, ''),
    coalesce(meta ->> 'avatar_url', meta ->> 'picture')
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Storage: avatars/{user_id}/avatar.jpg ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

-- Đọc: bucket public (URL công khai). Ghi/xoá: chỉ trong folder của mình.
-- select own cần cho upsert (ghi đè ảnh cũ).
create policy "avatars: select own" on storage.objects
for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: insert own" on storage.objects
for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: update own" on storage.objects
for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "avatars: delete own" on storage.objects
for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
