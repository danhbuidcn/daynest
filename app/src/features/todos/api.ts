import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import { jdFromDate, jdToDate } from '@/lib/lunar';
import { supabase } from '@/lib/supabase';
import { ConflictError, ForbiddenError } from '@/features/events/api';
import type { TodoStatus } from '@/lib/todos';
import { toTodo, toTodoColumns, type TodoExceptionKind, type TodoExceptionRow, type TodoInput, type TodoRow, type TodoTableRow } from './todo';

function classify(error: unknown): Error {
  if (error && typeof error === 'object' && (error as { code?: string }).code === '42501') return new ForbiddenError();
  if (error instanceof Error) return error;
  return new Error(JSON.stringify(error));
}

// Same widening as fetchEvents: span dates of timed todos are UTC dates, up to a day off.
const shiftIso = (iso: string, days: number) => isoDate(jdToDate(jdFromDate(parseIsoDate(iso)) + days));

export async function fetchTodos(fromIso: string, toIso: string): Promise<TodoRow[]> {
  const { data, error } = await supabase
    .from('todos')
    .select(
      'id, title, note, color, all_day, starts_at, ends_at, start_date, end_date, repeat, repeat_interval, repeat_until, lunar_month, lunar_day, reminder_minutes, subtasks, done, done_subtasks, updated_at',
    )
    .is('deleted_at', null)
    .lte('span_start', shiftIso(toIso, 1))
    .gte('span_end', shiftIso(fromIso, -1));
  if (error) throw classify(error);
  return (data ?? []).map((row) => toTodo(row as TodoTableRow));
}

export async function fetchTodoExceptions(todoIds: string[]): Promise<TodoExceptionRow[]> {
  if (todoIds.length === 0) return [];
  const { data, error } = await supabase
    .from('todo_exceptions')
    .select(
      'id, todo_id, occurrence_date, kind, title, note, color, all_day, starts_at, ends_at, start_date, end_date, reminder_minutes, subtasks, done, done_subtasks',
    )
    .in('todo_id', todoIds);
  if (error) throw classify(error);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    todoId: row.todo_id as string,
    occurrenceDate: row.occurrence_date as string,
    kind: row.kind as TodoExceptionKind,
    title: row.title,
    note: row.note,
    color: row.color,
    allDay: row.all_day,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    startDate: row.start_date,
    endDate: row.end_date,
    reminderMinutes: row.reminder_minutes,
    subtasks: row.subtasks,
    done: row.done,
    doneSubtasks: row.done_subtasks ?? [],
  }));
}

// `id` is generated when the form opens, so a retry after a lost response cannot add a second todo.
export async function createTodo(id: string, input: TodoInput): Promise<TodoRow> {
  const { data, error } = await supabase
    .from('todos')
    .upsert({ id, ...toTodoColumns(input) }, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw classify(error);
  return toTodo(data as TodoTableRow);
}

export async function updateTodo(
  id: string,
  readUpdatedAt: string,
  input: TodoInput,
  { clearExceptions = false }: { clearExceptions?: boolean } = {},
): Promise<TodoRow> {
  const { data, error } = await supabase
    .from('todos')
    .update(toTodoColumns(input))
    .eq('id', id)
    .eq('updated_at', readUpdatedAt)
    .select();
  if (error) throw classify(error);
  if (!data || data.length === 0) throw new ConflictError();
  if (clearExceptions) {
    const { error: delError } = await supabase.from('todo_exceptions').delete().eq('todo_id', id);
    if (delError) throw classify(delError);
  }
  return toTodo(data[0] as TodoTableRow);
}

// Like events, delete removes the row; its exceptions cascade.
export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw classify(error);
}

// "Chỉ lần này" — xoá: `skip`; sửa: `override` with this lap's values, subtasks and done state.
export async function upsertTodoException(
  todoId: string,
  occurrenceDate: string,
  kind: 'skip' | 'override',
  override?: TodoInput,
): Promise<void> {
  const payload: Record<string, unknown> = { todo_id: todoId, occurrence_date: occurrenceDate, kind };
  if (kind === 'override' && override) {
    payload.title = override.title;
    payload.note = override.note === '' ? null : override.note;
    payload.color = override.color;
    payload.all_day = override.allDay;
    payload.starts_at = override.startsAt;
    payload.ends_at = override.endsAt;
    payload.start_date = override.startDate;
    payload.end_date = override.endDate;
    payload.reminder_minutes = override.reminderMinutes;
    payload.subtasks = override.subtasks;
    payload.done = override.done;
    payload.done_subtasks = override.doneSubtasks;
  }
  const { error } = await supabase.from('todo_exceptions').upsert(payload, { onConflict: 'todo_id,occurrence_date' });
  if (error) throw classify(error);
}

// Tick: a one-off todo stores it on its row · a lap of a repeating todo on its exception — an
// existing `override` keeps its kind and values, otherwise a `status` row is added. No
// updated_at check: a tick never overwrites what another device edited.
export async function setTodoStatus(todo: { id: string; repeat: string }, occurrenceDate: string, status: TodoStatus): Promise<void> {
  const values = { done: status.done, done_subtasks: status.doneSubtasks };
  if (todo.repeat === 'none') {
    const { error } = await supabase.from('todos').update(values).eq('id', todo.id);
    if (error) throw classify(error);
    return;
  }
  const { data, error } = await supabase
    .from('todo_exceptions')
    .update(values)
    .eq('todo_id', todo.id)
    .eq('occurrence_date', occurrenceDate)
    .select('id');
  if (error) throw classify(error);
  if (data && data.length > 0) return;
  const { error: insError } = await supabase
    .from('todo_exceptions')
    .insert({ todo_id: todo.id, occurrence_date: occurrenceDate, kind: 'status', ...values });
  if (insError) throw classify(insError);
}
