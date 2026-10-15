import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { ConflictError, createEvent, ForbiddenError, updateEvent, upsertException } from '@/features/events/api';
import type { EventInput } from '@/features/events/event';

// Chainable stand-in for the supabase-js query builder: every call returns itself, and awaiting
// it resolves to whatever the test queued in `result`.
let result: { data: unknown; error: unknown } = { data: null, error: null };
const calls: string[] = [];
const builder: Record<string, unknown> = {};
for (const m of ['from', 'select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'is', 'lte', 'gte', 'single']) {
  builder[m] = (...args: unknown[]) => {
    calls.push(`${m}(${args.map((a) => JSON.stringify(a)).join(',')})`);
    return builder;
  };
}
builder.then = (resolve: (v: unknown) => unknown) => resolve(result);

jest.mock('@/lib/supabase', () => ({ supabase: { from: (t: string) => (builder.from as (t: string) => unknown)(t) } }));

const input: EventInput = {
  title: 'Họp',
  note: '',
  color: 'mint',
  allDay: true,
  startsAt: null,
  endsAt: null,
  startDate: '2026-10-10',
  endDate: '2026-10-10',
  repeat: 'none',
  repeatInterval: 1,
  repeatUntil: null,
  lunarMonth: null,
  lunarDay: null,
  reminderMinutes: [],
};

beforeEach(() => {
  calls.length = 0;
  result = { data: null, error: null };
});

describe('updateEvent (optimistic lock)', () => {
  it('filters on the updated_at it read', async () => {
    result = { data: [{ id: 'e1', updated_at: 'new', ...input, all_day: true, start_date: '2026-10-10', end_date: '2026-10-10' }], error: null };
    await updateEvent('e1', '2026-10-10T01:00:00.123456+00:00', input);
    expect(calls).toContain('eq("updated_at","2026-10-10T01:00:00.123456+00:00")');
  });

  it('throws ConflictError when another device saved first (0 rows)', async () => {
    result = { data: [], error: null };
    await expect(updateEvent('e1', 'old', input)).rejects.toBeInstanceOf(ConflictError);
  });

  it('maps an RLS rejection (42501) to ForbiddenError', async () => {
    result = { data: null, error: { code: '42501', message: 'new row violates row-level security policy' } };
    await expect(updateEvent('e1', 'old', input)).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe('createEvent', () => {
  it('upserts on the id from the form, so a retry writes the same row', async () => {
    result = { data: { id: 'form-id', updated_at: 'new', ...input, all_day: true, start_date: '2026-10-10', end_date: '2026-10-10' }, error: null };
    await createEvent('form-id', input);
    await createEvent('form-id', input);
    const upserts = calls.filter((c) => c.startsWith('upsert('));
    expect(upserts).toHaveLength(2);
    for (const c of upserts) expect(c.includes('"id":"form-id"') && c.includes('"onConflict":"id"')).toBe(true);
    expect(calls.some((c) => c.startsWith('insert('))).toBe(false);
  });
});

describe('upsertException', () => {
  it('upserts on (event_id, occurrence_date) so a retry does not duplicate', async () => {
    result = { data: { id: 'x1', event_id: 'e1', occurrence_date: '2026-10-13', kind: 'skip' }, error: null };
    await upsertException('e1', '2026-10-13', 'skip');
    expect(calls.some((c) => c.startsWith('upsert(') && c.includes('"onConflict":"event_id,occurrence_date"'))).toBe(true);
  });
});
