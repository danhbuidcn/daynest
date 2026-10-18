import type { TFunction } from 'i18next';

import { fetchPeriodDays } from '@/features/cycle/api';
import * as api from '@/features/events/api';
import { timeRangeLabel } from '@/features/events/format';
import { occurrencesForEvents } from '@/features/events/occurrences';
import * as todosApi from '@/features/todos/api';
import { occurrencesOnDay } from '@/features/calendar/dayOccurrences';
import { occurrencesForTodos } from '@/features/todos/todo';
import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { todayIn, zonedDateTimeToUtc } from '@/lib/calendar/timeZone';
import { groupPeriods, periodLength, predictPeriods, reminderDates } from '@/lib/cycle';
import { jdFromDate, jdToDate } from '@/lib/lunar';
import { DIGEST_MORNING_DAYS, planDigests, type DigestDay } from '@/lib/notifications/dailyDigest';
import { LONGEST_REMINDER_DAYS, pickReminders, REMINDER_HORIZON_DAYS } from '@/lib/notifications/pickReminders';
import { cancelAll, ensureChannel, getPermission, scheduleAll } from '@/lib/notifications/scheduler';

export type CycleReminderConfig = { cycleLength: number; periodLength: number; daysBefore: number; time: string };
export type DigestTimes = { morning: string | null; evening: string | null };
export type ReminderConfig = { signedIn: boolean; enabled: boolean; timeZone: string; use24h: boolean; t: TFunction; cycle: CycleReminderConfig | null; digest: DigestTimes };

let config: ReminderConfig | null = null;
let chain: Promise<void> = Promise.resolve();

// Set by useReminderSync from the signed-in user's settings; plain module state so event
// mutations can trigger a resync without threading settings through every caller.
export function configureReminders(next: ReminderConfig) {
  config = next;
}

// F3 "Đặt lại toàn bộ": cancel everything, then schedule from the DB. Runs one at a time so a
// burst of triggers (save + foreground) can't interleave cancel/schedule.
export function resyncReminders(): Promise<void> {
  chain = chain.then(run).catch(() => {});
  return chain;
}

async function run() {
  const c = config;
  if (!c || !c.signedIn || !c.enabled || (await getPermission()) !== 'granted') {
    await cancelAll();
    return;
  }
  const now = new Date();
  const today = jdFromDate(todayIn(c.timeZone, now));
  const range = { from: jdToDate(today - 1), to: jdToDate(today + REMINDER_HORIZON_DAYS + LONGEST_REMINDER_DAYS + 1) };
  // Fetch before cancelling: offline, the reminders already set stay in place.
  const { events, exceptions } = await api.fetchEvents(isoDate(range.from), isoDate(range.to));
  const { todos, exceptions: todoExceptions } = await todosApi.fetchTodos(isoDate(range.from), isoDate(range.to));
  // S5: todos remind like events, except a lap already ticked done.
  const todoOccurrences = occurrencesForTodos(todos, todoExceptions, range, c.timeZone);
  const openTodos = todoOccurrences.filter((o) => !o.status.done);
  const planned = pickReminders([...occurrencesForEvents(events, exceptions, range, c.timeZone), ...openTodos], now, c.timeZone);

  const cycleNotes = c.cycle ? await cycleReminders(c, c.cycle, now) : [];
  const digestNotes = digestReminders(c, todoOccurrences, now);

  await cancelAll();
  await ensureChannel(c.t('reminders.channel'));
  await scheduleAll([
    ...cycleNotes,
    ...digestNotes,
    ...planned.map(({ at, occurrence }) => ({
      at,
      title: occurrence.title,
      body: timeRangeLabel(c.t, occurrence, c.use24h, c.timeZone),
      data: { ['status' in occurrence ? 'todoId' : 'eventId']: occurrence.eventId, occurrenceDate: occurrence.occurrenceDate },
    })),
  ]);
}

// S5: "period expected in N days" at the chosen time, for each predicted period inside the horizon.
async function cycleReminders(c: ReminderConfig, cycle: CycleReminderConfig, now: Date) {
  const todayDate = todayIn(c.timeZone, now);
  const today = isoDate(todayDate);
  const from = isoDate({ ...jdToDate(jdFromDate(todayDate) - 365) });
  const periods = groupPeriods(await fetchPeriodDays(from));
  const predicted = predictPeriods(periods, today, {
    cycleLength: cycle.cycleLength,
    periodLength: periodLength(periods, cycle.periodLength),
  });
  const [hour, minute] = cycle.time.split(':').map(Number);
  return reminderDates(predicted, today, cycle.daysBefore)
    .map(({ date, start }) => ({ at: zonedDateTimeToUtc(parseIsoDate(date), { hour, minute, second: 0 }, c.timeZone), start }))
    .filter(({ at }) => at.getTime() > now.getTime())
    .map(({ at, start }) => ({
      at,
      title: c.t('cycle.title'),
      body: c.t('cycle.remindBody', { count: cycle.daysBefore }),
      data: { cycleDate: start },
    }));
}

// Morning "you have N todos" for the coming days, and this evening's "you finished N of M".
function digestReminders(c: ReminderConfig, todoOccurrences: ReturnType<typeof occurrencesForTodos>, now: Date) {
  if (!c.digest.morning && !c.digest.evening) return [];
  const today = jdFromDate(todayIn(c.timeZone, now));
  const days: DigestDay[] = Array.from({ length: DIGEST_MORNING_DAYS }, (_, i) => {
    const day = jdToDate(today + i);
    const onDay = occurrencesOnDay(todoOccurrences, day, c.timeZone) as typeof todoOccurrences;
    return { date: isoDate(day), total: onDay.length, done: onDay.filter((o) => o.status.done).length, titles: onDay.map((o) => o.title) };
  });
  return planDigests(days, c.digest, now, c.timeZone).map((d) => {
    const data = { digestDate: d.date };
    if (d.kind === 'morning') {
      return { at: d.at, title: c.t('digest.morningTitle', { count: d.total }), body: d.titles.join(', ') + (d.more ? '…' : ''), data };
    }
    const title = d.done === d.total ? c.t('digest.eveningAll', { count: d.total }) : c.t('digest.evening', { done: d.done, total: d.total });
    return { at: d.at, title, body: '', data };
  });
}
