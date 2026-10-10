import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { zonedDateTimeToUtc } from '@/lib/calendar/timeZone';

// F3 — how far ahead and how many notifications one device keeps pending (OS limit; iOS ≤ 64).
export const REMINDER_HORIZON_DAYS = 30;
export const MAX_PENDING_REMINDERS = 60;
// The longest threshold ("1 week before"): occurrences up to this far past the horizon can still remind inside it.
export const LONGEST_REMINDER_DAYS = 7;
// All-day events remind relative to 9:00 on their start day.
const ALL_DAY_HOUR = 9;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export type ReminderSource = {
  eventId: string;
  occurrenceDate: string; // 'YYYY-MM-DD' — opens this lap's detail screen
  allDay: boolean;
  startsAt: string | null;
  startDate: string | null;
  reminderMinutes: number[];
};

export type PlannedReminder<T extends ReminderSource> = { at: Date; occurrence: T };

function startInstant(o: ReminderSource, timeZone: string): Date {
  if (!o.allDay) return new Date(o.startsAt!);
  return zonedDateTimeToUtc(parseIsoDate(o.startDate!), { hour: ALL_DAY_HOUR, minute: 0, second: 0 }, timeZone);
}

// Every (occurrence × threshold) firing after `now` and within the horizon, soonest first, capped.
export function pickReminders<T extends ReminderSource>(
  occurrences: T[],
  now: Date,
  timeZone: string,
  horizonDays: number = REMINDER_HORIZON_DAYS,
  max: number = MAX_PENDING_REMINDERS,
): PlannedReminder<T>[] {
  const until = now.getTime() + horizonDays * DAY;
  const planned: PlannedReminder<T>[] = [];
  for (const occurrence of occurrences) {
    const start = startInstant(occurrence, timeZone).getTime();
    for (const minutes of new Set(occurrence.reminderMinutes)) {
      const at = start - minutes * MINUTE;
      if (at > now.getTime() && at <= until) planned.push({ at: new Date(at), occurrence });
    }
  }
  return planned.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, max);
}
