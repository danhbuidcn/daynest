import { describe, expect, it } from '@jest/globals';

import { formatVnd, parseAmount, periodRange, shiftPeriod, sumAmounts, totalsByCategory } from '@/lib/expenses';

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
