import { describe, expect, it } from '@jest/globals';

import { todayIn } from '@/lib/calendar/timeZone';

describe('todayIn', () => {
  const lateUtc = new Date('2026-10-09T18:30:00Z');

  it('uses Vietnam time by default', () => {
    expect(todayIn(undefined, lateUtc)).toEqual({ year: 2026, month: 10, day: 10 });
  });

  it('follows the chosen time zone', () => {
    expect(todayIn('Europe/London', lateUtc)).toEqual({ year: 2026, month: 10, day: 9 });
    expect(todayIn('America/Los_Angeles', new Date('2027-01-01T05:00:00Z'))).toEqual({ year: 2026, month: 12, day: 31 });
  });

  it('falls back to the device date for an unknown zone', () => {
    const d = new Date(2026, 9, 9, 12);
    expect(todayIn('Not/AZone', d)).toEqual({ year: 2026, month: 10, day: 9 });
  });
});
