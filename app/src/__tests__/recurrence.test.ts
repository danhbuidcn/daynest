import { describe, expect, it } from '@jest/globals';

import { applyExceptions, expandRule, occurrences, type RecurrenceRule } from '@/lib/recurrence';

const d = (year: number, month: number, day: number) => ({ year, month, day });
const range = (from: ReturnType<typeof d>, to: ReturnType<typeof d>) => ({ from, to });

describe('expandRule — monthly', () => {
  it('skips months without the 31st, keeping 31/3', () => {
    const rule: RecurrenceRule = { repeat: 'monthly', startDate: d(2024, 1, 31), interval: 1 };
    const dates = expandRule(rule, range(d(2024, 1, 1), d(2024, 5, 31)));
    expect(dates).toEqual([d(2024, 1, 31), d(2024, 3, 31), d(2024, 5, 31)]);
  });
});

describe('expandRule — yearly', () => {
  it('only lands on leap years for 29/2', () => {
    const rule: RecurrenceRule = { repeat: 'yearly', startDate: d(2024, 2, 29), interval: 1 };
    const dates = expandRule(rule, range(d(2024, 1, 1), d(2033, 1, 1)));
    expect(dates).toEqual([d(2024, 2, 29), d(2028, 2, 29), d(2032, 2, 29)]);
  });
});

describe('expandRule — weekly', () => {
  it('every 2 weeks, the last occurrence lands exactly on the end date', () => {
    const rule: RecurrenceRule = { repeat: 'weekly', startDate: d(2026, 1, 5), interval: 2, until: d(2026, 2, 16) };
    const dates = expandRule(rule, range(d(2026, 1, 1), d(2026, 3, 1)));
    expect(dates).toEqual([d(2026, 1, 5), d(2026, 1, 19), d(2026, 2, 2), d(2026, 2, 16)]);
  });
});

describe('expandRule — lunar_yearly', () => {
  it('30/12 falls back to 29/12 when that lunar month is short', () => {
    // 21/1/2023 = 30/12 of lunar year 2022 (full, 30 days); lunar year 2024's Chạp is short
    // (29 days), so day 30 there falls back to 29/12 = 28/1/2025.
    const rule: RecurrenceRule = { repeat: 'lunar_yearly', startDate: d(2023, 1, 21), lunarMonth: 12, lunarDay: 30 };
    const dates = expandRule(rule, range(d(2022, 1, 1), d(2026, 1, 1)));
    expect(dates).toContainEqual(d(2023, 1, 21));
    expect(dates).toContainEqual(d(2025, 1, 28));
  });

  it('fires once a year even when that year has a leap lunar month (2020 has a leap month 4)', () => {
    const rule: RecurrenceRule = { repeat: 'lunar_yearly', startDate: d(2019, 5, 19), lunarMonth: 4, lunarDay: 15 };
    const dates = expandRule(rule, range(d(2020, 1, 1), d(2020, 12, 31)));
    expect(dates).toHaveLength(1);
    expect(dates[0]).toEqual(d(2020, 5, 7));
  });
});

describe('expandRule — none / bounds', () => {
  it('returns the single date only when inside range', () => {
    const rule: RecurrenceRule = { repeat: 'none', startDate: d(2026, 10, 10) };
    expect(expandRule(rule, range(d(2026, 10, 1), d(2026, 10, 31)))).toEqual([d(2026, 10, 10)]);
    expect(expandRule(rule, range(d(2026, 11, 1), d(2026, 11, 30)))).toEqual([]);
  });

  it('never occurs before its own start date even if the range starts earlier', () => {
    const rule: RecurrenceRule = { repeat: 'daily', startDate: d(2026, 10, 10), interval: 1 };
    const dates = expandRule(rule, range(d(2026, 10, 1), d(2026, 10, 12)));
    expect(dates).toEqual([d(2026, 10, 10), d(2026, 10, 11), d(2026, 10, 12)]);
  });
});

describe('applyExceptions', () => {
  it('drops skip dates and attaches override data to the matching date', () => {
    const dates = [d(2026, 10, 6), d(2026, 10, 13), d(2026, 10, 20)];
    const result = applyExceptions(dates, [
      { date: d(2026, 10, 13), kind: 'skip' },
      { date: d(2026, 10, 20), kind: 'override', data: { title: 'Chạy bộ (sân khác)' } },
    ]);
    expect(result).toEqual([
      { date: d(2026, 10, 6) },
      { date: d(2026, 10, 20), override: { title: 'Chạy bộ (sân khác)' } },
    ]);
  });
});

describe('occurrences', () => {
  it('combines expandRule and applyExceptions', () => {
    const rule: RecurrenceRule = { repeat: 'weekly', startDate: d(2026, 10, 6), interval: 1 };
    const result = occurrences(rule, range(d(2026, 10, 1), d(2026, 10, 31)), [{ date: d(2026, 10, 13), kind: 'skip' }]);
    expect(result.map((o) => o.date)).toEqual([d(2026, 10, 6), d(2026, 10, 20), d(2026, 10, 27)]);
  });
});
