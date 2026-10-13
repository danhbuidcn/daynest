// Pure state for the event form (màn 9): defaults, loading from an occurrence, validation and
// conversion to what api.ts writes. Kept out of the screen so it can be unit-tested.
import { isoDate, parseIsoDate, sameDay } from '@/lib/calendar/monthGrid';
import { timeOfDayIn, todayIn, zonedDateTimeToUtc, type TimeOfDay } from '@/lib/calendar/timeZone';
import { jdFromDate, jdToDate, toLunar, type SolarDate } from '@/lib/lunar';
import type { AppColor } from '@/lib/colors';
import type { EventInput, EventRow, RepeatKind } from './event';
import type { EventOccurrence } from './occurrences';
import { ruleFromEvent } from './occurrences';
import { DEFAULT_REMINDER_MINUTES } from './reminderOptions';

export type FormState = {
  title: string;
  note: string;
  allDay: boolean;
  startDate: SolarDate;
  startTime: TimeOfDay;
  endDate: SolarDate;
  endTime: TimeOfDay;
  color: AppColor;
  reminderOn: boolean;
  reminderMinutes: number[];
  repeat: RepeatKind;
  repeatInterval: number;
  repeatUntil: SolarDate | null;
};

export const TITLE_MAX = 100;
export const NOTE_MAX = 2000;

const MIDNIGHT: TimeOfDay = { hour: 0, minute: 0, second: 0 };

// Where a new event starts: an hour tapped in the Day view, or its "Cả ngày" row (F1).
export type NewEventSlot = { hour?: number; allDay?: boolean };

// New event: the given day, next full hour (or the tapped one), 1 hour long, one "15 minutes
// before" reminder (F2, F3). Starting at 23:00 ends at 00:00 the next day.
export function newFormState(date: SolarDate, timeZone: string, now: Date = new Date(), slot: NewEventSlot = {}): FormState {
  const hour = slot.hour ?? (timeOfDayIn(now, timeZone).hour + 1) % 24;
  return {
    title: '',
    note: '',
    allDay: slot.allDay ?? false,
    startDate: date,
    startTime: { hour, minute: 0, second: 0 },
    endDate: hour === 23 && !slot.allDay ? jdToDate(jdFromDate(date) + 1) : date,
    endTime: { hour: (hour + 1) % 24, minute: 0, second: 0 },
    color: 'mint',
    reminderOn: true,
    reminderMinutes: [DEFAULT_REMINDER_MINUTES],
    repeat: 'none',
    repeatInterval: 1,
    repeatUntil: null,
  };
}

// Editing: this occurrence's effective values (exception applied) + the series' repeat rule.
export function formStateFromOccurrence(base: EventRow, occ: EventOccurrence, timeZone: string): FormState {
  const start = occ.allDay ? null : new Date(occ.startsAt!);
  const end = occ.allDay ? null : new Date(occ.endsAt!);
  return {
    title: occ.title,
    note: occ.note,
    allDay: occ.allDay,
    startDate: start ? todayIn(timeZone, start) : parseIsoDate(occ.startDate!),
    startTime: start ? timeOfDayIn(start, timeZone) : MIDNIGHT,
    endDate: end ? todayIn(timeZone, end) : parseIsoDate(occ.endDate!),
    endTime: end ? timeOfDayIn(end, timeZone) : MIDNIGHT,
    color: occ.color,
    reminderOn: occ.reminderMinutes.length > 0,
    reminderMinutes: occ.reminderMinutes,
    repeat: base.repeat,
    repeatInterval: base.repeatInterval,
    repeatUntil: base.repeatUntil ? parseIsoDate(base.repeatUntil) : null,
  };
}

function instant(f: FormState, which: 'start' | 'end', timeZone: string): number {
  const date = which === 'start' ? f.startDate : f.endDate;
  const time = which === 'start' ? f.startTime : f.endTime;
  return f.allDay ? jdFromDate(date) * 86_400_000 : zonedDateTimeToUtc(date, time, timeZone).getTime();
}

export function endsBeforeStart(f: FormState, timeZone: string): boolean {
  return instant(f, 'end', timeZone) < instant(f, 'start', timeZone);
}

export function isFormValid(f: FormState, timeZone: string): boolean {
  return f.title.trim() !== '' && !endsBeforeStart(f, timeZone);
}

// Moving the start date keeps the event's length (multi-day events stay multi-day).
export function withStartDate(f: FormState, date: SolarDate): FormState {
  const length = jdFromDate(f.endDate) - jdFromDate(f.startDate);
  return { ...f, startDate: date, endDate: jdToDate(jdFromDate(date) + length) };
}

// Turning reminders on with nothing selected adds the default "15 minutes before"; turning them
// off keeps the list so turning back on in the same edit restores it (F3).
export function withReminderOn(f: FormState, on: boolean): FormState {
  return { ...f, reminderOn: on, reminderMinutes: on && f.reminderMinutes.length === 0 ? [DEFAULT_REMINDER_MINUTES] : f.reminderMinutes };
}

export function clampInterval(raw: string): number {
  return Math.min(99, Math.max(1, Math.round(Number(raw)) || 1));
}

export function toEventInput(f: FormState, timeZone: string): EventInput {
  const lunar = f.repeat === 'lunar_yearly' ? toLunar(f.startDate) : null;
  const repeatUntil = f.repeat !== 'none' && f.repeatUntil && jdFromDate(f.repeatUntil) >= jdFromDate(f.startDate) ? isoDate(f.repeatUntil) : null;
  return {
    title: f.title.trim(),
    note: f.note.trim(),
    color: f.color,
    allDay: f.allDay,
    startsAt: f.allDay ? null : zonedDateTimeToUtc(f.startDate, f.startTime, timeZone).toISOString(),
    endsAt: f.allDay ? null : zonedDateTimeToUtc(f.endDate, f.endTime, timeZone).toISOString(),
    startDate: f.allDay ? isoDate(f.startDate) : null,
    endDate: f.allDay ? isoDate(f.endDate) : null,
    repeat: f.repeat,
    repeatInterval: f.repeat === 'lunar_yearly' ? 1 : f.repeatInterval,
    repeatUntil,
    lunarMonth: lunar ? lunar.month : null,
    lunarDay: lunar ? lunar.day : null,
    reminderMinutes: f.reminderOn ? f.reminderMinutes : [],
  };
}

// "Tất cả": changing the repeat type or the start date orphans existing exceptions (keyed by the
// old anchor dates), so they get cleared — the form warns first (F2).
export function changesSeriesAnchor(base: EventRow, f: FormState, timeZone: string): boolean {
  return base.repeat !== f.repeat || !sameDay(ruleFromEvent(base, timeZone).startDate, f.startDate);
}
