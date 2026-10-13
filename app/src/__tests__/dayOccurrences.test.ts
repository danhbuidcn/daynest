import { describe, expect, it } from '@jest/globals';

import { byStartTime, calendarOrder, occurrencesOnDay, timedSpansOnDay } from '@/features/calendar/dayOccurrences';
import type { EventOccurrence } from '@/features/events/occurrences';
import type { TodoOccurrence } from '@/features/todos/todo';

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

describe('timedSpansOnDay', () => {
  const meeting = occ({ allDay: false, startDate: null, endDate: null, startsAt: '2026-10-06T16:00:00.000Z', endsAt: '2026-10-06T18:00:00.000Z' }); // 23:00-01:00 +7

  it('measures minutes from the start of the shown day in the user time zone', () => {
    expect(timedSpansOnDay([meeting], { year: 2026, month: 10, day: 6 })).toEqual([{ id: 'e1-2026-10-06', start: 23 * 60, end: 25 * 60, occurrence: meeting }]);
    expect(timedSpansOnDay([meeting], { year: 2026, month: 10, day: 7 })).toEqual([{ id: 'e1-2026-10-06', start: -60, end: 60, occurrence: meeting }]);
  });

  it('leaves out all-day events and other days', () => {
    expect(timedSpansOnDay([occ({})], { year: 2026, month: 10, day: 6 })).toEqual([]);
    expect(timedSpansOnDay([meeting], { year: 2026, month: 10, day: 8 })).toEqual([]);
  });
});

describe('byStartTime', () => {
  it('lists all-day events first, then timed ones by start', () => {
    const late = occ({ eventId: 'late', allDay: false, startsAt: '2026-10-06T10:00:00.000Z', endsAt: '2026-10-06T11:00:00.000Z' });
    const early = occ({ eventId: 'early', allDay: false, startsAt: '2026-10-06T02:00:00.000Z', endsAt: '2026-10-06T03:00:00.000Z' });
    const allDay = occ({ eventId: 'all' });
    expect([late, allDay, early].sort(byStartTime).map((o) => o.eventId)).toEqual(['all', 'early', 'late']);
  });
});

describe('calendarOrder', () => {
  const todo = (id: string, done: boolean, over: Partial<EventOccurrence> = {}): TodoOccurrence => ({
    ...occ({ eventId: id, ...over }),
    subtasks: [],
    status: { done, doneSubtasks: [] },
  });

  it('events first, then todos not done (by start), then done todos', () => {
    const timedTodo = todo('timedTodo', false, { allDay: false, startsAt: '2026-10-06T07:00:00.000Z', endsAt: '2026-10-06T07:00:00.000Z' });
    const timedEvent = occ({ eventId: 'event', allDay: false, startsAt: '2026-10-06T09:00:00.000Z', endsAt: '2026-10-06T10:00:00.000Z' });
    const list = [todo('done', true), timedTodo, todo('allDayTodo', false), timedEvent];
    expect(list.sort(calendarOrder).map((o) => o.eventId)).toEqual(['event', 'allDayTodo', 'timedTodo', 'done']);
  });
});
