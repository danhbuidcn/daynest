import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { zonedDateTimeToUtc } from '@/lib/calendar/timeZone';

// Daily digest: one pending notification per morning (this many days ahead) and one for this evening. Kept small
// because the OS caps pending notifications (iOS ≤ 64) and event reminders already use up to MAX_PENDING_REMINDERS.
export const DIGEST_MORNING_DAYS = 7;
// Titles shown in the morning body before "…".
export const DIGEST_TITLES = 3;

export type DigestDay = { date: string; total: number; done: number; titles: string[] };
export type DigestConfig = { morning: string | null; evening: string | null }; // "HH:MM", or null = off
export type PlannedDigest =
  | { kind: 'morning'; at: Date; date: string; total: number; titles: string[]; more: boolean }
  | { kind: 'evening'; at: Date; date: string; total: number; done: number };

function at(date: string, time: string, timeZone: string): Date {
  const [hour, minute] = time.split(':').map(Number);
  return zonedDateTimeToUtc(parseIsoDate(date), { hour, minute, second: 0 }, timeZone);
}

// `days` start at today. A day without todos sends nothing. The evening count is the state at planning time,
// so only today's evening is planned — a later day would promise "0 done" before it has happened.
export function planDigests(days: DigestDay[], config: DigestConfig, now: Date, timeZone: string): PlannedDigest[] {
  const planned: PlannedDigest[] = [];
  days.forEach((day, i) => {
    if (day.total === 0) return;
    if (config.morning && i < DIGEST_MORNING_DAYS) {
      const when = at(day.date, config.morning, timeZone);
      if (when.getTime() > now.getTime()) {
        planned.push({ kind: 'morning', at: when, date: day.date, total: day.total, titles: day.titles.slice(0, DIGEST_TITLES), more: day.titles.length > DIGEST_TITLES });
      }
    }
    if (config.evening && i === 0) {
      const when = at(day.date, config.evening, timeZone);
      if (when.getTime() > now.getTime()) planned.push({ kind: 'evening', at: when, date: day.date, total: day.total, done: day.done });
    }
  });
  return planned;
}
