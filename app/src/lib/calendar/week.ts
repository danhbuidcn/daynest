import { jdFromDate, jdToDate, type SolarDate } from '@/lib/lunar';
import { weekdayOf, type WeekStart } from './monthGrid';

export function addDays(date: SolarDate, delta: number): SolarDate {
  return jdToDate(jdFromDate(date) + delta);
}

export function startOfWeek(date: SolarDate, weekStart: WeekStart): SolarDate {
  return addDays(date, -((weekdayOf(date) - weekStart + 7) % 7));
}

export function weekDates(date: SolarDate, weekStart: WeekStart): SolarDate[] {
  const first = startOfWeek(date, weekStart);
  return Array.from({ length: 7 }, (_, i) => addDays(first, i));
}
