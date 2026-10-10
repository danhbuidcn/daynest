import { describe, expect, it } from '@jest/globals';

import { periodRange, shiftCursor } from '@/features/calendar/calendarNav';

const d = (year: number, month: number, day: number) => ({ year, month, day });

describe('shiftCursor', () => {
  it('moves a month, keeping the day when it exists', () => {
    expect(shiftCursor('month', d(2026, 10, 9), 1)).toEqual(d(2026, 11, 9));
    expect(shiftCursor('month', d(2026, 1, 31), 1)).toEqual(d(2026, 2, 28));
    expect(shiftCursor('month', d(2026, 1, 15), -1)).toEqual(d(2025, 12, 15));
  });

  it('moves a week in week and list modes, a day in day mode', () => {
    expect(shiftCursor('week', d(2026, 10, 9), 1)).toEqual(d(2026, 10, 16));
    expect(shiftCursor('list', d(2026, 10, 2), -1)).toEqual(d(2026, 9, 25));
    expect(shiftCursor('day', d(2026, 12, 31), 1)).toEqual(d(2027, 1, 1));
  });
});

describe('periodRange', () => {
  it('covers the whole 6-week grid in month mode', () => {
    expect(periodRange('month', d(2026, 10, 9), 1)).toEqual({ from: d(2026, 9, 28), to: d(2026, 11, 8) });
  });

  it('covers the week of the cursor in the other modes', () => {
    const week = { from: d(2026, 10, 5), to: d(2026, 10, 11) };
    expect(periodRange('week', d(2026, 10, 9), 1)).toEqual(week);
    expect(periodRange('day', d(2026, 10, 9), 1)).toEqual(week);
    expect(periodRange('list', d(2026, 10, 11), 1)).toEqual(week);
  });
});
