import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { useUndoableDelete } from '@/features/cache/useUndoableDelete';
import * as api from './api';
import type { EventRow } from './event';
import type { EventOccurrence } from './occurrences';
import { hideEvent, hideEventOccurrence, useDeleteEvent, useSetOccurrenceException } from './useEvents';

// Delete flow (F2, spec S6 §5): one-off → gone at once with "Hoàn tác" · repeating → "Chỉ lần này /
// Tất cả" → the same. The write (skip exception, or the whole series with its exceptions) is sent
// when the undo window ends.
export function useEventDelete({
  event,
  occurrence,
  onDone,
  onError,
}: {
  event?: EventRow;
  occurrence?: EventOccurrence;
  onDone: () => void;
  onError: (e?: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { recheckSession } = useAuth();
  const undoable = useUndoableDelete();
  const deleteMutation = useDeleteEvent();
  const exceptionMutation = useSetOccurrenceException();
  const [scopeOpen, setScopeOpen] = useState(false);

  const perform = (scope: 'this' | 'all') => {
    setScopeOpen(false);
    if (!event || !occurrence) return;
    undoable({
      hide: () => (scope === 'all' ? hideEvent(queryClient, event.id) : hideEventOccurrence(queryClient, event.id, occurrence.occurrenceDate)),
      commit: () =>
        scope === 'all'
          ? deleteMutation.mutateAsync(event.id)
          : exceptionMutation.mutateAsync({ eventId: event.id, occurrenceDate: occurrence.occurrenceDate, kind: 'skip' }),
      onError: (e) => (e instanceof api.ForbiddenError ? void recheckSession() : onError(e)),
    });
    onDone();
  };

  return {
    start: () => (event?.repeat === 'none' ? perform('all') : setScopeOpen(true)),
    scope: {
      visible: scopeOpen,
      onThisOccurrence: () => perform('this'),
      onAllOccurrences: () => perform('all'),
      onCancel: () => setScopeOpen(false),
    },
  };
}
