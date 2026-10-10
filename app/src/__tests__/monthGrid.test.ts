import { describe, expect, it } from '@jest/globals';

import { addMonths, monthGrid, weekdayOf, weekdayOrder } from '@/lib/calendar/monthGrid';

describe('monthGrid', () => {
  it('starts October 2026 on Monday 28/9 when weeks start Monday', () => {
    const grid = monthGrid(2026, 10, 1);
    expect(grid).toHaveLength(42);
    expect(grid[0]).toMatchObject({ year: 2026, month: 9, day: 28, weekday: 1, inMonth: false });
    expect(grid[3]).toMatchObject({ month: 10, day: 1, weekday: 4, inMonth: true });
    expect(grid[41]).toMatchObject({ month: 11, day: 8, weekday: 0 });
  });

  it('starts October 2026 on Sunday 27/9 when weeks start Sunday', () => {
    const grid = monthGrid(2026, 10, 0);
    expect(grid[0]).toMatchObject({ month: 9, day: 27, weekday: 0 });
    expect(grid[4]).toMatchObject({ month: 10, day: 1 });
  });

  it('covers 29 days of February in a leap year', () => {
    const grid = monthGrid(2024, 2, 1);
    expect(grid.filter((d) => d.inMonth).map((d) => d.day)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
    expect(grid[0]).toMatchObject({ year: 2024, month: 1, day: 29 });
  });

  it('crosses the year boundary', () => {
    expect(monthGrid(2027, 1, 1)[0]).toMatchObject({ year: 2026, month: 12, day: 28 });
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });

  it('knows weekdays', () => {
    expect(weekdayOf({ year: 2000, month: 1, day: 1 })).toBe(6);
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
