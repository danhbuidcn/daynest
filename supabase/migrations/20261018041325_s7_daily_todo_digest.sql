-- user_settings: daily todo digest (morning "you have N todos", evening "you finished N") ----
alter table public.user_settings
  add column daily_morning boolean not null default false,
  add column daily_morning_time time not null default '08:00'
    check (extract(second from daily_morning_time) = 0 and extract(minute from daily_morning_time)::int % 5 = 0),
  add column daily_evening boolean not null default false,
  add column daily_evening_time time not null default '21:00'
    check (extract(second from daily_evening_time) = 0 and extract(minute from daily_evening_time)::int % 5 = 0);

grant update (daily_morning, daily_morning_time, daily_evening, daily_evening_time)
  on public.user_settings to authenticated;
