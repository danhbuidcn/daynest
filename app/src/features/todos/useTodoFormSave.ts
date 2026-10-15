import { useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { ConflictError, ForbiddenError } from '@/features/events/api';
import { changesSeriesAnchor, type FormState } from '@/features/events/eventFormState';
import { resyncReminders } from '@/features/reminders/reminderSync';
import { isoDate } from '@/lib/calendar/monthGrid';
import { success } from '@/lib/haptics';
import { requestPermission } from '@/lib/notifications/scheduler';
import type { ChecklistItem } from '@/lib/notes';
import { NOT_DONE } from '@/lib/todos';
import * as api from './api';
import type { TodoOccurrence, TodoRow } from './todo';
import { sameStatus, toTodoInput } from './todoFormState';
import { TODOS_KEY, useSaveTodo, useSetTodoException, useTodoCacheEdits } from './useTodos';

// Save flow of the todo form — the event form's (F2) + subtasks and the tick of the lap being
// edited: create · edit a one-off · "Chỉ lần này / Tất cả" (+ clear warning) · conflict.
export function useTodoFormSave({
  form,
  items,
  done,
  baseTodo,
  occurrence,
  onSaved,
  onClose,
  onError,
}: {
  form: FormState;
  items: ChecklistItem[];
  done: boolean;
  baseTodo?: TodoRow;
  occurrence?: TodoOccurrence;
  onSaved: () => void;
  onClose: () => void;
  onError: () => void;
}) {
  const queryClient = useQueryClient();
  const { settings, recheckSession } = useAuth();
  const edits = useTodoCacheEdits();
  const saveMutation = useSaveTodo();
  const exceptionMutation = useSetTodoException();
  const [newId] = useState(() => Crypto.randomUUID());
  const [saving, setSaving] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);

  const built = () => toTodoInput(form, items, done, settings.timeZone);

  const run = async (write: () => Promise<unknown>) => {
    setSaving(true);
    try {
      await write();
      success();
      onSaved();
      if (form.reminderOn && form.reminderMinutes.length > 0 && settings.notificationsEnabled) {
        void requestPermission()
          .then((s) => (s === 'granted' ? resyncReminders() : undefined))
          .catch(() => {});
      }
    } catch (e) {
      if (e instanceof ConflictError) setConflictOpen(true);
      else if (e instanceof ForbiddenError) await recheckSession();
      else onError();
    } finally {
      setSaving(false);
    }
  };

  // Writes the row, then — for a repeating todo — the tick changed in the form onto its lap
  // (the edited one, or the first lap when the series was just created or restarted).
  const writeAll = async (id: string, updatedAt: string | undefined, clearExceptions: boolean) => {
    const { input, status } = built();
    await saveMutation.mutateAsync({ id, updatedAt, input, clearExceptions });
    if (input.repeat === 'none') return;
    const restarted = !baseTodo || clearExceptions || baseTodo.repeat === 'none';
    const before = restarted ? NOT_DONE : occurrence!.status;
    if (sameStatus(status, before)) return;
    const lap = restarted ? isoDate(form.startDate) : occurrence!.occurrenceDate;
    await api.setTodoStatus({ id, repeat: input.repeat }, lap, status);
    edits.status(id, lap, status);
    void resyncReminders();
  };

  const saveAll = (clearExceptions: boolean) => run(() => writeAll(baseTodo!.id, baseTodo!.updatedAt, clearExceptions));

  const save = () => {
    if (!baseTodo) return void run(() => writeAll(newId, undefined, false));
    if (baseTodo.repeat === 'none') return void saveAll(false);
    setScopeOpen(true);
  };

  return {
    saving,
    save,
    scope: {
      visible: scopeOpen,
      onThisOccurrence: () => {
        setScopeOpen(false);
        const { input, status } = built();
        void run(() =>
          exceptionMutation.mutateAsync({
            todoId: baseTodo!.id,
            occurrenceDate: occurrence!.occurrenceDate,
            kind: 'override',
            override: { ...input, done: status.done, doneSubtasks: status.doneSubtasks },
          }),
        );
      },
      onAllOccurrences: () => {
        setScopeOpen(false);
        if (changesSeriesAnchor(baseTodo!, form, settings.timeZone)) setClearOpen(true);
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
      onReload: () => {
        setConflictOpen(false);
        void queryClient.invalidateQueries({ queryKey: [TODOS_KEY] });
        onClose();
      },
      onOverwrite: () => {
        setConflictOpen(false);
        if (!baseTodo || !occurrence) return;
        void run(async () => {
          const fresh = (await api.fetchTodos(occurrence.occurrenceDate, occurrence.occurrenceDate)).todos.find((t) => t.id === baseTodo.id);
          if (!fresh) throw new Error('gone');
          await writeAll(baseTodo.id, fresh.updatedAt, false);
        });
      },
    },
  };
}
