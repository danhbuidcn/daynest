import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { computeSpan } from '@/features/events/event';
import { useForbiddenGuard } from '@/features/events/useEvents';
import { resyncReminders } from '@/features/reminders/reminderSync';
import { narrowestCovering } from '@/lib/calendar/coveringRange';
import { isoDate } from '@/lib/calendar/monthGrid';
import { DEFAULT_TIME_ZONE } from '@/lib/calendar/timeZone';
import { editCached } from '@/features/cache/editCached';
import { putException, putRow, removeRow } from '@/lib/cache/applySaved';
import type { DateRange } from '@/lib/recurrence';
import type { TodoStatus } from '@/lib/todos';
import * as api from './api';
import { occurrencesForTodos, withStatus, type TodoExceptionRow, type TodoInput, type TodoRow, type TodosData } from './todo';

export const TODOS_KEY = 'todos';

function todosQueryOptions(range: DateRange) {
  return {
    queryKey: [TODOS_KEY, isoDate(range.from), isoDate(range.to)] as const,
    queryFn: (): Promise<TodosData> => api.fetchTodos(isoDate(range.from), isoDate(range.to)),
  };
}

// As for events: a wider range already loaded shows at once while the exact one loads.
function cachedCovering(queryClient: QueryClient, range: DateRange): TodosData | undefined {
  const loaded = queryClient
    .getQueriesData<TodosData>({ queryKey: [TODOS_KEY] })
    .flatMap(([key, data]) => (data ? [{ from: key[1] as string, to: key[2] as string, value: data }] : []));
  return narrowestCovering(loaded, isoDate(range.from), isoDate(range.to));
}

export function useTodosInRange(range: DateRange, timeZone: string = DEFAULT_TIME_ZONE, enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    ...todosQueryOptions(range),
    enabled,
    placeholderData: (previous) => cachedCovering(queryClient, range) ?? keepPreviousData(previous),
  });
  const { data } = query;
  const { from, to } = range;
  const occurrences = useMemo(
    () => (data ? occurrencesForTodos(data.todos, data.exceptions, { from, to }, timeZone) : []),
    [data, from, to, timeZone],
  );
  return { ...query, occurrences };
}

export function usePrefetchTodos(ranges: DateRange[], enabled: boolean) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    for (const range of ranges) void queryClient.prefetchQuery(todosQueryOptions(range));
  }, [queryClient, ranges, enabled]);
}

// As for events (useEvents.ts): a saved write goes into every loaded range, no refetch.
function applyToCache(queryClient: QueryClient, edit: (data: TodosData, from: string, to: string) => TodosData) {
  if (queryClient.isFetching({ queryKey: [TODOS_KEY] }) > 0) {
    void queryClient.invalidateQueries({ queryKey: [TODOS_KEY] });
    return;
  }
  for (const [key, data] of queryClient.getQueriesData<TodosData>({ queryKey: [TODOS_KEY] })) {
    if (data) queryClient.setQueryData(key, edit(data, key[1] as string, key[2] as string));
  }
}

export function useTodoCacheEdits() {
  const queryClient = useQueryClient();
  return {
    saved: (row: TodoRow, clearExceptions: boolean) =>
      applyToCache(queryClient, (data, from, to) => ({
        todos: putRow(data.todos, row, computeSpan(row), from, to),
        exceptions: clearExceptions ? data.exceptions.filter((x) => x.todoId !== row.id) : data.exceptions,
      })),
    removed: (id: string) =>
      applyToCache(queryClient, (data) => ({
        todos: removeRow(data.todos, id),
        exceptions: data.exceptions.filter((x) => x.todoId !== id),
      })),
    exception: (saved: TodoExceptionRow) =>
      applyToCache(queryClient, (data) => ({
        ...data,
        exceptions: data.todos.some((t) => t.id === saved.todoId)
          ? putException(data.exceptions, saved, (x) => x.todoId === saved.todoId && x.occurrenceDate === saved.occurrenceDate)
          : data.exceptions,
      })),
    status: (todoId: string, occurrenceDate: string, status: TodoStatus) =>
      applyToCache(queryClient, (data) => withStatus(data, todoId, occurrenceDate, status)),
  };
}

// As hideEvent / hideEventOccurrence (useEvents.ts).
export function hideTodo(queryClient: QueryClient, id: string): () => void {
  return editCached<TodosData>(queryClient, TODOS_KEY, (data) => ({
    todos: removeRow(data.todos, id),
    exceptions: data.exceptions.filter((x) => x.todoId !== id),
  }));
}

export function hideTodoOccurrence(queryClient: QueryClient, todoId: string, occurrenceDate: string): () => void {
  const skip: TodoExceptionRow = {
    id: `pending-${todoId}-${occurrenceDate}`,
    todoId,
    occurrenceDate,
    kind: 'skip',
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
    done: null,
    doneSubtasks: [],
  };
  return editCached<TodosData>(queryClient, TODOS_KEY, (data) => ({
    ...data,
    exceptions: putException(data.exceptions, skip, (x) => x.todoId === todoId && x.occurrenceDate === occurrenceDate),
  }));
}

export type SaveTodoVars = { id: string; updatedAt?: string; input: TodoInput; clearExceptions?: boolean };

export function useSaveTodo() {
  const guard = useForbiddenGuard();
  const edits = useTodoCacheEdits();
  return useMutation({
    mutationFn: (vars: SaveTodoVars) =>
      guard(() =>
        vars.updatedAt
          ? api.updateTodo(vars.id, vars.updatedAt, vars.input, { clearExceptions: vars.clearExceptions })
          : api.createTodo(vars.id, vars.input),
      ),
    onSuccess: (row, vars) => {
      void resyncReminders();
      edits.saved(row, !!vars.clearExceptions);
    },
  });
}

export function useDeleteTodo() {
  const guard = useForbiddenGuard();
  const edits = useTodoCacheEdits();
  return useMutation({
    mutationFn: (id: string) => guard(() => api.deleteTodo(id)),
    onSuccess: (_, id) => {
      void resyncReminders();
      edits.removed(id);
    },
  });
}

export type SetTodoExceptionVars = { todoId: string; occurrenceDate: string; kind: 'skip' | 'override'; override?: TodoInput };

export function useSetTodoException() {
  const guard = useForbiddenGuard();
  const edits = useTodoCacheEdits();
  return useMutation({
    mutationFn: (vars: SetTodoExceptionVars) => guard(() => api.upsertTodoException(vars.todoId, vars.occurrenceDate, vars.kind, vars.override)),
    onSuccess: (saved) => {
      void resyncReminders();
      edits.exception(saved);
    },
  });
}

export type SetTodoStatusVars = { todo: { id: string; repeat: string }; occurrenceDate: string; status: TodoStatus };

// Tick (S5): shows at once; on failure the cache goes back and the caller shows a toast.
export function useSetTodoStatus() {
  const queryClient = useQueryClient();
  const guard = useForbiddenGuard();
  return useMutation({
    mutationFn: (vars: SetTodoStatusVars) => guard(() => api.setTodoStatus(vars.todo, vars.occurrenceDate, vars.status)),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: [TODOS_KEY] });
      const before = queryClient.getQueriesData<TodosData>({ queryKey: [TODOS_KEY] });
      queryClient.setQueriesData<TodosData>({ queryKey: [TODOS_KEY] }, (data) =>
        data ? withStatus(data, vars.todo.id, vars.occurrenceDate, vars.status) : data,
      );
      return { before };
    },
    onError: (_e, _vars, context) => {
      for (const [key, data] of context?.before ?? []) queryClient.setQueryData(key, data);
    },
    // A done lap no longer reminds, so the tick also re-plans reminders.
    onSettled: () => {
      void resyncReminders();
      return queryClient.invalidateQueries({ queryKey: [TODOS_KEY] });
    },
  });
}
