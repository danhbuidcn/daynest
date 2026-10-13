// Pure state for the todo form: the event form's fields + subtasks (edited as checklist items).
import { newFormState, toEventInput, type FormState } from '@/features/events/eventFormState';
import type { SolarDate } from '@/lib/lunar';
import type { ChecklistItem } from '@/lib/notes';
import { normalizeStatus, NOT_DONE, type TodoStatus } from '@/lib/todos';
import type { TodoInput, TodoOccurrence } from './todo';

// New todo (S5): all day on the given date, no reminder.
export function newTodoFormState(date: SolarDate, timeZone: string, now: Date = new Date()): FormState {
  return { ...newFormState(date, timeZone, now, { allDay: true }), reminderOn: false, reminderMinutes: [] };
}

export function itemsFromOccurrence(occ: TodoOccurrence): ChecklistItem[] {
  return occ.subtasks.map((s) => ({ id: s.id, text: s.text, done: occ.status.doneSubtasks.includes(s.id) }));
}

// Empty items are dropped. `done` is the todo's tick, which only counts when it has no subtasks.
export function toTodoInput(f: FormState, items: ChecklistItem[], done: boolean, timeZone: string): { input: TodoInput; status: TodoStatus } {
  const filled = items.map((i) => ({ ...i, text: i.text.trim() })).filter((i) => i.text !== '');
  const subtasks = filled.map(({ id, text }) => ({ id, text }));
  const status = normalizeStatus(subtasks, { done, doneSubtasks: filled.filter((i) => i.done).map((i) => i.id) });
  // A repeating todo keeps each lap's state in todo_exceptions, never on its own row.
  const rowStatus = f.repeat === 'none' ? status : NOT_DONE;
  return { input: { ...toEventInput(f, timeZone), subtasks, done: rowStatus.done, doneSubtasks: rowStatus.doneSubtasks }, status };
}

export function sameStatus(a: TodoStatus, b: TodoStatus): boolean {
  return a.done === b.done && a.doneSubtasks.join() === b.doneSubtasks.join();
}

const TIME_FIELDS = ['allDay', 'startDate', 'startTime', 'endDate', 'endTime'] as const;
const REMINDER_FIELDS = ['reminderOn', 'reminderMinutes'] as const;

// Create form switched between Sự kiện ↔ Todo (S5): what was typed stays; the "Cả ngày / giờ"
// and "Nhắc" groups the user never touched take the new type's defaults instead.
export function switchKind(form: FormState, fromDefaults: FormState, toDefaults: FormState): FormState {
  const untouched = (fields: readonly (keyof FormState)[]) => fields.every((k) => JSON.stringify(form[k]) === JSON.stringify(fromDefaults[k]));
  const next = { ...form };
  for (const group of [TIME_FIELDS, REMINDER_FIELDS]) {
    if (untouched(group)) for (const k of group) Object.assign(next, { [k]: toDefaults[k] });
  }
  return next;
}
