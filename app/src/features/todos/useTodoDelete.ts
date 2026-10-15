import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { useUndoableDelete } from '@/features/cache/useUndoableDelete';
import { ForbiddenError } from '@/features/events/api';
import type { TodoOccurrence, TodoRow } from './todo';
import { hideTodo, hideTodoOccurrence, useDeleteTodo, useSetTodoException } from './useTodos';

// Same flow as deleting an event (useEventDelete.ts).
export function useTodoDelete({
  todo,
  occurrence,
  onDone,
  onError,
}: {
  todo?: TodoRow;
  occurrence?: TodoOccurrence;
  onDone: () => void;
  onError: (e?: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { recheckSession } = useAuth();
  const undoable = useUndoableDelete();
  const deleteMutation = useDeleteTodo();
  const exceptionMutation = useSetTodoException();
  const [scopeOpen, setScopeOpen] = useState(false);

  const perform = (scope: 'this' | 'all') => {
    setScopeOpen(false);
    if (!todo || !occurrence) return;
    undoable({
      hide: () => (scope === 'all' ? hideTodo(queryClient, todo.id) : hideTodoOccurrence(queryClient, todo.id, occurrence.occurrenceDate)),
      commit: () =>
        scope === 'all'
          ? deleteMutation.mutateAsync(todo.id)
          : exceptionMutation.mutateAsync({ todoId: todo.id, occurrenceDate: occurrence.occurrenceDate, kind: 'skip' }),
      onError: (e) => (e instanceof ForbiddenError ? void recheckSession() : onError(e)),
    });
    onDone();
  };

  return {
    start: () => (todo?.repeat === 'none' ? perform('all') : setScopeOpen(true)),
    scope: {
      visible: scopeOpen,
      onThisOccurrence: () => perform('this'),
      onAllOccurrences: () => perform('all'),
      onCancel: () => setScopeOpen(false),
    },
  };
}
