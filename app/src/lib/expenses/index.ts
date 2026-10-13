import { addMonths, isoDate, parseIsoDate, type WeekStart } from '@/lib/calendar/monthGrid';
import { addDays, startOfWeek } from '@/lib/calendar/week';
import { jdFromDate, type SolarDate } from '@/lib/lunar';

export const PERIOD_MODES = ['day', 'week', 'month'] as const;
export type PeriodMode = (typeof PERIOD_MODES)[number];

export const MAX_AMOUNT = 100_000_000_000;

export function daysInMonth(year: number, month: number): number {
  const next = addMonths(year, month, 1);
  return jdFromDate({ ...next, day: 1 }) - jdFromDate({ year, month, day: 1 });
}

// The days a period covers, both ends included; weeks follow the `week_start` setting.
export function periodRange(mode: PeriodMode, cursor: SolarDate, weekStart: WeekStart): { from: SolarDate; to: SolarDate } {
  if (mode === 'day') return { from: cursor, to: cursor };
  if (mode === 'week') {
    const from = startOfWeek(cursor, weekStart);
    return { from, to: addDays(from, 6) };
  }
  const { year, month } = cursor;
  return { from: { year, month, day: 1 }, to: { year, month, day: daysInMonth(year, month) } };
}

// `‹ ›`: one day, week or month; a month keeps the day when it exists (31/10 → 30/11).
export function shiftPeriod(mode: PeriodMode, cursor: SolarDate, delta: number): SolarDate {
  if (mode === 'month') {
    const target = addMonths(cursor.year, cursor.month, delta);
    return { ...target, day: Math.min(cursor.day, daysInMonth(target.year, target.month)) };
  }
  return addDays(cursor, mode === 'day' ? delta : delta * 7);
}

export type CategoryTotal = { categoryId: string; amount: number; percent: number };

// "Theo nhóm": most spent first; ties keep the order the categories first appear in.
export function totalsByCategory(expenses: readonly { categoryId: string; amount: number }[]): CategoryTotal[] {
  const sums = new Map<string, number>();
  for (const e of expenses) sums.set(e.categoryId, (sums.get(e.categoryId) ?? 0) + e.amount);
  const total = sumAmounts(expenses);
  return [...sums]
    .map(([categoryId, amount]) => ({ categoryId, amount, percent: total ? Math.round((amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

export function sumAmounts(expenses: readonly { amount: number }[]): number {
  return expenses.reduce((s, e) => s + e.amount, 0);
}

// Hermes ships without full Intl locale data, so the "50.000" grouping is done by hand.
export function groupThousands(n: number): string {
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// VND in both languages (spec: "50.000 ₫").
export function formatVnd(n: number): string {
  return `${groupThousands(n)} ₫`;
}

// Typed amount ("50.000", "50000") → whole VND, or null when empty, 0 or above the limit.
export function parseAmount(input: string): number | null {
  const digits = input.replace(/\D/g, '');
  if (!digits) return null;
  const n = Number(digits);
  return n >= 1 && n <= MAX_AMOUNT ? n : null;
}

// "Theo ngày": one bar per day from `from` to `to`, both ends included.
export function dailyTotals(expenses: readonly { spentOn: string; amount: number }[], from: SolarDate, to: SolarDate): number[] {
  const first = jdFromDate(from);
  const totals = new Array<number>(jdFromDate(to) - first + 1).fill(0);
  for (const e of expenses) {
    const i = jdFromDate(parseIsoDate(e.spentOn)) - first;
    if (i >= 0 && i < totals.length) totals[i] += e.amount;
  }
  return totals;
}

// "6 tháng gần đây": the viewed month and the five before it, oldest first.
export const CHART_MONTHS = 6;

export function recentMonths(cursor: SolarDate): { year: number; month: number }[] {
  return Array.from({ length: CHART_MONTHS }, (_, i) => addMonths(cursor.year, cursor.month, i - CHART_MONTHS + 1));
}

export function recentMonthsRange(cursor: SolarDate): { from: SolarDate; to: SolarDate } {
  const first = addMonths(cursor.year, cursor.month, 1 - CHART_MONTHS);
  return { from: { ...first, day: 1 }, to: { year: cursor.year, month: cursor.month, day: daysInMonth(cursor.year, cursor.month) } };
}

// DB rows (`month` = first day, ISO) → one total per chart month; months without rows are 0.
export function monthlyTotals(rows: readonly { month: string; total: number }[], cursor: SolarDate): number[] {
  const sums = new Map(rows.map((r) => [r.month.slice(0, 7), r.total]));
  return recentMonths(cursor).map(({ year, month }) => sums.get(isoDate({ year, month, day: 1 }).slice(0, 7)) ?? 0);
}

// Month axis: 1, 5, 10, 15, 20, 25 and the last day (spec).
export function isMonthAxisDay(day: number, lastDay: number): boolean {
  return day === 1 || day === lastDay || (day % 5 === 0 && day <= 25);
}

// Number over the tallest bar: "2,5tr", "510k".
export function compactVnd(n: number): string {
  const k = Math.round(n / 1000);
  if (k < 1) return groupThousands(n);
  if (k < 1000) return `${k}k`;
  const tenths = Math.round(n / 100_000);
  const rest = tenths % 10;
  return `${groupThousands(Math.floor(tenths / 10))}${rest ? `,${rest}` : ''}tr`;
}

export const NOTE_MAX = 200;

// Amount field: whatever was typed → "50.000" (dots added while typing), capped at 12 digits.
export function formatAmountInput(input: string): string {
  const digits = input.replace(/\D/g, '').replace(/^0+/, '').slice(0, String(MAX_AMOUNT).length);
  return digits ? groupThousands(Number(digits)) : '';
}

// Date row of the form: "Hôm nay, …" / "Hôm qua, …" in front of the date.
export function relativeDay(date: SolarDate, today: SolarDate): 'today' | 'yesterday' | null {
  const diff = jdFromDate(today) - jdFromDate(date);
  return diff === 0 ? 'today' : diff === 1 ? 'yesterday' : null;
}

// Add button of the tab: the viewed day (Ngày), else today when it is in the period, else its first day.
export function defaultSpentOn(mode: PeriodMode, cursor: SolarDate, today: SolarDate, weekStart: WeekStart): SolarDate {
  if (mode === 'day') return cursor;
  const { from, to } = periodRange(mode, cursor, weekStart);
  const t = jdFromDate(today);
  return t >= jdFromDate(from) && t <= jdFromDate(to) ? today : from;
}
