import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { distance, isNamedColor, toHex, type AppColor, type NamedColor } from '@/lib/colors';
import { jdFromDate, jdToDate } from '@/lib/lunar';
import { buildRecurrence, parseRecurrence } from './rrule';
import type { EventFields, GoogleEvent, GoogleReminders, GoogleTime } from './types';

// F4 § Map trường.
const TO_GOOGLE_COLOR: Record<NamedColor, string> = { mint: '2', sky: '7', lavender: '1', pink: '4', peach: '6', lemon: '5' };
// Google Calendar's 11 event colours as its web UI shows them, by colorId.
const GOOGLE_HEX: Record<string, string> = {
  '1': '#7986CB',
  '2': '#33B679',
  '3': '#8E24AA',
  '4': '#E67C73',
  '5': '#F6BF26',
  '6': '#F4511E',
  '7': '#039BE5',
  '8': '#616161',
  '9': '#3F51B5',
  '10': '#0B8043',
  '11': '#D50000',
};
const FROM_GOOGLE_COLOR: Record<string, NamedColor> = {
  '2': 'mint',
  '7': 'sky',
  '1': 'lavender',
  '4': 'pink',
  '6': 'peach',
  '5': 'lemon',
  '10': 'mint',
  '9': 'sky',
  '3': 'lavender',
  '11': 'pink',
  '8': 'sky',
};

// S4: a hex colour goes up as the nearest of Google's 11; pulling back still maps to the 6 names.
export function toGoogleColorId(c: AppColor): string {
  if (isNamedColor(c)) return TO_GOOGLE_COLOR[c];
  const hex = toHex(c);
  return Object.keys(GOOGLE_HEX).reduce((best, id) => (distance(hex, GOOGLE_HEX[id]) < distance(hex, GOOGLE_HEX[best]) ? id : best));
}

// Pulling back our own push (or a title edit on Google) must not turn a hex colour into a name:
// keep it while Google still shows the colour we sent. Changed on Google → Google's colour wins.
export function keepLocalColor(local: AppColor | null | undefined, colorId: string | undefined, pulled: AppColor): AppColor {
  return local && !isNamedColor(local) && toGoogleColorId(local) === colorId ? local : pulled;
}

// Daynest all-day reminders count back from 9:00, Google's from 0:00.
export const ALL_DAY_REMINDER_SHIFT = 540;
export const TITLE_DB_MAX = 1000;
export const NOTE_DB_MAX = 8000;
const MAX_REMINDERS = 5;

const addDays = (iso: string, days: number) => isoDate(jdToDate(jdFromDate(parseIsoDate(iso)) + days));

// Google's all-day end date is exclusive; Daynest's is inclusive.
function times(e: Pick<EventFields, 'allDay' | 'startsAt' | 'endsAt' | 'startDate' | 'endDate'>, timeZone: string) {
  if (e.allDay) return { start: { date: e.startDate! }, end: { date: addDays(e.endDate!, 1) } };
  return { start: { dateTime: e.startsAt!, timeZone }, end: { dateTime: e.endsAt!, timeZone } };
}

function remindersToGoogle(minutes: number[], allDay: boolean): GoogleReminders {
  const shifted = allDay ? minutes.map((m) => m - ALL_DAY_REMINDER_SHIFT).filter((m) => m >= 0) : minutes;
  return { useDefault: false, overrides: shifted.map((m) => ({ method: 'popup', minutes: m })) };
}

export type GoogleBody = Omit<GoogleEvent, 'id'>;

// One instance of a series ("Chỉ lần này") carries no recurrence.
export function toGoogleBody(e: EventFields, timeZone: string, { instance = false } = {}): GoogleBody {
  return {
    summary: e.title,
    description: e.note,
    colorId: toGoogleColorId(e.color),
    ...times(e, timeZone),
    ...(instance ? {} : { recurrence: buildRecurrence(e.repeat, e.repeatInterval, e.repeatUntil, e.allDay, timeZone) }),
    reminders: remindersToGoogle(e.reminderMinutes, e.allDay),
  };
}

export type FromGoogle = {
  fields: EventFields;
  // Title/note cut to fit the DB, or a recurrence Daynest can't express → view only (F4).
  readonly: boolean;
  complexRecurrence: boolean;
};

function chars(text: string, max: number): { text: string; cut: boolean } {
  const list = Array.from(text);
  return list.length > max ? { text: list.slice(0, max).join(''), cut: true } : { text, cut: false };
}

function remindersFromGoogle(r: GoogleReminders | undefined, defaults: GoogleReminders['overrides'], allDay: boolean): number[] {
  const list = (r?.useDefault !== false ? defaults : r?.overrides) ?? [];
  const minutes = list.map((o) => o.minutes + (allDay ? ALL_DAY_REMINDER_SHIFT : 0));
  return [...new Set(minutes)].sort((a, b) => a - b).slice(0, MAX_REMINDERS);
}

export function startDateOf(t: GoogleTime, timeZone: string): string {
  return t.date ?? isoDate(todayIn(timeZone, new Date(t.dateTime!)));
}

export function fromGoogle(
  g: GoogleEvent,
  { timeZone, defaultReminders, fallbackTitle }: { timeZone: string; defaultReminders?: GoogleReminders['overrides']; fallbackTitle: string },
): FromGoogle | null {
  if (!g.start || !g.end) return null;
  const allDay = !!g.start.date;
  const title = chars(g.summary?.trim() || fallbackTitle, TITLE_DB_MAX);
  const note = chars(g.description ?? '', NOTE_DB_MAX);
  const startDate = startDateOf(g.start, timeZone);
  const parsed = parseRecurrence(g.recurrence, parseIsoDate(startDate), timeZone);
  const endDate = allDay ? addDays(g.end.date!, -1) : null;
  return {
    fields: {
      title: title.text,
      note: note.text,
      color: FROM_GOOGLE_COLOR[g.colorId ?? ''] ?? 'mint',
      allDay,
      startsAt: allDay ? null : new Date(g.start.dateTime!).toISOString(),
      endsAt: allDay ? null : new Date(g.end.dateTime!).toISOString(),
      startDate: allDay ? startDate : null,
      endDate: allDay ? (endDate! < startDate ? startDate : endDate) : null,
      repeat: parsed?.repeat ?? 'none',
      repeatInterval: parsed?.interval ?? 1,
      repeatUntil: parsed?.until ?? null,
      lunarMonth: null,
      lunarDay: null,
      reminderMinutes: remindersFromGoogle(g.reminders, defaultReminders, allDay),
    },
    readonly: title.cut || note.cut || !parsed,
    complexRecurrence: !parsed,
  };
}
