import { addMonths, type WeekStart } from '@/lib/calendar/monthGrid';
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
