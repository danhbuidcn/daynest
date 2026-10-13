import { toEvent, toEventColumns, type EventInput, type EventRow, type EventTableRow } from '@/features/events/event';
import { occurrencesForEvent, type EventOccurrence, type ExceptionRow } from '@/features/events/occurrences';
import { DEFAULT_TIME_ZONE } from '@/lib/calendar/timeZone';
import type { DateRange } from '@/lib/recurrence';
import { normalizeStatus, NOT_DONE, type Subtask, type TodoStatus } from '@/lib/todos';

// A todo is an event (same form, repeat, exceptions, reminders) + subtasks + done state, kept in its
// own tables (`todos`, `todo_exceptions`) so it never syncs to Google (S5).
// `done`/`doneSubtasks` are the state of a one-off todo; each lap of a repeating one keeps its own
// in `todo_exceptions`.
export type TodoInput = EventInput & { subtasks: Subtask[]; done: boolean; doneSubtasks: string[] };
export type TodoRow = TodoInput & { id: string; updatedAt: string };

export type TodoTableRow = EventTableRow & { subtasks: Subtask[]; done: boolean; done_subtasks: string[] };

export function toTodo(row: TodoTableRow): TodoRow {
  return { ...toEvent(row), subtasks: row.subtasks ?? [], done: row.done, doneSubtasks: row.done_subtasks ?? [] };
}

export function toTodoColumns(input: TodoInput) {
  return { ...toEventColumns(input), subtasks: input.subtasks, done: input.done, done_subtasks: input.doneSubtasks };
}

// 'status' only records whether one lap is done; it does not change what the lap shows.
export type TodoExceptionKind = 'skip' | 'override' | 'status';

export type TodoExceptionRow = Omit<ExceptionRow, 'eventId' | 'kind'> & {
  todoId: string;
  kind: TodoExceptionKind;
  subtasks: Subtask[] | null; // null = the todo's own list
  done: boolean | null;
  doneSubtasks: string[];
};

// `eventId` holds the todo id, so the calendar can lay todos out with the event code.
export type TodoOccurrence = EventOccurrence & { subtasks: Subtask[]; status: TodoStatus };

export function occurrencesForTodo(
  todo: TodoRow,
  exceptions: TodoExceptionRow[],
  range: DateRange,
  timeZone: string = DEFAULT_TIME_ZONE,
): TodoOccurrence[] {
  const own = exceptions.filter((e) => e.todoId === todo.id);
  const byDate = new Map(own.map((e) => [e.occurrenceDate, e]));
  const asEventExceptions: ExceptionRow[] = own
    .filter((e) => e.kind !== 'status')
    .map((e) => ({ ...e, eventId: e.todoId, kind: e.kind as 'skip' | 'override' }));
  return occurrencesForEvent(todo as EventRow, asEventExceptions, range, timeZone).map((occ) => {
    const ex = byDate.get(occ.occurrenceDate);
    const subtasks = ex?.subtasks ?? todo.subtasks;
    const raw = todo.repeat === 'none' ? { done: todo.done, doneSubtasks: todo.doneSubtasks } : ex ? { done: !!ex.done, doneSubtasks: ex.doneSubtasks } : NOT_DONE;
    return { ...occ, subtasks, status: normalizeStatus(subtasks, raw) };
  });
}

export function occurrencesForTodos(todos: TodoRow[], exceptions: TodoExceptionRow[], range: DateRange, timeZone: string = DEFAULT_TIME_ZONE): TodoOccurrence[] {
  return todos.flatMap((t) => occurrencesForTodo(t, exceptions, range, timeZone));
}

export type TodosData = { todos: TodoRow[]; exceptions: TodoExceptionRow[] };

// Optimistic tick: the cache as it will be once `setTodoStatus` (api.ts) succeeds.
export function withStatus(data: TodosData, todoId: string, occurrenceDate: string, status: TodoStatus): TodosData {
  const todo = data.todos.find((t) => t.id === todoId);
  if (!todo) return data;
  if (todo.repeat === 'none') {
    return { ...data, todos: data.todos.map((t) => (t.id === todoId ? { ...t, done: status.done, doneSubtasks: status.doneSubtasks } : t)) };
  }
  const existing = data.exceptions.find((e) => e.todoId === todoId && e.occurrenceDate === occurrenceDate);
  if (existing) {
    return { ...data, exceptions: data.exceptions.map((e) => (e === existing ? { ...e, done: status.done, doneSubtasks: status.doneSubtasks } : e)) };
  }
  const added: TodoExceptionRow = {
    id: `pending-${todoId}-${occurrenceDate}`,
    todoId,
    occurrenceDate,
    kind: 'status',
    title: null,
    note: null,
    color: null,
    allDay: null,
    startsAt: null,
    endsAt: null,
    startDate: null,
    endDate: null,
    reminderMinutes: null,
    subtasks: null,
    done: status.done,
    doneSubtasks: status.doneSubtasks,
  };
  return { ...data, exceptions: [...data.exceptions, added] };
}
