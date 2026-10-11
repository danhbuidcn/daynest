-- Oldest app build allowed to run (Android versionCode). Builds below it show an "update required"
-- screen. Bump min_version_code in the same migration as any change older builds cannot handle.
-- Readable before sign-in (anon) so the check also works on the login screen; never writable from the app.
create table public.app_config (
  id boolean primary key default true check (id),
  min_version_code integer not null,
  update_url text
);

alter table public.app_config enable row level security;

create policy "app_config: read all" on public.app_config
for select to anon, authenticated using (true);

grant select on public.app_config to anon, authenticated;

-- 3 = 1.1.0, the first build that registers its device after sign-in (F7).
insert into public.app_config (min_version_code) values (3);
