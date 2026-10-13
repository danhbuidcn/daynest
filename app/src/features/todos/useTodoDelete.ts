import { useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { ForbiddenError } from '@/features/events/api';
import type { TodoOccurrence, TodoRow } from './todo';
import { useDeleteTodo, useSetTodoException } from './useTodos';

// Same flow as deleting an event (F2): one-off → confirm · repeating → "Chỉ lần này / Tất cả" → confirm.
export function useTodoDelete({
  todo,
  occurrence,
  onDone,
  onError,
}: {
  todo?: TodoRow;
  occurrence?: TodoOccurrence;
  onDone: () => void;
  onError: () => void;
}) {
  const { recheckSession } = useAuth();
  const deleteMutation = useDeleteTodo();
  const exceptionMutation = useSetTodoException();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [confirmScope, setConfirmScope] = useState<'this' | 'all' | null>(null);

  const perform = async (scope: 'this' | 'all') => {
    setConfirmScope(null);
    if (!todo || !occurrence) return;
    try {
      if (scope === 'all') await deleteMutation.mutateAsync(todo.id);
      else await exceptionMutation.mutateAsync({ todoId: todo.id, occurrenceDate: occurrence.occurrenceDate, kind: 'skip' });
      onDone();
    } catch (e) {
      if (e instanceof ForbiddenError) await recheckSession();
      else onError();
    }
  };

  return {
    start: () => (todo?.repeat === 'none' ? setConfirmScope('all') : setScopeOpen(true)),
    scope: {
      visible: scopeOpen,
      onThisOccurrence: () => {
        setScopeOpen(false);
        setConfirmScope('this');
      },
      onAllOccurrences: () => {
        setScopeOpen(false);
        setConfirmScope('all');
      },
      onCancel: () => setScopeOpen(false),
    },
    confirm: {
      visible: confirmScope !== null,
      onConfirm: () => confirmScope && void perform(confirmScope),
      onCancel: () => setConfirmScope(null),
    },
  };
}
