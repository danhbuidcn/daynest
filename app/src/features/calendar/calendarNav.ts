import { addMonths, monthGrid, type WeekStart } from '@/lib/calendar/monthGrid';
import { addDays, weekDates } from '@/lib/calendar/week';
import { jdFromDate, type SolarDate } from '@/lib/lunar';
import type { ViewMode } from './ViewModeBar';

function daysInMonth(year: number, month: number): number {
  const next = addMonths(year, month, 1);
  return jdFromDate({ ...next, day: 1 }) - jdFromDate({ year, month, day: 1 });
}

// `‹ ›` and swipes: one month, one week (week + list views) or one day.
export function shiftCursor(mode: ViewMode, cursor: SolarDate, delta: number): SolarDate {
  if (mode === 'month') {
    const target = addMonths(cursor.year, cursor.month, delta);
    return { ...target, day: Math.min(cursor.day, daysInMonth(target.year, target.month)) };
  }
  return addDays(cursor, mode === 'day' ? delta : delta * 7);
}

// Events are loaded for the days on screen (F1). Day view loads its whole week so
// swiping between days of that week needs no extra round trip.
export function periodRange(mode: ViewMode, cursor: SolarDate, weekStart: WeekStart): { from: SolarDate; to: SolarDate } {
  const days = mode === 'month' ? monthGrid(cursor.year, cursor.month, weekStart) : weekDates(cursor, weekStart);
  const strip = (d: SolarDate): SolarDate => ({ year: d.year, month: d.month, day: d.day });
  return { from: strip(days[0]), to: strip(days[days.length - 1]) };
}
