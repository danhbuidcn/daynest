import { useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import * as api from './api';
import type { EventRow } from './event';
import type { EventOccurrence } from './occurrences';
import { useDeleteEvent, useSetOccurrenceException } from './useEvents';

// Delete flow (F2): one-off → confirm → delete · repeating → "Chỉ lần này / Tất cả" → confirm →
// skip exception or delete the whole series (its exceptions cascade).
export function useEventDelete({
  event,
  occurrence,
  onDone,
  onError,
}: {
  event?: EventRow;
  occurrence?: EventOccurrence;
  onDone: () => void;
  onError: () => void;
}) {
  const { recheckSession } = useAuth();
  const deleteMutation = useDeleteEvent();
  const exceptionMutation = useSetOccurrenceException();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [confirmScope, setConfirmScope] = useState<'this' | 'all' | null>(null);

  const perform = async (scope: 'this' | 'all') => {
    setConfirmScope(null);
    if (!event || !occurrence) return;
    try {
      if (scope === 'all') await deleteMutation.mutateAsync(event.id);
      else await exceptionMutation.mutateAsync({ eventId: event.id, occurrenceDate: occurrence.occurrenceDate, kind: 'skip' });
      onDone();
    } catch (e) {
      if (e instanceof api.ForbiddenError) await recheckSession();
      else onError();
    }
  };

  return {
    start: () => (event?.repeat === 'none' ? setConfirmScope('all') : setScopeOpen(true)),
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
