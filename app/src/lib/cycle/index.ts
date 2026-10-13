import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { jdFromDate, jdToDate } from '@/lib/lunar';

// Menstrual cycle (S5): `period_days` rows → periods → predicted next periods. All dates are `YYYY-MM-DD`.
export type Period = { start: string; end: string; length: number };
export type PredictedPeriod = { start: string; end: string; lateDays: number };

export const CYCLE_MIN_GAP = 15;
export const CYCLE_MAX_GAP = 60;
export const CYCLE_SAMPLE = 6;
export const PREDICTION_COUNT = 3;

const jd = (iso: string) => jdFromDate(parseIsoDate(iso));
const fromJd = (n: number) => isoDate(jdToDate(n));

export const addDays = (iso: string, days: number) => fromJd(jd(iso) + days);
export const daysBetween = (fromIso: string, toIso: string) => jd(toIso) - jd(fromIso);

// A period is a run of consecutive days; its start is the first day of the run.
export function groupPeriods(days: string[]): Period[] {
  const sorted = [...new Set(days)].sort();
  const periods: Period[] = [];
  for (const day of sorted) {
    const last = periods[periods.length - 1];
    if (last && daysBetween(last.end, day) === 1) {
      last.end = day;
      last.length += 1;
    } else {
      periods.push({ start: day, end: day, length: 1 });
    }
  }
  return periods;
}

// Mean gap between the starts of the latest 6 periods; gaps outside 15–60 days (forgotten entries) are dropped.
export function cycleLength(periods: Period[], fallback: number): number {
  const recent = periods.slice(-(CYCLE_SAMPLE + 1));
  const gaps: number[] = [];
  for (let i = 1; i < recent.length; i += 1) {
    const gap = daysBetween(recent[i - 1].start, recent[i].start);
    if (gap >= CYCLE_MIN_GAP && gap <= CYCLE_MAX_GAP) gaps.push(gap);
  }
  if (periods.length < 2 || gaps.length === 0) return fallback;
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
}

export function periodLength(periods: Period[], fallback: number): number {
  if (periods.length === 0) return fallback;
  return Math.round(periods.reduce((a, p) => a + p.length, 0) / periods.length);
}

// Next 3 periods. Past the predicted day with nothing logged, the first one moves to today ("late N days").
export function predictPeriods(
  periods: Period[],
  today: string,
  settings: { cycleLength: number; periodLength: number },
  count = PREDICTION_COUNT,
): PredictedPeriod[] {
  const latest = periods[periods.length - 1];
  if (!latest) return [];
  const cycle = cycleLength(periods, settings.cycleLength);
  const length = periodLength(periods, settings.periodLength);
  let start = addDays(latest.start, cycle);
  let lateDays = 0;
  if (start < today) {
    lateDays = daysBetween(start, today);
    start = today;
  }
  const result: PredictedPeriod[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push({ start, end: addDays(start, length - 1), lateDays: i === 0 ? lateDays : 0 });
    start = addDays(start, cycle);
  }
  return result;
}

// Tapping a day that touches no logged period starts a new one: tick `length` days, never past today.
export function autoTickDays(day: string, logged: Set<string>, today: string, length: number): string[] {
  if (day > today || logged.has(day) || logged.has(addDays(day, -1)) || logged.has(addDays(day, 1))) return [day];
  const days: string[] = [];
  for (let i = 0; i < length; i += 1) {
    const d = addDays(day, i);
    if (d > today) break;
    days.push(d);
  }
  return days;
}

export type CycleDay =
  | { kind: 'period'; dayNumber: number }
  | { kind: 'predicted'; isStart: boolean; daysUntil: number; lateDays: number };

// What the calendar shows on `day`: a logged period day, a predicted one, or nothing.
export function cycleOnDay(day: string, periods: Period[], predicted: PredictedPeriod[], today: string): CycleDay | null {
  const period = periods.find((p) => day >= p.start && day <= p.end);
  if (period) return { kind: 'period', dayNumber: daysBetween(period.start, day) + 1 };
  const next = predicted.find((p) => day >= p.start && day <= p.end);
  if (!next) return null;
  return { kind: 'predicted', isStart: day === next.start, daysUntil: daysBetween(today, next.start), lateDays: day === next.start ? next.lateDays : 0 };
}

// Notification times: `daysBefore` the predicted start of the next period that is still ahead.
export function reminderDates(predicted: PredictedPeriod[], today: string, daysBefore: number): { date: string; start: string }[] {
  return predicted
    .map((p) => ({ date: addDays(p.start, -daysBefore), start: p.start }))
    .filter((r) => r.date >= today);
}
