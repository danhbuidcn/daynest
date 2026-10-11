-- Load-test seed (LOCAL ONLY): 10,000 fake users, each with 1 signed-in device, 50 events
-- (10 repeating, 2 exceptions), 3 note categories and 20 notes. Spec: docs/specs/sprint-2/design/db.md
-- User n: id = 00000000-0000-0000-0000-<n as 12 hex>, session_id = 10000000-…-<n>.
\set ON_ERROR_STOP on
set client_min_messages = warning;

create or replace function pg_temp.uid(prefix text, n int) returns uuid
language sql immutable as $$ select (prefix || '-0000-0000-0000-' || lpad(to_hex(n), 12, '0'))::uuid $$;

-- auth.users -> trigger creates profiles + user_settings
insert into auth.users (id, email, raw_user_meta_data)
select pg_temp.uid('00000000', n), 'load' || n || '@test.dev', jsonb_build_object('full_name', 'Load ' || n)
from generate_series(1, 10000) n;

insert into public.user_devices (user_id, device_id, device_name, session_id)
select pg_temp.uid('00000000', n), pg_temp.uid('20000000', n), 'Load device', pg_temp.uid('10000000', n)
from generate_series(1, 10000) n;

-- 40 one-off timed events spread over 2026 (every ~9 days, 1 h long)
insert into public.events (user_id, title, color, all_day, starts_at, ends_at, span_start, span_end)
select u, 'Event ' || i, 'mint', false, t, t + interval '1 hour',
       (t at time zone 'Asia/Ho_Chi_Minh')::date, (t at time zone 'Asia/Ho_Chi_Minh')::date
from generate_series(1, 10000) n
cross join lateral (select pg_temp.uid('00000000', n) as u) x
cross join generate_series(1, 40) i
cross join lateral (select timestamptz '2026-01-01 09:00+07' + (i * 9 + n % 9) * interval '1 day' as t) y;

-- 10 repeating events: daily, weekly ×3, monthly ×2, yearly ×2, lunar_yearly ×2 (never ending)
insert into public.events (user_id, title, color, all_day, start_date, end_date, repeat, lunar_month, lunar_day, span_start, span_end)
select pg_temp.uid('00000000', n), 'Repeat ' || i, 'sky', true, d, d,
       (array['daily', 'weekly', 'weekly', 'weekly', 'monthly', 'monthly', 'yearly', 'yearly', 'lunar_yearly', 'lunar_yearly'])[i],
       case when i >= 9 then i - 6 end, case when i >= 9 then 10 end,
       d, 'infinity'
from generate_series(1, 10000) n
cross join generate_series(1, 10) i
cross join lateral (select date '2025-06-01' + (i * 17 + n % 30) as d) y;

-- 2 exceptions per user on the weekly repeat: one skip, one override
insert into public.event_exceptions (user_id, event_id, occurrence_date, kind, title)
select e.user_id, e.id, e.start_date + 7 * k, case k when 1 then 'skip' else 'override' end,
       case k when 2 then 'Moved' end
from public.events e
cross join generate_series(1, 2) k
where e.title = 'Repeat 2';

insert into public.note_categories (user_id, name, color)
select pg_temp.uid('00000000', n), c, 'lavender'
from generate_series(1, 10000) n
cross join unnest(array['Work', 'Home', 'Ideas']) c;

-- 20 notes: 2 pinned, half filed under a category, body text to search
insert into public.notes (user_id, category_id, title, body, search_text, pinned, updated_at)
select x.u, case when i % 2 = 0 then c.id end, 'Ghi chú ' || i, b, lower('ghi chu ' || i || E'\n' || b), i <= 2,
       now() - i * interval '1 hour'
from generate_series(1, 10000) n
cross join lateral (select pg_temp.uid('00000000', n) as u) x
cross join generate_series(1, 20) i
cross join lateral (select 'Shopping list milk eggs bread item ' || i || ' for week ' || (i % 4) as b) y
left join lateral (
  select id from public.note_categories where user_id = x.u order by name limit 1
) c on true;

analyze public.events, public.event_exceptions, public.note_categories, public.notes, public.user_devices;

select (select count(*) from auth.users) users, (select count(*) from public.events) events,
       (select count(*) from public.event_exceptions) exceptions, (select count(*) from public.notes) notes;
