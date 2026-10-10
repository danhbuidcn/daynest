import type { TFunction } from 'i18next';

import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { clockParts, timeOfDayIn, todayIn, type TimeOfDay } from '@/lib/calendar/timeZone';
import { canChiYear, jdFromDate, toLunar, type SolarDate } from '@/lib/lunar';
import type { EventOccurrence } from './occurrences';
import { REMINDER_OPTIONS } from './reminderOptions';

const pad = (n: number) => String(n).padStart(2, '0');

// "T6, 09/10/2026" — short weekday, used by the form, detail screen and day popup.
export function dateLabel(t: TFunction, d: SolarDate): string {
  return `${t(`calendar.weekdays.${(jdFromDate(d) + 1) % 7}`)}, ${pad(d.day)}/${pad(d.month)}/${d.year}`;
}

// "Thứ Tư, 21/10/2026" — event detail (mockup màn 13).
export function longDateLabel(t: TFunction, d: SolarDate): string {
  return `${t(`calendar.weekdaysLong.${(jdFromDate(d) + 1) % 7}`)}, ${pad(d.day)}/${pad(d.month)}/${d.year}`;
}

export function shortDate(d: SolarDate): string {
  return `${pad(d.day)}/${pad(d.month)}/${d.year}`;
}

// "29/8 · Bính Ngọ" (leap month: "1/6N · …").
export function lunarLabel(t: TFunction, d: SolarDate): string {
  const l = toLunar(d);
  const cc = canChiYear(l.year);
  const year = `${t(`lunar.stems.${cc.stem}`)} ${t(`lunar.branches.${cc.branch}`)}`;
  return t('lunar.dateWithYear', { date: `${l.day}/${l.month}${l.leap ? 'N' : ''}`, year });
}

export function clockLabel(t: TFunction, time: TimeOfDay, use24h: boolean): string {
  const c = clockParts(time, use24h);
  return c.period ? `${c.text} ${t(`common.${c.period}`)}` : c.text;
}

// "10:00 – 11:00", or "Cả ngày" for all-day occurrences.
export function timeRangeLabel(t: TFunction, occ: EventOccurrence, use24h: boolean, timeZone: string): string {
  if (occ.allDay) return t('events.form.allDay');
  const start = clockLabel(t, timeOfDayIn(new Date(occ.startsAt!), timeZone), use24h);
  const end = clockLabel(t, timeOfDayIn(new Date(occ.endsAt!), timeZone), use24h);
  return `${start} – ${end}`;
}

export function occurrenceStartDate(occ: EventOccurrence, timeZone: string): SolarDate {
  return occ.allDay ? parseIsoDate(occ.startDate!) : todayIn(timeZone, new Date(occ.startsAt!));
}

// Detail screen line: "T6, 09/10/2026 · 10:00 – 11:00", "T6, 09/10/2026 · Cả ngày",
// or "T6, 09/10/2026 – 11/10/2026" for a multi-day all-day event.
export function whenLabel(t: TFunction, occ: EventOccurrence, use24h: boolean, timeZone: string): string {
  const start = occurrenceStartDate(occ, timeZone);
  if (occ.allDay && occ.endDate !== occ.startDate) return `${longDateLabel(t, start)} – ${shortDate(parseIsoDate(occ.endDate!))}`;
  return `${longDateLabel(t, start)} · ${timeRangeLabel(t, occ, use24h, timeZone)}`;
}

// Reminders pulled from Google can be any number of minutes, not just Daynest's options (F4).
export function oneReminderLabel(t: TFunction, m: number): string {
  if ((REMINDER_OPTIONS as number[]).includes(m)) return t(`events.reminderOptions.${m}`);
  if (m % 1440 === 0) return t('events.reminderCustom.days', { count: m / 1440 });
  if (m % 60 === 0) return t('events.reminderCustom.hours', { count: m / 60 });
  return t('events.reminderCustom.minutes', { count: m });
}

export function reminderLabel(t: TFunction, minutes: number[]): string | null {
  return minutes.length > 0 ? minutes.map((m) => oneReminderLabel(t, m)).join(' · ') : null;
}
