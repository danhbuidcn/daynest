import { todayIn } from '@/lib/calendar/timeZone';

export type NoteGroup<T> =
  | { key: 'pinned'; pinned: true; notes: T[] }
  | { key: string; pinned: false; year: number; month: number; thisYear: boolean; notes: T[] };

// Màn 16 (S3 B): "Đã ghim" first, then one group per month of `updated_at` in the user's time zone.
// The list is already ordered pinned → updated_at desc, so groups only split it, never reorder it.
export function groupNotesByMonth<T extends { pinned: boolean; updatedAt: string }>(
  notes: T[],
  timeZone: string,
  now: Date = new Date(),
): NoteGroup<T>[] {
  const currentYear = todayIn(timeZone, now).year;
  const groups: NoteGroup<T>[] = [];
  for (const note of notes) {
    if (note.pinned) {
      const first = groups[0];
      if (first?.pinned) first.notes.push(note);
      else groups.unshift({ key: 'pinned', pinned: true, notes: [note] });
      continue;
    }
    const { year, month } = todayIn(timeZone, new Date(note.updatedAt));
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.notes.push(note);
    else groups.push({ key, pinned: false, year, month, thisYear: year === currentYear, notes: [note] });
  }
  return groups;
}
