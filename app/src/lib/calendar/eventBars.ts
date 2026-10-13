// F1 — month cell bars: holidays always lead, then events in their given order; capped at `max`
// with the rest folded into an "+N" count.
// `todo`: the bar of a todo (S5), drawn with a small round tick at its start.
export type BarItem = { kind: 'holiday' | 'event'; id: string; title: string; color?: string; todo?: { done: boolean } };

export const MAX_BARS = 3;

export function dayBars(items: BarItem[], max: number = MAX_BARS): { shown: BarItem[]; extra: number } {
  const sorted = [...items].sort((a, b) => (a.kind === 'holiday' ? 0 : 1) - (b.kind === 'holiday' ? 0 : 1));
  return { shown: sorted.slice(0, max), extra: Math.max(0, sorted.length - max) };
}
