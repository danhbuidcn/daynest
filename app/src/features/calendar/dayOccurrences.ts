import type { EventOccurrence } from '@/features/events/occurrences';
import type { TodoOccurrence } from '@/features/todos/todo';
import type { TimedSpan } from '@/lib/calendar/dayLayout';
import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { DEFAULT_TIME_ZONE, timeOfDayIn, todayIn } from '@/lib/calendar/timeZone';
import { jdFromDate, type SolarDate } from '@/lib/lunar';
import type { ListSpan } from '@/lib/todos/list';

function occurrenceRange(occ: EventOccurrence, timeZone: string): { start: number; end: number } {
  if (occ.allDay) {
    return { start: jdFromDate(parseIsoDate(occ.startDate!)), end: jdFromDate(parseIsoDate(occ.endDate!)) };
  }
  const start = jdFromDate(todayIn(timeZone, new Date(occ.startsAt!)));
  const endsAt = new Date(occ.endsAt!);
  const endDay = jdFromDate(todayIn(timeZone, endsAt));
  // Ending exactly at 00:00 (e.g. 23:00 – 00:00) doesn't reach into the next day.
  const t = timeOfDayIn(endsAt, timeZone);
  const atMidnight = t.hour === 0 && t.minute === 0 && t.second === 0;
  return { start, end: atMidnight && endDay > start ? endDay - 1 : endDay };
}

// Occurrences whose span covers `day` — a multi-day event shows on every day it covers (F1).
export function occurrencesOnDay(all: EventOccurrence[], day: SolarDate, timeZone: string = DEFAULT_TIME_ZONE): EventOccurrence[] {
  const jd = jdFromDate(day);
  return all.filter((occ) => {
    const { start, end } = occurrenceRange(occ, timeZone);
    return jd >= start && jd <= end;
  });
}

// Display order inside one day: all-day first, then by start time.
export function byStartTime(a: EventOccurrence, b: EventOccurrence): number {
  if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
  const ka = a.allDay ? a.startDate! : a.startsAt!;
  const kb = b.allDay ? b.startDate! : b.startsAt!;
  return ka < kb ? -1 : ka > kb ? 1 : 0;
}

export function isTodo(occ: EventOccurrence): occ is TodoOccurrence {
  return 'status' in occ;
}

// Calendar order inside one day (S5): events, then todos not done, then done todos — each by start.
export function calendarOrder(a: EventOccurrence, b: EventOccurrence): number {
  const rank = (o: EventOccurrence) => (!isTodo(o) ? 0 : o.status.done ? 2 : 1);
  return rank(a) - rank(b) || byStartTime(a, b);
}

// Input of `groupTodoList` (lib/todos/list): the days a todo covers in `timeZone`, all-day first.
export function todoListSpan(occ: TodoOccurrence, timeZone: string): ListSpan {
  const { start, end } = occurrenceRange(occ, timeZone);
  return { start, end, done: occ.status.done, order: occ.allDay ? '0' : `1${occ.startsAt}` };
}

export function occurrenceKey(occ: EventOccurrence): string {
  return `${occ.eventId}-${occ.occurrenceDate}`;
}

function minutesFromDayStart(instant: string, dayJd: number, timeZone: string): number {
  const date = new Date(instant);
  const time = timeOfDayIn(date, timeZone);
  return (jdFromDate(todayIn(timeZone, date)) - dayJd) * 24 * 60 + time.hour * 60 + time.minute;
}

export type OccurrenceSpan = TimedSpan & { occurrence: EventOccurrence };

// Day view blocks: timed occurrences on `day`, in minutes from that day's 00:00 (all-day ones go to the "Cả ngày" row).
export function timedSpansOnDay(all: EventOccurrence[], day: SolarDate, timeZone: string = DEFAULT_TIME_ZONE): OccurrenceSpan[] {
  const jd = jdFromDate(day);
  return occurrencesOnDay(all, day, timeZone)
    .filter((occ) => !occ.allDay)
    .map((occ) => ({
      id: occurrenceKey(occ),
      start: minutesFromDayStart(occ.startsAt!, jd, timeZone),
      end: minutesFromDayStart(occ.endsAt!, jd, timeZone),
      occurrence: occ,
    }));
}
