import { jdFromDate, jdToDate, type SolarDate } from '@/lib/lunar';

// Matches user_settings.week_start: 0 = Sunday, 1 = Monday.
export type WeekStart = 0 | 1;

export type GridDay = SolarDate & { weekday: number; inMonth: boolean };

export const GRID_DAYS = 42;

export function weekdayOf(date: SolarDate): number {
  return (jdFromDate(date) + 1) % 7;
}

export function weekdayOrder(weekStart: WeekStart): number[] {
  return Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);
}

export function monthGrid(year: number, month: number, weekStart: WeekStart): GridDay[] {
  const first = { year, month, day: 1 };
  const lead = (weekdayOf(first) - weekStart + 7) % 7;
  const start = jdFromDate(first) - lead;
  return Array.from({ length: GRID_DAYS }, (_, i) => {
    const d = jdToDate(start + i);
    return { ...d, weekday: (start + i + 1) % 7, inMonth: d.month === month };
  });
}

export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function sameDay(a: SolarDate, b: SolarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}
