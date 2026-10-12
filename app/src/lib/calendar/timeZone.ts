import { jdFromDate, jdToDate, type SolarDate } from '@/lib/lunar';

export const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

// Building an Intl.DateTimeFormat costs ~0.1–1 ms on Hermes and the month grid needs thousands
// of conversions per render, so each (kind, time zone) formatter is built once and reused.
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(kind: string, timeZone: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${kind}|${timeZone}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, ...options });
    formatters.set(key, f);
  }
  return f;
}

// "Today" follows the user's chosen time zone (F6), not the device's.
export function todayIn(timeZone: string = DEFAULT_TIME_ZONE, now: Date = new Date()): SolarDate {
  try {
    const parts = formatter('date', timeZone, { year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return { year: get('year'), month: get('month'), day: get('day') };
  } catch {
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }
}

export type TimeOfDay = { hour: number; minute: number; second: number };

// Wall-clock time of `date` as seen in `timeZone`.
export function timeOfDayIn(date: Date, timeZone: string = DEFAULT_TIME_ZONE): TimeOfDay {
  try {
    const parts = formatter('time', timeZone, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const hour = get('hour');
    return { hour: hour === 24 ? 0 : hour, minute: get('minute'), second: get('second') };
  } catch {
    return { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() };
  }
}

// Minutes to add to a UTC instant to get `timeZone`'s wall-clock time at that instant.
export function tzOffsetMinutesAt(date: Date, timeZone: string): number {
  try {
    const parts = formatter('dateTime', timeZone, {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(date);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const hour = get('hour');
    const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hour === 24 ? 0 : hour, get('minute'), get('second'));
    return Math.round((asUtc - date.getTime()) / 60000);
  } catch {
    return -date.getTimezoneOffset();
  }
}

// The UTC instant whose wall-clock time in `timeZone` is `date` + `time`.
export function zonedDateTimeToUtc(date: SolarDate, time: TimeOfDay, timeZone: string = DEFAULT_TIME_ZONE): Date {
  const guess = Date.UTC(date.year, date.month - 1, date.day, time.hour, time.minute, time.second);
  const offsetMinutes = tzOffsetMinutesAt(new Date(guess), timeZone);
  return new Date(guess - offsetMinutes * 60000);
}

// `period` is null in 24h mode; the caller supplies the "SA"/"CH" (vi) or "AM"/"PM" (en) text via i18n.
export type ClockParts = { text: string; period: 'am' | 'pm' | null };

export function clockParts(time: TimeOfDay, use24h: boolean): ClockParts {
  const pad = (n: number) => String(n).padStart(2, '0');
  if (use24h) return { text: `${pad(time.hour)}:${pad(time.minute)}`, period: null };
  const period: 'am' | 'pm' = time.hour < 12 ? 'am' : 'pm';
  const hour12 = time.hour % 12 === 0 ? 12 : time.hour % 12;
  return { text: `${hour12}:${pad(time.minute)}`, period };
}

// Shifts a timed instant by `deltaDays` calendar days, keeping its wall-clock time of day in `timeZone`.
export function shiftByDays(instant: Date, deltaDays: number, timeZone: string = DEFAULT_TIME_ZONE): Date {
  if (deltaDays === 0) return instant;
  const date = todayIn(timeZone, instant);
  const shifted = jdToDate(jdFromDate(date) + deltaDays);
  return zonedDateTimeToUtc(shifted, timeOfDayIn(instant, timeZone), timeZone);
}
