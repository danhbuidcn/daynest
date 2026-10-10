import { describe, expect, it } from '@jest/globals';

import { occurrencesOnDay } from '@/features/calendar/dayOccurrences';
import type { EventOccurrence } from '@/features/events/occurrences';

const occ = (over: Partial<EventOccurrence>): EventOccurrence => ({
  eventId: 'e1',
  occurrenceDate: '2026-10-06',
  title: 'Đi Đà Lạt',
  note: '',
  color: 'sky',
  allDay: true,
  startsAt: null,
  endsAt: null,
  startDate: '2026-10-06',
  endDate: '2026-10-06',
  reminderMinutes: [],
  repeat: 'none',
  isException: false,
  ...over,
});

describe('occurrencesOnDay', () => {
  it('shows a multi-day all-day event on every day it covers', () => {
    const trip = occ({ startDate: '2026-10-06', endDate: '2026-10-08' });
    expect(occurrencesOnDay([trip], { year: 2026, month: 10, day: 5 })).toEqual([]);
    expect(occurrencesOnDay([trip], { year: 2026, month: 10, day: 6 })).toEqual([trip]);
    expect(occurrencesOnDay([trip], { year: 2026, month: 10, day: 7 })).toEqual([trip]);
    expect(occurrencesOnDay([trip], { year: 2026, month: 10, day: 8 })).toEqual([trip]);
    expect(occurrencesOnDay([trip], { year: 2026, month: 10, day: 9 })).toEqual([]);
  });

  it('matches a timed event by its local calendar date', () => {
    const meeting = occ({ allDay: false, startDate: null, endDate: null, startsAt: '2026-10-06T16:00:00.000Z', endsAt: '2026-10-06T18:00:00.000Z' }); // 23:00-01:00 Asia/Ho_Chi_Minh
    expect(occurrencesOnDay([meeting], { year: 2026, month: 10, day: 6 })).toEqual([meeting]);
    expect(occurrencesOnDay([meeting], { year: 2026, month: 10, day: 7 })).toEqual([meeting]);
  });
});
