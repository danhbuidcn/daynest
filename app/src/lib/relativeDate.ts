export type RelativeMoment =
  | { kind: 'today'; hour: number; minute: number }
  | { kind: 'yesterday'; hour: number; minute: number }
  | { kind: 'date'; day: number; month: number; year: number };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function toRelativeMoment(date: Date, now: Date = new Date()): RelativeMoment {
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (diffDays === 0) return { kind: 'today', hour: date.getHours(), minute: date.getMinutes() };
  if (diffDays === 1) return { kind: 'yesterday', hour: date.getHours(), minute: date.getMinutes() };
  return { kind: 'date', day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
}
