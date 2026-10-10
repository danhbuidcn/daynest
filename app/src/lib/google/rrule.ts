import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { todayIn, zonedDateTimeToUtc } from '@/lib/calendar/timeZone';
import { jdFromDate, jdToDate, type SolarDate } from '@/lib/lunar';
import { expandRule } from '@/lib/recurrence';
import type { DaynestRepeat } from './types';

type SimpleRepeat = Exclude<DaynestRepeat, 'none' | 'lunar_yearly'>;
export type ParsedRepeat = { repeat: DaynestRepeat; interval: number; until: string | null };

const FREQ: Record<SimpleRepeat, string> = { daily: 'DAILY', weekly: 'WEEKLY', monthly: 'MONTHLY', yearly: 'YEARLY' };
const WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const pad = (n: number) => String(n).padStart(2, '0');
const compact = (d: SolarDate) => `${d.year}${pad(d.month)}${pad(d.day)}`;

// RFC 5545 requires UNTIL in UTC for timed events; Daynest's "until" is a whole day in the user's zone.
export function buildRecurrence(repeat: DaynestRepeat, interval: number, until: string | null, allDay: boolean, timeZone: string): string[] {
  if (repeat === 'none' || repeat === 'lunar_yearly') return [];
  let rule = `RRULE:FREQ=${FREQ[repeat]};INTERVAL=${interval}`;
  if (until) {
    const day = parseIsoDate(until);
    if (allDay) rule += `;UNTIL=${compact(day)}`;
    else rule += `;UNTIL=${utcStamp(zonedDateTimeToUtc(day, { hour: 23, minute: 59, second: 59 }, timeZone))}`;
  }
  return [rule];
}

export function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function parseUntil(value: string, timeZone: string): SolarDate | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value);
  if (!m) return null;
  const date = { year: +m[1], month: +m[2], day: +m[3] };
  if (!m[4]) return date;
  if (!m[7]) return date; // floating local time: its calendar date is what the user meant
  return todayIn(timeZone, new Date(Date.UTC(date.year, date.month - 1, date.day, +m[4], +m[5], +m[6])));
}

// Google recurrence → Daynest repeat, or null when it needs more than Daynest's "every N
// days/weeks/months/years until" (several weekdays, BYSETPOS, EXDATE…) — then F4 keeps it read-only.
export function parseRecurrence(lines: string[] | undefined, start: SolarDate, timeZone: string): ParsedRepeat | null {
  if (!lines || lines.length === 0) return { repeat: 'none', interval: 1, until: null };
  if (lines.length !== 1 || !lines[0].startsWith('RRULE:')) return null;
  const parts = new Map(
    lines[0]
      .slice(6)
      .split(';')
      .map((p) => p.split('=') as [string, string]),
  );
  const freq = (Object.keys(FREQ) as SimpleRepeat[]).find((k) => FREQ[k] === parts.get('FREQ'));
  if (!freq) return null;
  for (const key of parts.keys()) {
    if (['FREQ', 'INTERVAL', 'UNTIL', 'COUNT', 'WKST'].includes(key)) continue;
    // Google often spells out the start's own weekday/day/month — that's still the simple rule.
    if (key === 'BYDAY' && freq === 'weekly' && parts.get(key) === WEEKDAYS[(jdFromDate(start) + 1) % 7]) continue;
    if (key === 'BYMONTHDAY' && (freq === 'monthly' || freq === 'yearly') && Number(parts.get(key)) === start.day) continue;
    if (key === 'BYMONTH' && freq === 'yearly' && Number(parts.get(key)) === start.month) continue;
    return null;
  }
  const interval = Number(parts.get('INTERVAL') ?? 1);
  if (!Number.isInteger(interval) || interval < 1 || interval > 99) return null;

  let until: SolarDate | null = null;
  if (parts.has('UNTIL')) {
    until = parseUntil(parts.get('UNTIL')!, timeZone);
    if (!until) return null;
  } else if (parts.has('COUNT')) {
    const count = Number(parts.get('COUNT'));
    if (!Number.isInteger(count) || count < 1) return null;
    // Wide enough for `count` laps even when months without the start day are skipped.
    const to = jdToDate(jdFromDate(start) + count * interval * 400 + 400);
    const dates = expandRule({ repeat: freq, startDate: start, interval }, { from: start, to });
    until = dates[Math.min(count, dates.length) - 1] ?? start;
  }
  return { repeat: freq, interval, until: until ? isoDate(until) : null };
}
