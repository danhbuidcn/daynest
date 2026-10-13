import type { TFunction } from 'i18next';

import * as api from '@/features/events/api';
import { timeRangeLabel } from '@/features/events/format';
import { occurrencesForEvents } from '@/features/events/occurrences';
import * as todosApi from '@/features/todos/api';
import { occurrencesForTodos } from '@/features/todos/todo';
import { isoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { jdFromDate, jdToDate } from '@/lib/lunar';
import { LONGEST_REMINDER_DAYS, pickReminders, REMINDER_HORIZON_DAYS } from '@/lib/notifications/pickReminders';
import { cancelAll, ensureChannel, getPermission, scheduleAll } from '@/lib/notifications/scheduler';

export type ReminderConfig = { signedIn: boolean; enabled: boolean; timeZone: string; use24h: boolean; t: TFunction };

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
  const events = await api.fetchEvents(isoDate(range.from), isoDate(range.to));
  const exceptions = await api.fetchExceptions(events.map((e) => e.id));
  const todos = await todosApi.fetchTodos(isoDate(range.from), isoDate(range.to));
  const todoExceptions = await todosApi.fetchTodoExceptions(todos.map((x) => x.id));
  // S5: todos remind like events, except a lap already ticked done.
  const openTodos = occurrencesForTodos(todos, todoExceptions, range, c.timeZone).filter((o) => !o.status.done);
  const planned = pickReminders([...occurrencesForEvents(events, exceptions, range, c.timeZone), ...openTodos], now, c.timeZone);

  await cancelAll();
  await ensureChannel(c.t('reminders.channel'));
  await scheduleAll(
    planned.map(({ at, occurrence }) => ({
      at,
      title: occurrence.title,
      body: timeRangeLabel(c.t, occurrence, c.use24h, c.timeZone),
      data: { ['status' in occurrence ? 'todoId' : 'eventId']: occurrence.eventId, occurrenceDate: occurrence.occurrenceDate },
    })),
  );
}
