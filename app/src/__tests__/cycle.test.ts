import { describe, expect, it } from '@jest/globals';

import { addDays, autoTickDays, cycleLength, groupPeriods, periodLength, predictPeriods } from '@/lib/cycle';

const run = (start: string, n: number) => Array.from({ length: n }, (_, i) => addDays(start, i));

describe('groupPeriods', () => {
  it('groups consecutive days, ignores order and duplicates', () => {
    const periods = groupPeriods(['2026-02-02', '2026-01-01', '2026-01-02', '2026-01-01', '2026-01-03', '2026-02-01']);
    expect(periods).toEqual([
      { start: '2026-01-01', end: '2026-01-03', length: 3 },
      { start: '2026-02-01', end: '2026-02-02', length: 2 },
    ]);
  });
  it('joins across a month and a year boundary', () => {
    expect(groupPeriods(['2025-12-31', '2026-01-01'])).toEqual([{ start: '2025-12-31', end: '2026-01-01', length: 2 }]);
  });
  it('is empty without days', () => expect(groupPeriods([])).toEqual([]));
});

describe('cycleLength', () => {
  it('falls back below 2 periods', () => {
    expect(cycleLength([], 28)).toBe(28);
    expect(cycleLength(groupPeriods(run('2026-01-01', 5)), 30)).toBe(30);
  });
  it('averages the gaps between starts', () => {
    const days = [...run('2026-01-01', 5), ...run('2026-01-29', 5), ...run('2026-02-28', 5)];
    expect(cycleLength(groupPeriods(days), 28)).toBe(29);
  });
  it('drops gaps under 15 and over 60 days', () => {
    const days = [...run('2026-01-01', 3), ...run('2026-01-10', 3), ...run('2026-02-07', 3), ...run('2026-05-20', 3)];
    expect(cycleLength(groupPeriods(days), 99)).toBe(28);
  });
  it('falls back when every gap is dropped', () => {
    expect(cycleLength(groupPeriods([...run('2026-01-01', 2), ...run('2026-01-05', 2)]), 31)).toBe(31);
  });
  it('uses only the latest 6 cycles', () => {
    const starts = ['2025-01-01', '2025-01-21', '2025-02-20', '2025-03-22', '2025-04-21', '2025-05-21', '2025-06-20', '2025-07-20'];
    // gaps: 20 30 30 30 30 30 30 → the 20 falls outside the 6 latest
    expect(cycleLength(groupPeriods(starts), 28)).toBe(30);
  });
});

describe('periodLength', () => {
  it('uses the setting without periods and the mean with them', () => {
    expect(periodLength([], 5)).toBe(5);
    expect(periodLength(groupPeriods([...run('2026-01-01', 4), ...run('2026-02-01', 6)]), 5)).toBe(5);
  });
});

describe('predictPeriods', () => {
  const settings = { cycleLength: 28, periodLength: 5 };
  it('predicts nothing without a logged period', () => {
    expect(predictPeriods([], '2026-01-10', settings)).toEqual([]);
  });
  it('gives 3 periods spaced by the cycle length', () => {
    const periods = groupPeriods(run('2026-01-01', 5));
    expect(predictPeriods(periods, '2026-01-10', settings)).toEqual([
      { start: '2026-01-29', end: '2026-02-02', lateDays: 0 },
      { start: '2026-02-26', end: '2026-03-02', lateDays: 0 },
      { start: '2026-03-26', end: '2026-03-30', lateDays: 0 },
    ]);
  });
  it('is not late on the predicted day itself', () => {
    const periods = groupPeriods(run('2026-01-01', 5));
    expect(predictPeriods(periods, '2026-01-29', settings)[0]).toEqual({ start: '2026-01-29', end: '2026-02-02', lateDays: 0 });
  });
  it('moves to today and counts late days', () => {
    const periods = groupPeriods(run('2026-01-01', 5));
    const [first, second] = predictPeriods(periods, '2026-02-01', settings);
    expect(first).toEqual({ start: '2026-02-01', end: '2026-02-05', lateDays: 3 });
    expect(second.start).toBe('2026-03-01');
  });
});

describe('autoTickDays', () => {
  it('ticks the whole period length from a lone day', () => {
    expect(autoTickDays('2026-01-10', new Set(), '2026-01-31', 5)).toEqual(run('2026-01-10', 5));
  });
  it('stops at today', () => {
    expect(autoTickDays('2026-01-10', new Set(), '2026-01-12', 5)).toEqual(run('2026-01-10', 3));
  });
  it('ticks only the day when it touches a logged one', () => {
    expect(autoTickDays('2026-01-11', new Set(['2026-01-10']), '2026-01-31', 5)).toEqual(['2026-01-11']);
    expect(autoTickDays('2026-01-09', new Set(['2026-01-10']), '2026-01-31', 5)).toEqual(['2026-01-09']);
  });
});
