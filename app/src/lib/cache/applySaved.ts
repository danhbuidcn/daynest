import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { jdFromDate, jdToDate } from '@/lib/lunar';

export type Span = { span_start: string; span_end: string };

const shift = (iso: string, days: number) => isoDate(jdToDate(jdFromDate(parseIsoDate(iso)) + days));

// Same test the server runs in fetchEvents/fetchTodos (one day of slack each side, ISO strings
// compare in date order, 'infinity' sorts last) — so the cache holds what a refetch would return.
export function spanTouchesRange(span: Span, from: string, to: string): boolean {
  return span.span_start <= shift(to, 1) && span.span_end >= shift(from, -1);
}

// A saved row put into the data of one loaded range: replaced where it is there, added where its
// span reaches the range, dropped where it no longer does (a date moved out of the range).
export function putRow<R extends { id: string }>(rows: R[], saved: R, span: Span, from: string, to: string): R[] {
  const others = rows.filter((r) => r.id !== saved.id);
  if (!spanTouchesRange(span, from, to)) return others;
  const at = rows.findIndex((r) => r.id === saved.id);
  return at < 0 ? [...others, saved] : rows.map((r) => (r.id === saved.id ? saved : r));
}

export function removeRow<R extends { id: string }>(rows: R[], id: string): R[] {
  return rows.some((r) => r.id === id) ? rows.filter((r) => r.id !== id) : rows;
}

// One exception row (keyed by its parent and lap date) replaced or added.
export function putException<X extends { id: string }>(
  exceptions: X[],
  saved: X,
  sameLap: (x: X) => boolean,
): X[] {
  return [...exceptions.filter((x) => !sameLap(x)), saved];
}
