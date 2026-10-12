import { describe, expect, it } from '@jest/globals';

import { groupNotesByMonth } from '@/lib/notes/groups';

const TZ = 'Asia/Ho_Chi_Minh';
const NOW = new Date('2026-10-12T03:00:00Z');
const note = (id: string, updatedAt: string, pinned = false) => ({ id, updatedAt, pinned });

describe('groupNotesByMonth', () => {
  it('puts pinned notes first, then one group per month in list order', () => {
    const groups = groupNotesByMonth(
      [
        note('p1', '2026-10-08T01:00:00Z', true),
        note('p2', '2026-05-01T01:00:00Z', true),
        note('a', '2026-10-11T01:00:00Z'),
        note('b', '2026-10-02T01:00:00Z'),
        note('c', '2026-09-20T01:00:00Z'),
        note('d', '2025-12-28T01:00:00Z'),
      ],
      TZ,
      NOW,
    );
    expect(groups.map((g) => [g.key, g.notes.map((n) => n.id)])).toEqual([
      ['pinned', ['p1', 'p2']],
      ['2026-10', ['a', 'b']],
      ['2026-09', ['c']],
      ['2025-12', ['d']],
    ]);
    expect(groups[0]).toMatchObject({ pinned: true });
    expect(groups[1]).toMatchObject({ pinned: false, year: 2026, month: 10, thisYear: true });
    expect(groups[3]).toMatchObject({ year: 2025, month: 12, thisYear: false });
  });

  it('uses the month in the given time zone, not UTC', () => {
    // 2026-09-30 18:00 UTC is already 1 October in Vietnam.
    const [group] = groupNotesByMonth([note('a', '2026-09-30T18:00:00Z')], TZ, NOW);
    expect(group).toMatchObject({ key: '2026-10', month: 10 });
  });

  it('returns no groups for no notes and no pinned group without pinned notes', () => {
    expect(groupNotesByMonth([], TZ, NOW)).toEqual([]);
    expect(groupNotesByMonth([note('a', '2026-10-11T01:00:00Z')], TZ, NOW).map((g) => g.key)).toEqual(['2026-10']);
  });
});
