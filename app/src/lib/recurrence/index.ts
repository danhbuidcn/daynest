// Pure recurrence expansion for events (F2). Works on calendar dates only — callers combine the
// returned dates with the event's own time/duration to build full occurrences.
import { isoDate } from '@/lib/calendar/monthGrid';
import { jdFromDate, jdToDate, lunarMonthLength, toLunar, toSolar, type SolarDate } from '@/lib/lunar';

export type RepeatKind = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lunar_yearly';

export type RecurrenceRule = {
  repeat: RepeatKind;
  startDate: SolarDate;
  // 1-99, default 1. Ignored for 'none' and 'lunar_yearly' (always every single year).
  interval?: number;
  // null/undefined = never ends.
  until?: SolarDate | null;
  // Required for 'lunar_yearly' — the lunar day/month to repeat on (never a leap month).
  lunarMonth?: number;
  lunarDay?: number;
};

export type DateRange = { from: SolarDate; to: SolarDate };

export type Exception<T = unknown> = { date: SolarDate; kind: 'skip' | 'override'; data?: T };
export type Occurrence<T = unknown> = { date: SolarDate; override?: T };

export const dateKey = isoDate;

function cmp(a: SolarDate, b: SolarDate): number {
  return jdFromDate(a) - jdFromDate(b);
}

function solarDaysInMonth(year: number, month: number): number {
  const nextMonthFirst = month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 };
  return jdFromDate(nextMonthFirst) - jdFromDate({ year, month, day: 1 });
}

function monthIndex(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function fromMonthIndex(idx: number): { year: number; month: number } {
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

// Every `stepDays` days from `startDate`, bounded by [from, to] (inclusive, already intersected
// with the rule's own start/until by the caller).
function expandByDayStep(startDate: SolarDate, stepDays: number, from: SolarDate, to: SolarDate): SolarDate[] {
  const startJd = jdFromDate(startDate);
  const fromJd = jdFromDate(from);
  const toJd = jdFromDate(to);
  if (toJd < startJd || toJd < fromJd || stepDays <= 0) return [];
  const kMin = Math.max(0, Math.ceil((fromJd - startJd) / stepDays));
  const kMax = Math.floor((toJd - startJd) / stepDays);
  const result: SolarDate[] = [];
  for (let k = kMin; k <= kMax; k++) result.push(jdToDate(startJd + k * stepDays));
  return result;
}

// Every `stepMonths` months on the same day-of-month as `startDate`; a month without that day
// (e.g. 31 in April) is skipped entirely — never clamped to the last day.
function expandByMonthStep(startDate: SolarDate, stepMonths: number, from: SolarDate, to: SolarDate): SolarDate[] {
  if (stepMonths <= 0) return [];
  const startIdx = monthIndex(startDate.year, startDate.month);
  const toJd = jdFromDate(to);
  const fromJd = jdFromDate(from);
  const result: SolarDate[] = [];
  // Safety cap: bounds how far we scan when `until` is unset (never) — plenty for any realistic view range.
  const MAX_STEPS = 20000;
  for (let k = 0, steps = 0; steps < MAX_STEPS; k++, steps++) {
    const { year, month } = fromMonthIndex(startIdx + k * stepMonths);
    const firstOfMonthJd = jdFromDate({ year, month, day: 1 });
    if (firstOfMonthJd > toJd) break;
    if (startDate.day <= solarDaysInMonth(year, month)) {
      const date = { year, month, day: startDate.day };
      const jd = jdFromDate(date);
      if (jd >= fromJd && jd <= toJd) result.push(date);
    }
  }
  return result;
}

function expandLunarYearly(lunarMonth: number, lunarDay: number, anchorYear: number, from: SolarDate, to: SolarDate): SolarDate[] {
  const fromJd = jdFromDate(from);
  const toJd = jdFromDate(to);
  const yearFrom = Math.max(anchorYear, jdToDate(fromJd).year - 1);
  const yearTo = jdToDate(toJd).year + 1;
  const result: SolarDate[] = [];
  for (let year = yearFrom; year <= yearTo; year++) {
    const len = lunarMonthLength(lunarMonth, year, false);
    // Day 30 in a 29-day (thiếu) lunar month falls back to 29 — never skipped.
    const day = Math.min(lunarDay, len);
    const solar = toSolar(day, lunarMonth, year, false);
    if (!solar) continue;
    const jd = jdFromDate(solar);
    if (jd >= fromJd && jd <= toJd) result.push(solar);
  }
  return result;
}

// Calendar dates this rule occurs on within `range`, bounded by the rule's own start/until.
export function expandRule(rule: RecurrenceRule, range: DateRange): SolarDate[] {
  const until = rule.until ?? null;
  const lower = cmp(range.from, rule.startDate) > 0 ? range.from : rule.startDate;
  const upper = until && cmp(until, range.to) < 0 ? until : range.to;
  if (cmp(lower, upper) > 0) return [];

  switch (rule.repeat) {
    case 'none':
      return cmp(rule.startDate, lower) >= 0 && cmp(rule.startDate, upper) <= 0 ? [rule.startDate] : [];
    case 'daily':
      return expandByDayStep(rule.startDate, rule.interval ?? 1, lower, upper);
    case 'weekly':
      return expandByDayStep(rule.startDate, (rule.interval ?? 1) * 7, lower, upper);
    case 'monthly':
      return expandByMonthStep(rule.startDate, rule.interval ?? 1, lower, upper);
    case 'yearly':
      return expandByMonthStep(rule.startDate, (rule.interval ?? 1) * 12, lower, upper);
    case 'lunar_yearly': {
      if (!rule.lunarMonth || !rule.lunarDay) return [];
      const anchorYear = toLunar(rule.startDate).year;
      return expandLunarYearly(rule.lunarMonth, rule.lunarDay, anchorYear, lower, upper);
    }
    default:
      return [];
  }
}

// Removes `skip` dates and attaches `override` data to the matching date.
export function applyExceptions<T>(dates: SolarDate[], exceptions: Exception<T>[]): Occurrence<T>[] {
  const skip = new Set<string>();
  const overrides = new Map<string, T | undefined>();
  for (const e of exceptions) {
    const key = dateKey(e.date);
    if (e.kind === 'skip') skip.add(key);
    else overrides.set(key, e.data);
  }
  return dates.filter((d) => !skip.has(dateKey(d))).map((d) => {
    const key = dateKey(d);
    return overrides.has(key) ? { date: d, override: overrides.get(key) } : { date: d };
  });
}

// expandRule + applyExceptions in one call — the final list of occurrences for a rule in `range`.
export function occurrences<T>(rule: RecurrenceRule, range: DateRange, exceptions: Exception<T>[] = []): Occurrence<T>[] {
  return applyExceptions(expandRule(rule, range), exceptions);
}
