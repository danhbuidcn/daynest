-- Load-test seed (LOCAL ONLY): 10,000 fake users, each with 1 signed-in device, 50 events
-- (10 repeating, 2 exceptions), 3 note categories, 20 notes and (S4) 3 built-in + 2 own expense
-- categories with 730 expenses, (S6) 5 recurring expenses + budgets, (S5) 60 todos (10 repeating daily, 5 subtasks each), 300 status
-- exceptions and 60 period days (12 periods).
-- Spec: docs/specs/sprint-2/design/db.md, docs/specs/sprint-4/design/db.md, docs/specs/sprint-5/design/db.md
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

-- S4: the 3 built-in expense categories come from the auth.users trigger; add 2 of the user's own.
insert into public.expense_categories (user_id, name, icon, color)
select pg_temp.uid('00000000', n), c, 'coffee', '#C2582F'
from generate_series(1, 10000) n
cross join unnest(array['Cà phê', 'Con nhỏ']) c;

-- 730 expenses: 2 a day through 2026, spread over the 5 categories.
insert into public.expenses (user_id, category_id, amount, spent_on, note)
select x.u, cats.ids[1 + (d + k) % 5], 10000 + ((d * 7 + k * 13) % 50) * 5000, date '2026-01-01' + d,
       case when k = 0 then 'Load ' || d else '' end
from generate_series(1, 10000) n
cross join lateral (select pg_temp.uid('00000000', n) as u) x
cross join lateral (select array_agg(id order by created_at, id) as ids from public.expense_categories where user_id = x.u) cats
cross join generate_series(0, 364) d
cross join generate_series(0, 1) k;

-- S6: 5 recurring expenses per user (3 monthly on days 5, 15, 31; 2 weekly on Mon, Fri), each with a
-- few periods due before 2026-10-15, plus a general budget and 2 own-month budgets.
insert into public.expense_recurrences (user_id, category_id, amount, note, frequency, anchor_day, next_on)
select x.u, cats.ids[1 + i % 3], 100000 * i, 'Repeat ' || i, r.f, r.a, r.d
from generate_series(1, 10000) n
cross join lateral (select pg_temp.uid('00000000', n) as u) x
cross join lateral (select array_agg(id order by created_at, id) as ids from public.expense_categories where user_id = x.u) cats
cross join (values (1, 'monthly', 5, date '2026-08-05'), (2, 'monthly', 15, date '2026-09-15'), (3, 'monthly', 31, date '2026-08-31'),
                   (4, 'weekly', 1, date '2026-10-05'), (5, 'weekly', 5, date '2026-10-09')) as r(i, f, a, d);

update public.user_settings set monthly_budget = 15000000 where user_id in (select id from auth.users where email like 'load%@test.dev');

insert into public.expense_month_budgets (user_id, month, amount)
select pg_temp.uid('00000000', n), m, 20000000
from generate_series(1, 10000) n
cross join unnest(array[date '2026-10-01', date '2026-09-01']) m;

-- S5: 50 one-off timed todos spread over 2026 (every 7 days, 1 h, the first half done) and
-- 10 all-day todos repeating daily (never ending). Subtask ids: md5 is valid uuid hex.
insert into public.todos (user_id, title, color, all_day, starts_at, ends_at, start_date, end_date, repeat,
                          span_start, span_end, subtasks, done)
select x.u, 'Todo ' || i, 'mint', r, case when not r then t end, case when not r then t + interval '1 hour' end,
       case when r then d end, case when r then d end, case when r then 'daily' else 'none' end,
       case when r then d else (t at time zone 'Asia/Ho_Chi_Minh')::date end,
       case when r then 'infinity' else (t at time zone 'Asia/Ho_Chi_Minh')::date end,
       st.subtasks, not r and i <= 25
from generate_series(1, 10000) n
cross join lateral (select pg_temp.uid('00000000', n) as u) x
cross join generate_series(1, 60) i
cross join lateral (select i > 50 as r, date '2026-01-01' + (i - 50) as d,
                           timestamptz '2026-01-01 08:00+07' + (i * 7 + n % 7) * interval '1 day' as t) y
cross join lateral (
  select jsonb_agg(jsonb_build_object('id', md5(n || '-' || i || '-' || k)::uuid, 'text', 'Step ' || k) order by k) subtasks
  from generate_series(1, 5) k
) st;

-- 30 days ticked on each repeating todo: 300 'status' exceptions per user.
insert into public.todo_exceptions (user_id, todo_id, occurrence_date, kind, done, done_subtasks)
select t.user_id, t.id, date '2026-09-01' + k, 'status', true, array[(t.subtasks -> 0 ->> 'id')::uuid]
from public.todos t
cross join generate_series(0, 29) k
where t.repeat = 'daily';

-- 12 periods of 5 days, every 28 days from 2025-11-01: all inside the app's 12-month window.
insert into public.period_days (user_id, day)
select pg_temp.uid('00000000', n), date '2025-11-01' + p * 28 + k
from generate_series(1, 10000) n
cross join generate_series(0, 11) p
cross join generate_series(0, 4) k;

analyze public.events, public.event_exceptions, public.note_categories, public.notes, public.user_devices,
        public.expense_categories, public.expenses, public.todos, public.todo_exceptions, public.period_days,
        public.expense_recurrences, public.expense_month_budgets;

select (select count(*) from auth.users) users, (select count(*) from public.events) events,
       (select count(*) from public.event_exceptions) exceptions, (select count(*) from public.notes) notes,
       (select count(*) from public.expense_categories) expense_categories, (select count(*) from public.expenses) expenses,
       (select count(*) from public.todos) todos, (select count(*) from public.todo_exceptions) todo_exceptions,
       (select count(*) from public.period_days) period_days,
       (select count(*) from public.expense_recurrences) recurrences, (select count(*) from public.expense_month_budgets) month_budgets;

-- Size per user (S4, S5 spec: § Kiểm tra tải → Spec tổng §3).
select relname, pg_size_pretty(pg_total_relation_size(c.oid)) total,
       round(pg_total_relation_size(c.oid) / 10000.0 / 1024, 1) kb_per_user
from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
where ns.nspname = 'public' and c.relkind = 'r'
order by pg_total_relation_size(c.oid) desc;
select pg_size_pretty(pg_database_size(current_database())) database_size;
