import { describe, expect, it } from '@jest/globals';

import { clockParts, shiftByDays, timeOfDayIn, todayIn, zonedDateTimeToUtc } from '@/lib/calendar/timeZone';

describe('todayIn', () => {
  const lateUtc = new Date('2026-10-09T18:30:00Z');

  it('uses Vietnam time by default', () => {
    expect(todayIn(undefined, lateUtc)).toEqual({ year: 2026, month: 10, day: 10 });
  });

  it('follows the chosen time zone', () => {
    expect(todayIn('Europe/London', lateUtc)).toEqual({ year: 2026, month: 10, day: 9 });
    expect(todayIn('America/Los_Angeles', new Date('2027-01-01T05:00:00Z'))).toEqual({ year: 2026, month: 12, day: 31 });
  });

  it('falls back to the device date for an unknown zone', () => {
    const d = new Date(2026, 9, 9, 12);
    expect(todayIn('Not/AZone', d)).toEqual({ year: 2026, month: 10, day: 9 });
  });
});

describe('timeOfDayIn / zonedDateTimeToUtc', () => {
  it('round-trips a wall-clock time through Vietnam time (UTC+7, no DST)', () => {
    const date = { year: 2026, month: 10, day: 10 };
    const utc = zonedDateTimeToUtc(date, { hour: 10, minute: 0, second: 0 }, 'Asia/Ho_Chi_Minh');
    expect(utc.toISOString()).toBe('2026-10-10T03:00:00.000Z');
    expect(timeOfDayIn(utc, 'Asia/Ho_Chi_Minh')).toEqual({ hour: 10, minute: 0, second: 0 });
  });
});

describe('clockParts', () => {
  it('formats 24h as HH:mm', () => {
    expect(clockParts({ hour: 9, minute: 5, second: 0 }, true)).toEqual({ text: '09:05', period: null });
    expect(clockParts({ hour: 23, minute: 0, second: 0 }, true)).toEqual({ text: '23:00', period: null });
  });

  it('formats 12h with am/pm, noon and midnight as 12', () => {
    expect(clockParts({ hour: 0, minute: 0, second: 0 }, false)).toEqual({ text: '12:00', period: 'am' });
    expect(clockParts({ hour: 12, minute: 0, second: 0 }, false)).toEqual({ text: '12:00', period: 'pm' });
    expect(clockParts({ hour: 15, minute: 30, second: 0 }, false)).toEqual({ text: '3:30', period: 'pm' });
  });
});

describe('shiftByDays', () => {
  it('keeps the wall-clock time of day while moving the calendar date', () => {
    const start = new Date('2026-10-06T03:00:00Z'); // 10:00 in Asia/Ho_Chi_Minh
    const shifted = shiftByDays(start, 14, 'Asia/Ho_Chi_Minh');
    expect(shifted.toISOString()).toBe('2026-10-20T03:00:00.000Z');
  });

  it('preserves an overnight span when both ends shift', () => {
    const start = new Date('2026-10-06T16:00:00Z'); // 23:00 in Asia/Ho_Chi_Minh
    const end = new Date('2026-10-06T18:00:00Z'); // 01:00 the next day in Asia/Ho_Chi_Minh
    const shiftedStart = shiftByDays(start, 7, 'Asia/Ho_Chi_Minh');
    const shiftedEnd = shiftByDays(end, 7, 'Asia/Ho_Chi_Minh');
    expect(shiftedEnd.getTime() - shiftedStart.getTime()).toBe(end.getTime() - start.getTime());
  });

  it('is a no-op for delta 0', () => {
    const start = new Date('2026-10-06T16:00:00Z');
    expect(shiftByDays(start, 0)).toBe(start);
  });
});
