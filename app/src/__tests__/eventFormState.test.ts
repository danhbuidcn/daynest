import { describe, expect, it } from '@jest/globals';

import type { EventRow } from '@/features/events/event';
import {
  changesSeriesAnchor,
  clampInterval,
  endsBeforeStart,
  formStateFromOccurrence,
  isFormValid,
  newFormState,
  toEventInput,
  withReminderOn,
  withStartDate,
} from '@/features/events/eventFormState';
import type { EventOccurrence } from '@/features/events/occurrences';

const TZ = 'Asia/Ho_Chi_Minh';
const d = (year: number, month: number, day: number) => ({ year, month, day });

describe('newFormState', () => {
  it('starts at the next full hour, lasts 1 hour, reminds 15 minutes before', () => {
    const f = newFormState(d(2026, 10, 10), TZ, new Date('2026-10-10T02:40:00Z')); // 09:40 local
    expect(f.startTime).toEqual({ hour: 10, minute: 0, second: 0 });
    expect(f.endTime).toEqual({ hour: 11, minute: 0, second: 0 });
    expect(f.reminderMinutes).toEqual([15]);
    expect(f.repeat).toBe('none');
  });
});

describe('validation', () => {
  const base = newFormState(d(2026, 10, 10), TZ, new Date('2026-10-10T02:40:00Z'));

  it('needs a non-blank title', () => {
    expect(isFormValid({ ...base, title: '   ' }, TZ)).toBe(false);
    expect(isFormValid({ ...base, title: 'Họp' }, TZ)).toBe(true);
  });

  it('rejects an end before the start, timed and all-day', () => {
    expect(endsBeforeStart({ ...base, endTime: { hour: 9, minute: 0, second: 0 } }, TZ)).toBe(true);
    expect(endsBeforeStart({ ...base, allDay: true, endDate: d(2026, 10, 9) }, TZ)).toBe(true);
    expect(endsBeforeStart({ ...base, allDay: true }, TZ)).toBe(false);
  });
});

describe('form edits', () => {
  const base = { ...newFormState(d(2026, 10, 6), TZ), allDay: true, endDate: d(2026, 10, 8) };

  it('moving the start keeps a multi-day length', () => {
    const f = withStartDate(base, d(2026, 10, 20));
    expect(f.endDate).toEqual(d(2026, 10, 22));
  });

  it('turning reminders on with none adds 15 minutes; off keeps the list', () => {
    expect(withReminderOn({ ...base, reminderOn: false, reminderMinutes: [] }, true).reminderMinutes).toEqual([15]);
    expect(withReminderOn({ ...base, reminderMinutes: [60] }, false).reminderMinutes).toEqual([60]);
  });

  it('clamps the repeat interval to 1-99', () => {
    expect(clampInterval('')).toBe(1);
    expect(clampInterval('0')).toBe(1);
    expect(clampInterval('150')).toBe(99);
    expect(clampInterval('7')).toBe(7);
  });
});

describe('toEventInput', () => {
  it('writes a timed event as UTC instants', () => {
    const f = { ...newFormState(d(2026, 10, 10), TZ), title: ' Họp ', startTime: { hour: 10, minute: 0, second: 0 }, endTime: { hour: 11, minute: 0, second: 0 } };
    const input = toEventInput(f, TZ);
    expect(input.title).toBe('Họp');
    expect(input.startsAt).toBe('2026-10-10T03:00:00.000Z');
    expect(input.startDate).toBeNull();
  });

  it('derives the lunar day/month and forces interval 1 for lunar_yearly', () => {
    const f = { ...newFormState(d(2026, 10, 21), TZ), allDay: true, repeat: 'lunar_yearly' as const, repeatInterval: 3 };
    const input = toEventInput(f, TZ);
    expect(input.lunarMonth).toBe(9);
    expect(input.lunarDay).toBe(12);
    expect(input.repeatInterval).toBe(1);
  });

  it('drops reminders when turned off and an end date before the start', () => {
    const f = { ...newFormState(d(2026, 10, 10), TZ), reminderOn: false, repeat: 'daily' as const, repeatUntil: d(2026, 10, 1) };
    const input = toEventInput(f, TZ);
    expect(input.reminderMinutes).toEqual([]);
    expect(input.repeatUntil).toBeNull();
  });
});

describe('formStateFromOccurrence / changesSeriesAnchor', () => {
  const base: EventRow = {
    id: 'e1',
    updatedAt: 'x',
    title: 'Chạy bộ',
    note: '',
    color: 'mint',
    allDay: false,
    startsAt: '2026-10-06T23:00:00.000Z', // 06:00 on 7/10 local
    endsAt: '2026-10-07T00:00:00.000Z',
    startDate: null,
    endDate: null,
    repeat: 'weekly',
    repeatInterval: 1,
    repeatUntil: null,
    lunarMonth: null,
    lunarDay: null,
    reminderMinutes: [],
  };
  const occ: EventOccurrence = {
    eventId: 'e1',
    occurrenceDate: '2026-10-14',
    title: 'Chạy bộ',
    note: '',
    color: 'mint',
    allDay: false,
    startsAt: '2026-10-13T23:00:00.000Z',
    endsAt: '2026-10-14T00:00:00.000Z',
    startDate: null,
    endDate: null,
    reminderMinutes: [],
    repeat: 'weekly',
    isException: false,
  };

  it('loads the occurrence in local time with the series rule', () => {
    const f = formStateFromOccurrence(base, occ, TZ);
    expect(f.startDate).toEqual(d(2026, 10, 14));
    expect(f.startTime).toEqual({ hour: 6, minute: 0, second: 0 });
    expect(f.repeat).toBe('weekly');
    expect(f.reminderOn).toBe(false);
  });

  it('flags a changed repeat type or start date, not a changed title', () => {
    const f = { ...formStateFromOccurrence(base, occ, TZ), startDate: d(2026, 10, 7) };
    expect(changesSeriesAnchor(base, { ...f, title: 'Đi bộ' }, TZ)).toBe(false);
    expect(changesSeriesAnchor(base, { ...f, repeat: 'daily' }, TZ)).toBe(true);
    expect(changesSeriesAnchor(base, { ...f, startDate: d(2026, 10, 8) }, TZ)).toBe(true);
  });
});
