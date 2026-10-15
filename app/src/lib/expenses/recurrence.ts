import { addMonths, weekdayOf } from '@/lib/calendar/monthGrid';
import { addDays } from '@/lib/calendar/week';
import type { SolarDate } from '@/lib/lunar';
import { daysInMonth } from './index';

export const FREQUENCIES = ['weekly', 'monthly'] as const;
export type Frequency = (typeof FREQUENCIES)[number];

// db.md: weekly keeps the ISO weekday (1 = Monday … 7 = Sunday), monthly keeps the day of month.
export function anchorOf(frequency: Frequency, date: SolarDate): number {
  if (frequency === 'monthly') return date.day;
  return weekdayOf(date) || 7;
}

// Same rule as `generate_due_expenses`: a short month falls back to its last day, but the anchor
// stays, so 31 → 30 → 31 does not drift.
export function nextDueDate(frequency: Frequency, anchorDay: number, from: SolarDate): SolarDate {
  if (frequency === 'weekly') return addDays(from, 7);
  const { year, month } = addMonths(from.year, from.month, 1);
  return { year, month, day: Math.min(anchorDay, daysInMonth(year, month)) };
}
