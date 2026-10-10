import { describe, expect, it } from '@jest/globals';

import { lunarLabel, monthDays } from '@/features/calendar/dayInfo';

describe('dayInfo', () => {
  it('labels lunar days like the mockup', () => {
    expect(lunarLabel({ year: 2026, month: 9, day: 1, leap: false })).toBe('1/9');
    expect(lunarLabel({ year: 2026, month: 8, day: 15, leap: false })).toBe('15/8');
    expect(lunarLabel({ year: 2025, month: 6, day: 1, leap: true })).toBe('1/6N');
    expect(lunarLabel({ year: 2026, month: 8, day: 29, leap: false })).toBe('29');
  });

  it('builds October 2026 with today, lunar days and holidays', () => {
    const days = monthDays(2026, 10, 1, { year: 2026, month: 10, day: 9 });
    const byKey = (m: number, d: number) => days.find((x) => x.month === m && x.day === d)!;
    expect(byKey(9, 28).lunarLabel).toBe('18');
    expect(byKey(10, 9)).toMatchObject({ isToday: true, lunarLabel: '29' });
    expect(byKey(10, 10)).toMatchObject({ lunarLabel: '1/9', lunarKey: true });
    expect(byKey(10, 20).holidays).toEqual(['vietnameseWomensDay']);
    expect(days.filter((d) => d.isToday)).toHaveLength(1);
  });
});
