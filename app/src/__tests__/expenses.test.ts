import { describe, expect, it } from '@jest/globals';

import {
  compactVnd,
  dailyTotals,
  defaultSpentOn,
  formatAmountInput,
  formatVnd,
  isMonthAxisDay,
  monthlyTotals,
  parseAmount,
  periodRange,
  recentMonthsRange,
  relativeDay,
  shiftPeriod,
  sumAmounts,
  totalsByCategory,
} from '@/lib/expenses';
import { budgetForMonth, budgetProgress, monthKey } from '@/lib/expenses/budget';
import { groupByDay } from '@/lib/expenses/groupByDay';
import { anchorOf, nextDueDate } from '@/lib/expenses/recurrence';
import { SUGGESTED_CATEGORIES, visibleSuggestions } from '@/features/expenses/suggestedCategories';
import { PICKABLE_ICONS } from '@/features/expenses/expense';

const d = (year: number, month: number, day: number) => ({ year, month, day });

describe('expenses periods', () => {
  it('covers one day', () => {
    expect(periodRange('day', d(2026, 10, 12), 1)).toEqual({ from: d(2026, 10, 12), to: d(2026, 10, 12) });
  });

  it('covers the week by week_start', () => {
    expect(periodRange('week', d(2026, 10, 11), 1)).toEqual({ from: d(2026, 10, 5), to: d(2026, 10, 11) });
    expect(periodRange('week', d(2026, 10, 11), 0)).toEqual({ from: d(2026, 10, 11), to: d(2026, 10, 17) });
    expect(periodRange('week', d(2026, 12, 31), 1)).toEqual({ from: d(2026, 12, 28), to: d(2027, 1, 3) });
  });

  it('covers the whole month, leap years included', () => {
    expect(periodRange('month', d(2026, 10, 12), 1)).toEqual({ from: d(2026, 10, 1), to: d(2026, 10, 31) });
    expect(periodRange('month', d(2028, 2, 5), 1)).toEqual({ from: d(2028, 2, 1), to: d(2028, 2, 29) });
  });

  it('moves one period back and forth', () => {
    expect(shiftPeriod('day', d(2026, 10, 31), 1)).toEqual(d(2026, 11, 1));
    expect(shiftPeriod('week', d(2026, 10, 12), -1)).toEqual(d(2026, 10, 5));
    expect(shiftPeriod('month', d(2026, 10, 31), 1)).toEqual(d(2026, 11, 30));
    expect(shiftPeriod('month', d(2026, 1, 15), -1)).toEqual(d(2025, 12, 15));
  });
});

describe('expenses totals', () => {
  const rows = [
    { categoryId: 'food', amount: 45_000 },
    { categoryId: 'move', amount: 30_000 },
    { categoryId: 'food', amount: 25_000 },
    { categoryId: 'coffee', amount: 30_000 },
  ];

  it('sums the period', () => {
    expect(sumAmounts(rows)).toBe(130_000);
    expect(sumAmounts([])).toBe(0);
  });

  it('groups by category, most first, with percents', () => {
    expect(totalsByCategory(rows)).toEqual([
      { categoryId: 'food', amount: 70_000, percent: 54 },
      { categoryId: 'move', amount: 30_000, percent: 23 },
      { categoryId: 'coffee', amount: 30_000, percent: 23 },
    ]);
    expect(totalsByCategory([])).toEqual([]);
  });
});

describe('expenses amounts', () => {
  it('formats VND with dot thousands', () => {
    expect(formatVnd(50_000)).toBe('50.000 ₫');
    expect(formatVnd(999)).toBe('999 ₫');
    expect(formatVnd(100_000_000_000)).toBe('100.000.000.000 ₫');
  });

  it('reads what was typed', () => {
    expect(parseAmount('50.000')).toBe(50_000);
    expect(parseAmount(' 1 ')).toBe(1);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('100.000.000.001')).toBeNull();
  });
});

describe('expense charts', () => {
  it('sums each day of the period, empty days included', () => {
    const rows = [
      { spentOn: '2026-10-05', amount: 30_000 },
      { spentOn: '2026-10-05', amount: 20_000 },
      { spentOn: '2026-10-11', amount: 15_000 },
      { spentOn: '2026-10-12', amount: 99_000 },
    ];
    expect(dailyTotals(rows, d(2026, 10, 5), d(2026, 10, 11))).toEqual([50_000, 0, 0, 0, 0, 0, 15_000]);
    expect(dailyTotals([{ spentOn: '2027-01-01', amount: 1 }], d(2026, 12, 28), d(2027, 1, 3))).toEqual([0, 0, 0, 0, 1, 0, 0]);
  });

  it('covers the viewed month and the five before it', () => {
    expect(recentMonthsRange(d(2026, 3, 15))).toEqual({ from: d(2025, 10, 1), to: d(2026, 3, 31) });
  });

  it('places monthly totals on the six chart months', () => {
    const rows = [
      { month: '2025-10-01', total: 100 },
      { month: '2026-01-01', total: 300 },
      { month: '2026-03-01', total: 500 },
    ];
    expect(monthlyTotals(rows, d(2026, 3, 15))).toEqual([100, 0, 0, 300, 0, 500]);
  });

  it('labels 1, 5, 10, 15, 20, 25 and the last day', () => {
    const shown = (last: number) => Array.from({ length: last }, (_, i) => i + 1).filter((day) => isMonthAxisDay(day, last));
    expect(shown(31)).toEqual([1, 5, 10, 15, 20, 25, 31]);
    expect(shown(28)).toEqual([1, 5, 10, 15, 20, 25, 28]);
  });

  it('writes short amounts', () => {
    expect(compactVnd(510_000)).toBe('510k');
    expect(compactVnd(2_500_000)).toBe('2,5tr');
    expect(compactVnd(3_000_000)).toBe('3tr');
    expect(compactVnd(999_600)).toBe('1tr');
    expect(compactVnd(1_234_000_000)).toBe('1.234tr');
    expect(compactVnd(400)).toBe('400');
  });
});

describe('expense form', () => {
  it('adds dots while typing and keeps the limit', () => {
    expect(formatAmountInput('50000')).toBe('50.000');
    expect(formatAmountInput('50.0001')).toBe('500.001');
    expect(formatAmountInput('007')).toBe('7');
    expect(formatAmountInput('0')).toBe('');
    expect(formatAmountInput('1234567890123')).toBe('123.456.789.012');
  });

  it('names today and yesterday', () => {
    expect(relativeDay(d(2026, 10, 13), d(2026, 10, 13))).toBe('today');
    expect(relativeDay(d(2026, 9, 30), d(2026, 10, 1))).toBe('yesterday');
    expect(relativeDay(d(2026, 10, 14), d(2026, 10, 13))).toBeNull();
  });

  it('picks the date of a new expense from the tab', () => {
    const today = d(2026, 10, 13);
    expect(defaultSpentOn('day', d(2026, 10, 2), today, 1)).toEqual(d(2026, 10, 2));
    expect(defaultSpentOn('month', d(2026, 10, 1), today, 1)).toEqual(today);
    expect(defaultSpentOn('month', d(2026, 9, 13), today, 1)).toEqual(d(2026, 9, 1));
    expect(defaultSpentOn('week', d(2026, 10, 5), today, 1)).toEqual(d(2026, 10, 5));
  });
});

describe('expense category icons', () => {
  it('offers 42 distinct names the DB accepts', () => {
    expect(new Set(PICKABLE_ICONS).size).toBe(42);
    for (const name of PICKABLE_ICONS) expect(name).toMatch(/^[a-z]{2,20}$/);
  });
});

describe('suggested categories', () => {
  it('has 24 distinct suggestions with a pickable icon', () => {
    expect(new Set(SUGGESTED_CATEGORIES.map((s) => s.key)).size).toBe(24);
    for (const s of SUGGESTED_CATEGORIES) expect(PICKABLE_ICONS).toContain(s.icon);
  });
  it('hides a name the user already has, ignoring case', () => {
    const list = [{ name: 'Đi chợ' }, { name: 'Trà sữa' }];
    expect(visibleSuggestions(list, ['đi CHỢ ', null])).toEqual([{ name: 'Trà sữa' }]);
  });
});

describe('budget', () => {
  const key = monthKey(2026, 10);
  it('uses the general budget when the month has no row', () => {
    expect(budgetForMonth(5_000_000, {}, key)).toEqual({ amount: 5_000_000, kind: 'general' });
    expect(budgetForMonth(null, {}, key)).toBeNull();
  });
  it('lets the month row win, including "no budget"', () => {
    expect(budgetForMonth(5_000_000, { [key]: 8_000_000 }, key)).toEqual({ amount: 8_000_000, kind: 'month' });
    expect(budgetForMonth(5_000_000, { [key]: null }, key)).toBeNull();
    expect(budgetForMonth(5_000_000, { '2026-11-01': 1 }, key)).toEqual({ amount: 5_000_000, kind: 'general' });
  });
  it('levels: under 80 ok, 80 to 100 warn, over 100 over', () => {
    expect(budgetProgress(790, 1000)).toMatchObject({ percent: 79, level: 'ok', remaining: 210 });
    expect(budgetProgress(800, 1000).level).toBe('warn');
    expect(budgetProgress(1000, 1000).level).toBe('warn');
    expect(budgetProgress(1001, 1000)).toMatchObject({ level: 'over', remaining: -1 });
  });
});

describe('recurrence', () => {
  it('weekly anchor is the ISO weekday', () => {
    expect(anchorOf('weekly', { year: 2025, month: 10, day: 6 })).toBe(1); // Monday
    expect(anchorOf('weekly', { year: 2025, month: 10, day: 5 })).toBe(7); // Sunday
    expect(anchorOf('monthly', { year: 2025, month: 10, day: 31 })).toBe(31);
  });
  it('weekly moves 7 days, across a month end', () => {
    expect(nextDueDate('weekly', 1, { year: 2025, month: 10, day: 27 })).toEqual({ year: 2025, month: 11, day: 3 });
  });
  it('monthly keeps the anchor day, falls back to the last day of a short month', () => {
    expect(nextDueDate('monthly', 31, { year: 2025, month: 10, day: 31 })).toEqual({ year: 2025, month: 11, day: 30 });
    expect(nextDueDate('monthly', 31, { year: 2025, month: 11, day: 30 })).toEqual({ year: 2025, month: 12, day: 31 });
    expect(nextDueDate('monthly', 30, { year: 2024, month: 1, day: 30 })).toEqual({ year: 2024, month: 2, day: 29 });
    expect(nextDueDate('monthly', 30, { year: 2025, month: 1, day: 30 })).toEqual({ year: 2025, month: 2, day: 28 });
    expect(nextDueDate('monthly', 15, { year: 2025, month: 12, day: 15 })).toEqual({ year: 2026, month: 1, day: 15 });
  });
});

describe('groupByDay', () => {
  const e = (id: string, categoryId: string, spentOn: string, amount: number) => ({ id, categoryId, spentOn, amount });
  const list = [e('1', 'a', '2026-10-14', 100), e('2', 'b', '2026-10-15', 5), e('3', 'a', '2026-10-15', 200), e('4', 'a', '2026-10-15', 50)];
  it('keeps only the category, newest day first, with day totals', () => {
    const groups = groupByDay(list, 'a');
    expect(groups.map((g) => g.date)).toEqual(['2026-10-15', '2026-10-14']);
    expect(groups[0].items.map((x) => x.id)).toEqual(['3', '4']);
    expect(groups[0].total).toBe(250);
  });
  it('is empty for a category with no expenses', () => {
    expect(groupByDay(list, 'z')).toEqual([]);
  });
});
