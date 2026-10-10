import { describe, expect, it } from '@jest/globals';

import { computeSpan, toEvent, toEventColumns, type EventInput, type EventTableRow } from '@/features/events/event';

const baseInput: EventInput = {
  title: 'Chạy bộ',
  note: '',
  color: 'mint',
  allDay: true,
  startsAt: null,
  endsAt: null,
  startDate: '2026-10-06',
  endDate: '2026-10-08',
  repeat: 'none',
  repeatInterval: 1,
  repeatUntil: null,
  lunarMonth: null,
  lunarDay: null,
  reminderMinutes: [15],
};

describe('computeSpan', () => {
  it('a one-off multi-day event spans exactly its own dates', () => {
    expect(computeSpan(baseInput)).toEqual({ span_start: '2026-10-06', span_end: '2026-10-08' });
  });

  it('a never-ending repeat spans to infinity', () => {
    const input = { ...baseInput, repeat: 'weekly' as const, repeatUntil: null };
    expect(computeSpan(input)).toEqual({ span_start: '2026-10-06', span_end: 'infinity' });
  });

  it('a bounded repeat spans to the last occurrence, keeping its length', () => {
    const input = { ...baseInput, repeat: 'weekly' as const, repeatUntil: '2026-10-27' };
    expect(computeSpan(input)).toEqual({ span_start: '2026-10-06', span_end: '2026-10-29' });
  });
});

describe('toEvent / toEventColumns', () => {
  it('round-trips through DB column names', () => {
    const columns = toEventColumns(baseInput);
    expect(columns).toMatchObject({ title: 'Chạy bộ', all_day: true, start_date: '2026-10-06', span_start: '2026-10-06' });

    const row: EventTableRow = {
      id: 'e1',
      updated_at: '2026-10-01T00:00:00Z',
      title: columns.title,
      note: columns.note,
      color: columns.color,
      all_day: columns.all_day,
      starts_at: columns.starts_at,
      ends_at: columns.ends_at,
      start_date: columns.start_date,
      end_date: columns.end_date,
      repeat: columns.repeat,
      repeat_interval: columns.repeat_interval,
      repeat_until: columns.repeat_until,
      lunar_month: columns.lunar_month,
      lunar_day: columns.lunar_day,
      reminder_minutes: columns.reminder_minutes,
    };
    expect(toEvent(row)).toEqual({ ...baseInput, id: 'e1', updatedAt: '2026-10-01T00:00:00Z' });
  });

  it('maps an empty note to null and back to an empty string', () => {
    expect(toEventColumns(baseInput).note).toBeNull();
    expect(toEvent({ ...toEventColumns(baseInput), id: 'e1', updated_at: 'x' } as EventTableRow).note).toBe('');
  });
});
