import { describe, expect, it } from '@jest/globals';

import { narrowestCovering } from '@/lib/calendar/coveringRange';

const month = { from: '2026-09-28', to: '2026-11-08', value: 'month' };
const week = { from: '2026-10-12', to: '2026-10-18', value: 'week' };

describe('narrowestCovering', () => {
  it('returns nothing when no loaded range contains the target', () => {
    expect(narrowestCovering([], '2026-10-12', '2026-10-12')).toBeUndefined();
    expect(narrowestCovering([week], '2026-10-11', '2026-10-12')).toBeUndefined();
    expect(narrowestCovering([week], '2026-10-18', '2026-10-19')).toBeUndefined();
  });

  it('accepts ranges that touch the target edges', () => {
    expect(narrowestCovering([week], '2026-10-12', '2026-10-18')).toBe('week');
    expect(narrowestCovering([month], '2026-09-28', '2026-09-28')).toBe('month');
  });

  it('prefers the narrowest covering range', () => {
    expect(narrowestCovering([month, week], '2026-10-14', '2026-10-14')).toBe('week');
    expect(narrowestCovering([week, month], '2026-10-14', '2026-10-14')).toBe('week');
    expect(narrowestCovering([month, week], '2026-10-01', '2026-10-01')).toBe('month');
  });

  it('compares across year ends', () => {
    const dec = { from: '2026-11-30', to: '2027-01-10', value: 'dec' };
    expect(narrowestCovering([dec], '2026-12-31', '2027-01-01')).toBe('dec');
  });
});
