import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import * as api from './api';
import type { EventRow } from './event';
import { changesSeriesAnchor, toEventInput, type FormState } from './eventFormState';
import type { EventOccurrence } from './occurrences';
import { EVENTS_KEY, useSaveEvent, useSetOccurrenceException } from './useEvents';

// Save flow of the event form (F2): create · edit a one-off event · edit a repeating event with
// "Chỉ lần này / Tất cả" (+ warning when exceptions get cleared) · conflict "Tải bản mới / Ghi đè".
export function useEventFormSave({
  form,
  baseEvent,
  occurrence,
  onSaved,
  onClose,
  onError,
}: {
  form: FormState;
  baseEvent?: EventRow;
  occurrence?: EventOccurrence;
  onSaved: () => void;
  onClose: () => void;
  onError: () => void;
}) {
  const queryClient = useQueryClient();
  const { settings, recheckSession } = useAuth();
  const saveMutation = useSaveEvent();
  const exceptionMutation = useSetOccurrenceException();
  const [saving, setSaving] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);

  const input = () => toEventInput(form, settings.timeZone);

  const run = async (write: () => Promise<unknown>) => {
    setSaving(true);
    try {
      await write();
      onSaved();
    } catch (e) {
      if (e instanceof api.ConflictError) setConflictOpen(true);
      else if (e instanceof api.ForbiddenError) await recheckSession();
      else onError();
    } finally {
      setSaving(false);
    }
  };

  const saveAll = (clearExceptions: boolean) =>
    run(() => saveMutation.mutateAsync({ id: baseEvent!.id, updatedAt: baseEvent!.updatedAt, input: input(), clearExceptions }));

  const save = () => {
    if (!baseEvent) return void run(() => saveMutation.mutateAsync({ input: input() }));
    if (baseEvent.repeat === 'none') return void saveAll(false);
    setScopeOpen(true);
  };

  return {
    saving,
    save,
    scope: {
      visible: scopeOpen,
      onThisOccurrence: () => {
        setScopeOpen(false);
        void run(() =>
          exceptionMutation.mutateAsync({ eventId: baseEvent!.id, occurrenceDate: occurrence!.occurrenceDate, kind: 'override', override: input() }),
        );
      },
      onAllOccurrences: () => {
        setScopeOpen(false);
        if (changesSeriesAnchor(baseEvent!, form, settings.timeZone)) setClearOpen(true);
        else void saveAll(false);
      },
      onCancel: () => setScopeOpen(false),
    },
    clearExceptions: {
      visible: clearOpen,
      onConfirm: () => {
        setClearOpen(false);
        void saveAll(true);
      },
      onCancel: () => setClearOpen(false),
    },
    conflict: {
      visible: conflictOpen,
      // "Tải bản mới": drop local edits and show the other device's version.
      onReload: () => {
        setConflictOpen(false);
        void queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
        onClose();
      },
      // "Ghi đè": re-read the current updated_at, then save over it.
      onOverwrite: () => {
        setConflictOpen(false);
        if (!baseEvent || !occurrence) return;
        void run(async () => {
          const fresh = (await api.fetchEvents(occurrence.occurrenceDate, occurrence.occurrenceDate)).find((e) => e.id === baseEvent.id);
          // Deleted on the other device meanwhile: nothing left to overwrite.
          if (!fresh) throw new Error('gone');
          await saveMutation.mutateAsync({ id: baseEvent.id, updatedAt: fresh.updatedAt, input: input() });
        });
      },
    },
  };
}
