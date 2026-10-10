import { describe, expect, it } from '@jest/globals';

import type { EventRow } from '@/features/events/event';
import { occurrencesForEvent, type ExceptionRow } from '@/features/events/occurrences';

const base: EventRow = {
  id: 'e1',
  title: 'Chạy bộ',
  note: '',
  color: 'mint',
  allDay: true,
  startsAt: null,
  endsAt: null,
  startDate: '2026-10-06',
  endDate: '2026-10-06',
  repeat: 'none',
  repeatInterval: 1,
  repeatUntil: null,
  lunarMonth: null,
  lunarDay: null,
  reminderMinutes: [15],
  updatedAt: '2026-10-01T00:00:00Z',
};

const range = { from: { year: 2026, month: 10, day: 1 }, to: { year: 2026, month: 10, day: 31 } };

describe('occurrencesForEvent — all-day, multi-day + repeat', () => {
  it('shifts a multi-day span to each weekly occurrence, keeping its length', () => {
    const event: EventRow = { ...base, startDate: '2026-10-06', endDate: '2026-10-08', repeat: 'weekly', repeatInterval: 1 };
    const occ = occurrencesForEvent(event, [], range);
    expect(occ.map((o) => [o.startDate, o.endDate])).toEqual([
      ['2026-10-06', '2026-10-08'],
      ['2026-10-13', '2026-10-15'],
      ['2026-10-20', '2026-10-22'],
      ['2026-10-27', '2026-10-29'],
    ]);
  });
});

describe('occurrencesForEvent — timed, overnight span + repeat', () => {
  it('keeps the overnight duration on every daily occurrence', () => {
    const event: EventRow = {
      ...base,
      allDay: false,
      startDate: null,
      endDate: null,
      startsAt: '2026-10-06T16:00:00.000Z', // 23:00 Asia/Ho_Chi_Minh
      endsAt: '2026-10-06T18:00:00.000Z', // 01:00 next day Asia/Ho_Chi_Minh
      repeat: 'daily',
      repeatInterval: 1,
    };
    const occ = occurrencesForEvent(event, [], { from: { year: 2026, month: 10, day: 6 }, to: { year: 2026, month: 10, day: 8 } });
    expect(occ).toHaveLength(3);
    for (const o of occ) {
      const start = new Date(o.startsAt!).getTime();
      const end = new Date(o.endsAt!).getTime();
      expect(end - start).toBe(2 * 60 * 60 * 1000);
    }
    expect(occ[1].startsAt).toBe('2026-10-07T16:00:00.000Z');
  });
});

describe('occurrencesForEvent — exceptions', () => {
  it('skips one lap and overrides another, leaving the rest at base values', () => {
    const event: EventRow = { ...base, repeat: 'weekly', repeatInterval: 1 };
    const exceptions: ExceptionRow[] = [
      {
        id: 'x1',
        eventId: 'e1',
        occurrenceDate: '2026-10-13',
        kind: 'skip',
        title: null,
        note: null,
        color: null,
        allDay: null,
        startsAt: null,
        endsAt: null,
        startDate: null,
        endDate: null,
        reminderMinutes: null,
      },
      {
        id: 'x2',
        eventId: 'e1',
        occurrenceDate: '2026-10-20',
        kind: 'override',
        title: 'Chạy bộ (sân khác)',
        note: null,
        color: 'sky',
        allDay: null,
        startsAt: null,
        endsAt: null,
        startDate: null,
        endDate: null,
        reminderMinutes: null,
      },
    ];
    const occ = occurrencesForEvent(event, exceptions, range);
    expect(occ.map((o) => o.occurrenceDate)).toEqual(['2026-10-06', '2026-10-20', '2026-10-27']);
    const overridden = occ.find((o) => o.occurrenceDate === '2026-10-20')!;
    expect(overridden.title).toBe('Chạy bộ (sân khác)');
    expect(overridden.color).toBe('sky');
    expect(overridden.isException).toBe(true);
    expect(occ[0].isException).toBe(false);
  });

  it('ignores exceptions belonging to a different event', () => {
    const event: EventRow = { ...base, repeat: 'none' };
    const exceptions: ExceptionRow[] = [
      {
        id: 'x1',
        eventId: 'other-event',
        occurrenceDate: '2026-10-06',
        kind: 'skip',
        title: null,
        note: null,
        color: null,
        allDay: null,
        startsAt: null,
        endsAt: null,
        startDate: null,
        endDate: null,
        reminderMinutes: null,
      },
    ];
    expect(occurrencesForEvent(event, exceptions, range)).toHaveLength(1);
  });
});
