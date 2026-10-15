// Pop-up of one category (spec S6 §10): its expenses in the period, newest day first, grouped by day.
export type DayGroup<T> = { date: string; items: T[]; total: number };

export function groupByDay<T extends { categoryId: string; spentOn: string; amount: number }>(expenses: readonly T[], categoryId: string): DayGroup<T>[] {
  const groups = new Map<string, DayGroup<T>>();
  for (const e of expenses) {
    if (e.categoryId !== categoryId) continue;
    const group = groups.get(e.spentOn) ?? { date: e.spentOn, items: [], total: 0 };
    group.items.push(e);
    group.total += e.amount;
    groups.set(e.spentOn, group);
  }
  return [...groups.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
