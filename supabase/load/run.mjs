// Load test (LOCAL ONLY): VUS virtual users for DURATION_S seconds against PostgREST, each loop
// = month read (events + exceptions) → create event → edit it → first notes page → note search
// → (S4) month of expenses → 6-month totals → create expense → edit it.
// Requests mirror app/src/features/{events,notes,expenses}/api.ts.
// Env: API_URL, ANON_KEY, JWT_SECRET (from `supabase status -o env`), VUS=100, DURATION_S=300.
// Pass: 0 errors and overall p95 < 1000 ms (docs/specs/sprint-2/design/db.md § Kiểm tra tải).
import { createHmac, randomUUID } from 'node:crypto';

const { API_URL, ANON_KEY, JWT_SECRET } = process.env;
if (!API_URL || !ANON_KEY || !JWT_SECRET) throw new Error('Missing API_URL / ANON_KEY / JWT_SECRET');
const VUS = Number(process.env.VUS ?? 100);
const DURATION_S = Number(process.env.DURATION_S ?? 300);
const USERS = 10000;
const REST = `${API_URL}/rest/v1`;

const EVENT_COLUMNS =
  'id,title,note,color,all_day,starts_at,ends_at,start_date,end_date,repeat,repeat_interval,repeat_until,lunar_month,lunar_day,reminder_minutes,updated_at,google_event_id,google_status,google_readonly';
const EXCEPTION_COLUMNS =
  'id,event_id,occurrence_date,kind,title,note,color,all_day,starts_at,ends_at,start_date,end_date,reminder_minutes';
const NOTE_COLUMNS = 'id,category_id,title,body,checklist,pinned,deleted_at,updated_at';
const EXPENSE_COLUMNS = 'id,category_id,amount,spent_on,note,updated_at';

const b64url = (s) => Buffer.from(s).toString('base64url');
const hex12 = (n) => n.toString(16).padStart(12, '0');

// Same claims as a real Supabase session; session_id must match user_devices or RLS denies.
function tokenFor(n) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(
    JSON.stringify({
      sub: `00000000-0000-0000-0000-${hex12(n)}`,
      session_id: `10000000-0000-0000-0000-${hex12(n)}`,
      role: 'authenticated',
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  );
  const sig = createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

const latencies = {};
const errors = {};
let stop = false;

async function call(op, token, path, { method = 'GET', body, prefer } = {}) {
  const started = performance.now();
  try {
    const res = await fetch(`${REST}/${path}`, {
      method,
      headers: {
        apikey: ANON_KEY,
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        ...(prefer ? { prefer } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 200)}`);
    return text ? JSON.parse(text) : null;
  } catch (e) {
    (errors[op] ??= []).push(String(e.message ?? e));
    return null;
  } finally {
    (latencies[op] ??= []).push(performance.now() - started);
  }
}

async function iteration() {
  const n = 1 + Math.floor(Math.random() * USERS);
  const token = tokenFor(n);

  // Month grid of Oct 2026, week starting Monday: 2026-09-28 … 2026-11-08
  const events = await call(
    'month events',
    token,
    `events?select=${EVENT_COLUMNS}&deleted_at=is.null&span_start=lte.2026-11-08&span_end=gte.2026-09-28`,
  );
  if (events?.length) {
    await call('month exceptions', token, `event_exceptions?select=${EXCEPTION_COLUMNS}&event_id=in.(${events.map((e) => e.id).join(',')})`);
  } else if (events) {
    (errors['month events'] ??= []).push('empty month');
  }

  const day = 1 + Math.floor(Math.random() * 28);
  const startsAt = `2026-10-${String(day).padStart(2, '0')}T10:00:00+07:00`;
  const created = await call('create event', token, 'events?select=*', {
    method: 'POST',
    prefer: 'return=representation',
    body: {
      id: randomUUID(),
      title: 'Load test',
      color: 'peach',
      all_day: false,
      starts_at: startsAt,
      ends_at: `2026-10-${String(day).padStart(2, '0')}T11:00:00+07:00`,
      reminder_minutes: [15],
      span_start: `2026-10-${String(day).padStart(2, '0')}`,
      span_end: `2026-10-${String(day).padStart(2, '0')}`,
    },
  });
  if (created?.[0]) {
    const row = created[0];
    const updated = await call(
      'edit event',
      token,
      `events?id=eq.${row.id}&updated_at=eq.${encodeURIComponent(row.updated_at)}&select=*`,
      { method: 'PATCH', prefer: 'return=representation', body: { title: 'Load test (edited)' } },
    );
    if (updated && updated.length !== 1) (errors['edit event'] ??= []).push('optimistic lock matched 0 rows');
  }

  const order = 'order=pinned.desc,updated_at.desc,id.desc&limit=30';
  const page = await call('notes page', token, `notes?select=${NOTE_COLUMNS}&deleted_at=is.null&${order}`);
  if (page && page.length !== 20) (errors['notes page'] ??= []).push(`expected 20 notes, got ${page.length}`);
  await call('note search', token, `notes?select=${NOTE_COLUMNS}&deleted_at=is.null&search_text=ilike.${encodeURIComponent('%milk%')}&${order}`);

  const expenses = await call(
    'month expenses',
    token,
    `expenses?select=${EXPENSE_COLUMNS}&spent_on=gte.2026-10-01&spent_on=lte.2026-10-31&order=spent_on.desc,created_at.desc&limit=1000`,
  );
  if (expenses && expenses.length < 62) (errors['month expenses'] ??= []).push(`expected ≥ 62 expenses, got ${expenses.length}`);
  const totals = await call('6-month totals', token, 'rpc/expense_monthly_totals', {
    method: 'POST',
    body: { p_from: '2026-05-01', p_to: '2026-10-31' },
  });
  if (totals && totals.length !== 6) (errors['6-month totals'] ??= []).push(`expected 6 months, got ${totals.length}`);
  if (expenses?.[0]) {
    const id = randomUUID();
    const spentOn = `2026-10-${String(day).padStart(2, '0')}`;
    const created = await call('create expense', token, `expenses?on_conflict=id&select=${EXPENSE_COLUMNS}`, {
      method: 'POST',
      prefer: 'return=representation,resolution=merge-duplicates',
      body: { id, category_id: expenses[0].category_id, amount: 50000, spent_on: spentOn, note: 'Load test' },
    });
    if (created?.[0]) {
      const updated = await call(
        'edit expense',
        token,
        `expenses?id=eq.${id}&updated_at=eq.${encodeURIComponent(created[0].updated_at)}&select=id`,
        { method: 'PATCH', prefer: 'return=representation', body: { amount: 75000 } },
      );
      if (updated && updated.length !== 1) (errors['edit expense'] ??= []).push('optimistic lock matched 0 rows');
    }
  }
}

async function vu() {
  while (!stop) await iteration();
}

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
const fmt = (ms) => `${ms.toFixed(0)} ms`;

setTimeout(() => (stop = true), DURATION_S * 1000);
console.log(`Load test: ${VUS} virtual users × ${DURATION_S} s against ${REST}`);
const t0 = performance.now();
await Promise.all(Array.from({ length: VUS }, vu));
const elapsed = (performance.now() - t0) / 1000;

const all = [];
const rows = Object.entries(latencies).map(([op, list]) => {
  all.push(...list);
  const s = [...list].sort((a, b) => a - b);
  return { op, requests: s.length, errors: errors[op]?.length ?? 0, p50: fmt(pct(s, 50)), p95: fmt(pct(s, 95)), p99: fmt(pct(s, 99)), max: fmt(s[s.length - 1]) };
});
all.sort((a, b) => a - b);
const errorCount = Object.values(errors).reduce((sum, l) => sum + l.length, 0);
rows.push({ op: 'ALL', requests: all.length, errors: errorCount, p50: fmt(pct(all, 50)), p95: fmt(pct(all, 95)), p99: fmt(pct(all, 99)), max: fmt(all[all.length - 1]) });
console.table(rows);
console.log(`Throughput: ${(all.length / elapsed).toFixed(0)} req/s over ${elapsed.toFixed(0)} s`);
for (const [op, list] of Object.entries(errors)) console.log(`${op}: first error → ${list[0]}`);

const pass = errorCount === 0 && pct(all, 95) < 1000;
console.log(pass ? 'PASS: 0 errors, p95 < 1 s' : 'FAIL');
process.exit(pass ? 0 : 1);
