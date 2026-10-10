import { isoDate } from '@/lib/calendar/monthGrid';
import { todayIn, zonedDateTimeToUtc } from '@/lib/calendar/timeZone';
import { utcStamp } from './rrule';
import type { EventFields } from './types';

type ScopeFields = Pick<EventFields, 'allDay' | 'startsAt' | 'endsAt' | 'startDate' | 'endDate' | 'repeat' | 'repeatUntil'>;

// F4 § Phạm vi: at least one lap in `year`. A one-off event only needs to touch the year; a
// solar repeat syncs whole (one rule) when it starts by 31/12 and hasn't ended before 1/1;
// lunar repeats never go to Google.
export function inSyncScope(e: ScopeFields, year: number, timeZone: string): boolean {
  if (e.repeat === 'lunar_yearly') return false;
  const first = `${year}-01-01`;
  const last = `${year}-12-31`;
  const start = e.allDay ? e.startDate! : isoDate(todayIn(timeZone, new Date(e.startsAt!)));
  if (start > last) return false;
  if (e.repeat === 'none') {
    const end = e.allDay ? e.endDate! : isoDate(todayIn(timeZone, new Date(e.endsAt!)));
    return end >= first;
  }
  return !e.repeatUntil || e.repeatUntil >= first;
}

// `events.list` window for a full pull of `year` (F4: timeMin 1/1, timeMax 1/1 next year).
export function yearWindow(year: number, timeZone: string): { timeMin: string; timeMax: string } {
  const midnight = { hour: 0, minute: 0, second: 0 };
  return {
    timeMin: zonedDateTimeToUtc({ year, month: 1, day: 1 }, midnight, timeZone).toISOString(),
    timeMax: zonedDateTimeToUtc({ year: year + 1, month: 1, day: 1 }, midnight, timeZone).toISOString(),
  };
}

// Pushed events reuse the Daynest uuid (hex only — valid in Google's base32hex ids), so a resend
// or two devices pushing at once hit 409 instead of creating a duplicate (F4).
export function googleIdFor(uuid: string): string {
  return uuid.replace(/-/g, '');
}

// Google names a recurring event's lap `<id>_<original start>`: `YYYYMMDD` for all-day,
// `YYYYMMDDTHHMMSSZ` for timed.
export function instanceIdFor(googleId: string, originalStart: { date?: string; dateTime?: string }): string {
  const suffix = originalStart.date ? originalStart.date.replace(/-/g, '') : utcStamp(new Date(originalStart.dateTime!));
  return `${googleId}_${suffix}`;
}
