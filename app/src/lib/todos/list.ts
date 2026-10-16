// Todo list of the Ghi chú tab (S5): 3 groups around the chosen day `x` (Julian day numbers,
// already in the user's time zone). `order` is the start key within a day (all-day before timed).
export type ListSpan = {
  start: number;
  end: number;
  done: boolean;
  order: string;
};
export type TodoListGroups<T> = { overdue: T[]; day: T[]; upcoming: T[] };

export const OVERDUE_DAYS = 1;
export const UPCOMING_DAYS = 1;

export function groupTodoList<T>(items: T[], span: (item: T) => ListSpan, x: number): TodoListGroups<T> {
  const all = items.map((item) => ({ item, s: span(item) }));
  const byOrder = (a: ListSpan, b: ListSpan) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0);
  // A todo spanning several days counts as overdue once its last day has passed.
  const overdue = all.filter(({ s }) => !s.done && s.end < x && s.end >= x - OVERDUE_DAYS).sort((a, b) => b.s.end - a.s.end || byOrder(a.s, b.s));
  const day = all.filter(({ s }) => s.start <= x && s.end >= x).sort((a, b) => Number(a.s.done) - Number(b.s.done) || byOrder(a.s, b.s));
  const upcoming = all.filter(({ s }) => !s.done && s.start > x && s.start <= x + UPCOMING_DAYS).sort((a, b) => a.s.start - b.s.start || byOrder(a.s, b.s));
  const pick = (list: typeof all) => list.map(({ item }) => item);
  return { overdue: pick(overdue), day: pick(day), upcoming: pick(upcoming) };
}
