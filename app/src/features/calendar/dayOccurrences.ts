import type { EventOccurrence } from '@/features/events/occurrences';
import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { DEFAULT_TIME_ZONE, todayIn } from '@/lib/calendar/timeZone';
import { jdFromDate, type SolarDate } from '@/lib/lunar';

function occurrenceRange(occ: EventOccurrence, timeZone: string): { start: number; end: number } {
  if (occ.allDay) {
    return { start: jdFromDate(parseIsoDate(occ.startDate!)), end: jdFromDate(parseIsoDate(occ.endDate!)) };
  }
  return {
    start: jdFromDate(todayIn(timeZone, new Date(occ.startsAt!))),
    end: jdFromDate(todayIn(timeZone, new Date(occ.endsAt!))),
  };
}

// Occurrences whose span covers `day` — a multi-day event shows on every day it covers (F1).
export function occurrencesOnDay(all: EventOccurrence[], day: SolarDate, timeZone: string = DEFAULT_TIME_ZONE): EventOccurrence[] {
  const jd = jdFromDate(day);
  return all.filter((occ) => {
    const { start, end } = occurrenceRange(occ, timeZone);
    return jd >= start && jd <= end;
  });
}
