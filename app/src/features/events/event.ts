import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { jdFromDate, jdToDate, type SolarDate } from '@/lib/lunar';
import { expandRule } from '@/lib/recurrence';

export type EventColor = 'mint' | 'sky' | 'lavender' | 'pink' | 'peach' | 'lemon';
export const EVENT_COLORS: readonly EventColor[] = ['mint', 'sky', 'lavender', 'pink', 'peach', 'lemon'];

export type RepeatKind = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lunar_yearly';

// What the form edits and `api.ts` writes — DB-column shaped but camelCase, no server-managed fields.
export type EventInput = {
  title: string;
  note: string;
  color: EventColor;
  allDay: boolean;
  startsAt: string | null; // ISO timestamp — set when !allDay
  endsAt: string | null;
  startDate: string | null; // 'YYYY-MM-DD' — set when allDay
  endDate: string | null;
  repeat: RepeatKind;
  repeatInterval: number; // 1-99
  repeatUntil: string | null; // 'YYYY-MM-DD', null = never
  lunarMonth: number | null; // set when repeat === 'lunar_yearly'
  lunarDay: number | null;
  reminderMinutes: number[];
};

export type GoogleStatus = 'none' | 'synced' | 'pending';
// F4: `linked` = has a Google twin; `readonly` = cut to fit or a recurrence only Google can edit.
export type GoogleLink = { status: GoogleStatus; linked: boolean; readonly: boolean };

export type EventRow = EventInput & { id: string; updatedAt: string; google?: GoogleLink };

export type EventTableRow = {
  id: string;
  title: string;
  note: string | null;
  color: string;
  all_day: boolean;
  starts_at: string | null;
  ends_at: string | null;
  start_date: string | null;
  end_date: string | null;
  repeat: string;
  repeat_interval: number;
  repeat_until: string | null;
  lunar_month: number | null;
  lunar_day: number | null;
  reminder_minutes: number[] | null;
  updated_at: string;
  google_event_id?: string | null;
  google_status?: string;
  google_readonly?: boolean;
};

export function toEvent(row: EventTableRow): EventRow {
  return {
    ...(row.google_status !== undefined
      ? { google: { status: row.google_status as GoogleStatus, linked: !!row.google_event_id, readonly: !!row.google_readonly } }
      : {}),
    id: row.id,
    updatedAt: row.updated_at,
    title: row.title,
    note: row.note ?? '',
    color: row.color as EventColor,
    allDay: row.all_day,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    startDate: row.start_date,
    endDate: row.end_date,
    repeat: row.repeat as RepeatKind,
    repeatInterval: row.repeat_interval,
    repeatUntil: row.repeat_until,
    lunarMonth: row.lunar_month,
    lunarDay: row.lunar_day,
    reminderMinutes: row.reminder_minutes ?? [],
  };
}

export function toEventColumns(input: EventInput) {
  return {
    title: input.title,
    note: input.note === '' ? null : input.note,
    color: input.color,
    all_day: input.allDay,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    start_date: input.startDate,
    end_date: input.endDate,
    repeat: input.repeat,
    repeat_interval: input.repeatInterval,
    repeat_until: input.repeatUntil,
    lunar_month: input.lunarMonth,
    lunar_day: input.lunarDay,
    reminder_minutes: input.reminderMinutes,
    ...computeSpan(input),
  };
}

// The calendar date (ignoring time of day) this event's first occurrence starts/ends on.
function boundaryDates(input: Pick<EventInput, 'allDay' | 'startDate' | 'endDate' | 'startsAt' | 'endsAt'>): {
  start: SolarDate;
  end: SolarDate;
} {
  if (input.allDay) return { start: parseIsoDate(input.startDate!), end: parseIsoDate(input.endDate!) };
  // starts_at/ends_at are ISO timestamps; their calendar date is read in UTC here, up to a day off the
  // local date — fetchEvents (api.ts) widens its query by a day each side to cover that.
  return { start: isoOfInstant(input.startsAt!), end: isoOfInstant(input.endsAt!) };
}

function isoOfInstant(iso: string): SolarDate {
  const [datePart] = iso.split('T');
  return parseIsoDate(datePart);
}

// `span_start`/`span_end`: the first occurrence's start date and the last occurrence's end date
// (`infinity` when the repeat never ends) — used only to filter events by viewed date range.
export function computeSpan(input: EventInput): { span_start: string; span_end: string } {
  const { start, end } = boundaryDates(input);
  const durationDays = jdFromDate(end) - jdFromDate(start);
  if (input.repeat === 'none') return { span_start: isoDate(start), span_end: isoDate(end) };
  if (!input.repeatUntil) return { span_start: isoDate(start), span_end: 'infinity' };

  const until = parseIsoDate(input.repeatUntil);
  const dates = expandRule(
    {
      repeat: input.repeat,
      startDate: start,
      interval: input.repeatInterval,
      until,
      lunarMonth: input.lunarMonth ?? undefined,
      lunarDay: input.lunarDay ?? undefined,
    },
    { from: start, to: until },
  );
  const lastStart = dates.length > 0 ? dates[dates.length - 1] : start;
  const lastEnd = jdToDate(jdFromDate(lastStart) + durationDays);
  return { span_start: isoDate(start), span_end: isoDate(lastEnd) };
}
