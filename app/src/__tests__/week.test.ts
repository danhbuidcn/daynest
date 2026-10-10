import { describe, expect, it } from '@jest/globals';

import { addDays, startOfWeek, weekDates } from '@/lib/calendar/week';

describe('week', () => {
  it('adds days across month and year ends', () => {
    expect(addDays({ year: 2026, month: 10, day: 30 }, 3)).toEqual({ year: 2026, month: 11, day: 2 });
    expect(addDays({ year: 2026, month: 1, day: 1 }, -1)).toEqual({ year: 2025, month: 12, day: 31 });
    expect(addDays({ year: 2028, month: 2, day: 28 }, 1)).toEqual({ year: 2028, month: 2, day: 29 });
  });

  it('starts the week on Monday or Sunday', () => {
    const fri = { year: 2026, month: 10, day: 9 };
    expect(startOfWeek(fri, 1)).toEqual({ year: 2026, month: 10, day: 5 });
    expect(startOfWeek(fri, 0)).toEqual({ year: 2026, month: 10, day: 4 });
  });

  it('keeps a Sunday in the week it belongs to', () => {
    const sun = { year: 2026, month: 10, day: 11 };
    expect(startOfWeek(sun, 1)).toEqual({ year: 2026, month: 10, day: 5 });
    expect(startOfWeek(sun, 0)).toEqual(sun);
  });

  it('lists the 7 days of the week', () => {
    const days = weekDates({ year: 2026, month: 10, day: 1 }, 1);
    expect(days).toHaveLength(7);
    expect(days[0]).toEqual({ year: 2026, month: 9, day: 28 });
    expect(days[6]).toEqual({ year: 2026, month: 10, day: 4 });
  });
});
