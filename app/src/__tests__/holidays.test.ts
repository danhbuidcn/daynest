import { describe, expect, it } from '@jest/globals';

import { holidaysOn, type HolidayId } from '@/lib/holidays';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

const on = (year: number, month: number, day: number) => holidaysOn({ year, month, day });

describe('holidays', () => {
  it.each<[number, number, number, HolidayId]>([
    [2024, 2, 2, 'kitchenGods'],
    [2024, 2, 10, 'lunarNewYear'],
    [2024, 2, 12, 'lunarNewYear'],
    [2024, 2, 24, 'lanternFestival'],
    [2024, 4, 18, 'hungKings'],
    [2024, 5, 22, 'buddhasBirthday'],
    [2024, 6, 10, 'doubleFifth'],
    [2024, 8, 18, 'vuLan'],
    [2024, 9, 17, 'midAutumn'],
    [2025, 1, 29, 'lunarNewYear'],
    [2025, 4, 7, 'hungKings'],
    [2025, 10, 6, 'midAutumn'],
    [2026, 2, 17, 'lunarNewYear'],
    [2026, 4, 26, 'hungKings'],
    [2026, 9, 25, 'midAutumn'],
    [2027, 2, 6, 'lunarNewYear'],
  ])('%i-%i-%i includes %s', (y, m, d, id) => {
    expect(on(y, m, d)).toContain(id);
  });

  it('puts New Year Eve on 30/12 when the month is full', () => {
    expect(on(2023, 1, 21)).toEqual(['lunarNewYearEve']);
    expect(on(2023, 1, 20)).toEqual([]);
  });

  it('puts New Year Eve on 29/12 when the month is short', () => {
    expect(on(2024, 2, 9)).toEqual(['lunarNewYearEve']);
    expect(on(2026, 2, 16)).toEqual(['lunarNewYearEve']);
  });

  it('lists solar holidays', () => {
    expect(on(2026, 10, 20)).toEqual(['vietnameseWomensDay']);
    expect(on(2026, 9, 2)).toEqual(['nationalDay']);
    expect(on(2026, 10, 21)).toEqual([]);
  });

  it('skips lunar holidays in a leap month', () => {
    // 2025 has leap month 6; 15/6 leap is not a holiday, nor is any other leap day.
    expect(holidaysOn({ year: 2025, month: 8, day: 8 }, { year: 2025, month: 7, day: 15, leap: true })).toEqual([]);
  });
});

describe('holiday names', () => {
  it('every holiday that occurs has an EN and VI name', () => {
    const seen = new Set<string>();
    for (let m = 1; m <= 12; m++) for (let d = 1; d <= 31; d++) on(2026, m, d).forEach((id) => seen.add(id));
    on(2027, 2, 5).forEach((id) => seen.add(id));
    expect(seen.size).toBe(21);
    for (const id of seen) {
      expect(en.holidays[id as HolidayId]).toBeTruthy();
      expect(vi.holidays[id as HolidayId]).toBeTruthy();
    }
  });
});
