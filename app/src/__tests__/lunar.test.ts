import { describe, expect, it } from '@jest/globals';

import {
  MAX_YEAR,
  MIN_YEAR,
  canChiYear,
  jdFromDate,
  jdToDate,
  leapMonthOf,
  lunarMonthLength,
  toLunar,
  toSolar,
} from '@/lib/lunar';

const TET: [number, number, number][] = [
  [2020, 1, 25],
  [2021, 2, 12],
  [2022, 2, 1],
  [2023, 1, 22],
  [2024, 2, 10],
  [2025, 1, 29],
  [2026, 2, 17],
  [2027, 2, 6],
  [2028, 1, 26],
  [2029, 2, 13],
  // China (UTC+8) celebrates on 3/2: the new moon is 23:07 on 2/2 at UTC+7.
  [2030, 2, 2],
];

describe('lunar', () => {
  it.each(TET)('Tết %i falls on %i/%i', (year, month, day) => {
    expect(toSolar(1, 1, year)).toEqual({ year, month, day });
    expect(toLunar({ year, month, day })).toEqual({ year, month: 1, day: 1, leap: false });
  });

  it.each([
    [2020, 4],
    [2023, 2],
    [2025, 6],
    [2024, 0],
    [2026, 0],
  ])('lunar year %i has leap month %i', (year, leap) => {
    expect(leapMonthOf(year)).toBe(leap);
  });

  it('converts days in a leap month', () => {
    const start = toSolar(1, 6, 2025, true);
    expect(start).toEqual({ year: 2025, month: 7, day: 25 });
    expect(toLunar(start!)).toEqual({ year: 2025, month: 6, day: 1, leap: true });
    expect(toSolar(1, 5, 2025, true)).toBeNull();
    expect(toSolar(1, 6, 2024, true)).toBeNull();
  });

  it('matches the mockup: 9/10/2026 is 29/8', () => {
    expect(toLunar({ year: 2026, month: 10, day: 9 })).toEqual({ year: 2026, month: 8, day: 29, leap: false });
  });

  it('round-trips every day from 1900 to 2100', () => {
    const from = jdFromDate({ year: MIN_YEAR, month: 1, day: 31 });
    const to = jdFromDate({ year: MAX_YEAR, month: 12, day: 31 });
    let prev = toLunar(jdToDate(from - 1));
    for (let jd = from; jd <= to; jd++) {
      const solar = jdToDate(jd);
      const lunar = toLunar(solar);
      if (lunar.day !== prev.day + 1) {
        expect(lunar.day).toBe(1);
        expect(prev.day).toBe(lunarMonthLength(prev.month, prev.year, prev.leap));
      }
      if (lunar.day === 1 || jd % 97 === 0) {
        expect(toSolar(lunar.day, lunar.month, lunar.year, lunar.leap)).toEqual(solar);
      }
      prev = lunar;
    }
  });

  it('names the year Bính Ngọ for 2026', () => {
    expect(canChiYear(2026)).toEqual({ stem: 2, branch: 6 });
    expect(canChiYear(2024)).toEqual({ stem: 0, branch: 4 });
  });
});
