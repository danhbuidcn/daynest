export type BudgetLevel = 'ok' | 'warn' | 'over';

// month key = first day of the month, "2026-10-01" (same as `expense_month_budgets.month`).
export const monthKey = (year: number, month: number): string => `${year}-${String(month).padStart(2, '0')}-01`;

// A month row wins over the general budget, even when its amount is null ("no budget this month").
export function budgetForMonth(
  general: number | null,
  overrides: Readonly<Record<string, number | null>>,
  key: string,
): { amount: number; kind: 'general' | 'month' } | null {
  if (key in overrides) {
    const own = overrides[key];
    return own == null ? null : { amount: own, kind: 'month' };
  }
  return general == null ? null : { amount: general, kind: 'general' };
}

export function budgetProgress(spent: number, amount: number): { percent: number; remaining: number; level: BudgetLevel } {
  const percent = Math.round((spent / amount) * 100);
  const ratio = spent / amount;
  return { percent, remaining: amount - spent, level: ratio > 1 ? 'over' : ratio >= 0.8 ? 'warn' : 'ok' };
}
