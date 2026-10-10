import { describe, expect, it } from '@jest/globals';

import { toRelativeMoment } from '@/lib/relativeDate';

describe('toRelativeMoment', () => {
  const now = new Date(2026, 9, 10, 9, 41);

  it('same day -> today', () => {
    expect(toRelativeMoment(new Date(2026, 9, 10, 7, 5), now)).toEqual({ kind: 'today', hour: 7, minute: 5 });
  });

  it('1 day before -> yesterday', () => {
    expect(toRelativeMoment(new Date(2026, 9, 9, 21, 10), now)).toEqual({ kind: 'yesterday', hour: 21, minute: 10 });
  });

  it('just after midnight today still counts as today, not yesterday', () => {
    expect(toRelativeMoment(new Date(2026, 9, 10, 0, 1), now)).toEqual({ kind: 'today', hour: 0, minute: 1 });
  });

  it('2+ days before -> absolute date', () => {
    expect(toRelativeMoment(new Date(2026, 9, 5, 12, 0), now)).toEqual({ kind: 'date', day: 5, month: 10, year: 2026 });
  });

  it('a date in a different month -> absolute date', () => {
    expect(toRelativeMoment(new Date(2026, 8, 25, 8, 0), now)).toEqual({ kind: 'date', day: 25, month: 9, year: 2026 });
  });
});
