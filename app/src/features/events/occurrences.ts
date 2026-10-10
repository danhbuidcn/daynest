import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { DEFAULT_TIME_ZONE, shiftByDays, todayIn } from '@/lib/calendar/timeZone';
import { jdFromDate, jdToDate, type SolarDate } from '@/lib/lunar';
import { occurrences as expandOccurrences, type DateRange, type Exception, type RecurrenceRule } from '@/lib/recurrence';
import type { EventColor, EventRow, RepeatKind } from './event';

export type ExceptionKind = 'skip' | 'override';

// Null fields mean "keep the base event's value" ([F2#ngoại-lệ]).
export type ExceptionRow = {
  id: string;
  eventId: string;
  occurrenceDate: string; // 'YYYY-MM-DD' — the base event's anchor date for this lap
  kind: ExceptionKind;
  title: string | null;
  note: string | null;
  color: EventColor | null;
  allDay: boolean | null;
  startsAt: string | null;
  endsAt: string | null;
  startDate: string | null;
  endDate: string | null;
  reminderMinutes: number[] | null;
};

export type EventOccurrence = {
  eventId: string;
  occurrenceDate: string; // key for "edit/delete this occurrence only"
  title: string;
  note: string;
  color: EventColor;
  allDay: boolean;
  startsAt: string | null;
  endsAt: string | null;
  startDate: string | null;
  endDate: string | null;
  reminderMinutes: number[];
  repeat: RepeatKind;
  isException: boolean;
};

function anchorDate(event: EventRow, timeZone: string): SolarDate {
  return event.allDay ? parseIsoDate(event.startDate!) : todayIn(timeZone, new Date(event.startsAt!));
}

function anchorEndDate(event: EventRow, timeZone: string): SolarDate {
  return event.allDay ? parseIsoDate(event.endDate!) : todayIn(timeZone, new Date(event.endsAt!));
}

export function ruleFromEvent(event: EventRow, timeZone: string = DEFAULT_TIME_ZONE): RecurrenceRule {
  return {
    repeat: event.repeat,
    startDate: anchorDate(event, timeZone),
    interval: event.repeatInterval,
    until: event.repeatUntil ? parseIsoDate(event.repeatUntil) : null,
    lunarMonth: event.lunarMonth ?? undefined,
    lunarDay: event.lunarDay ?? undefined,
  };
}

function shiftedFields(event: EventRow, date: SolarDate, startAnchor: SolarDate, durationDays: number, timeZone: string) {
  const deltaDays = jdFromDate(date) - jdFromDate(startAnchor);
  if (event.allDay) {
    return {
      allDay: true,
      startDate: isoDate(date),
      endDate: isoDate(jdToDate(jdFromDate(date) + durationDays)),
      startsAt: null,
      endsAt: null,
    };
  }
  return {
    allDay: false,
    startDate: null,
    endDate: null,
    startsAt: shiftByDays(new Date(event.startsAt!), deltaDays, timeZone).toISOString(),
    endsAt: shiftByDays(new Date(event.endsAt!), deltaDays, timeZone).toISOString(),
  };
}

function withOverride(base: EventOccurrence, override: ExceptionRow): EventOccurrence {
  return {
    ...base,
    title: override.title ?? base.title,
    note: override.note ?? base.note,
    color: override.color ?? base.color,
    allDay: override.allDay ?? base.allDay,
    startsAt: override.startsAt ?? base.startsAt,
    endsAt: override.endsAt ?? base.endsAt,
    startDate: override.startDate ?? base.startDate,
    endDate: override.endDate ?? base.endDate,
    reminderMinutes: override.reminderMinutes ?? base.reminderMinutes,
    isException: true,
  };
}

// Expands one event's recurrence rule into its occurrences within `range`, with exceptions applied.
export function occurrencesForEvent(
  event: EventRow,
  exceptions: ExceptionRow[],
  range: DateRange,
  timeZone: string = DEFAULT_TIME_ZONE,
): EventOccurrence[] {
  const rule = ruleFromEvent(event, timeZone);
  const startAnchor = rule.startDate;
  const durationDays = jdFromDate(anchorEndDate(event, timeZone)) - jdFromDate(startAnchor);
  const typedExceptions: Exception<ExceptionRow>[] = exceptions
    .filter((e) => e.eventId === event.id)
    .map((e) => ({ date: parseIsoDate(e.occurrenceDate), kind: e.kind, data: e }));

  return expandOccurrences(rule, range, typedExceptions).map(({ date, override }) => {
    const base: EventOccurrence = {
      eventId: event.id,
      occurrenceDate: isoDate(date),
      title: event.title,
      note: event.note,
      color: event.color,
      reminderMinutes: event.reminderMinutes,
      repeat: event.repeat,
      isException: false,
      ...shiftedFields(event, date, startAnchor, durationDays, timeZone),
    };
    return override ? withOverride(base, override) : base;
  });
}

export function occurrencesForEvents(
  events: EventRow[],
  exceptions: ExceptionRow[],
  range: DateRange,
  timeZone: string = DEFAULT_TIME_ZONE,
): EventOccurrence[] {
  return events.flatMap((e) => occurrencesForEvent(e, exceptions, range, timeZone));
}
