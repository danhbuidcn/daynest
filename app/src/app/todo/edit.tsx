import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { formStateFromOccurrence, newFormState } from '@/features/events/eventFormState';
import { EntryForm, type EntryInitial } from '@/features/todos/EntryForm';
import { itemsFromOccurrence, newTodoFormState } from '@/features/todos/todoFormState';
import { useTodosInRange } from '@/features/todos/useTodos';
import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';

const NO_DATE = { year: 1900, month: 1, day: 1 };

// Form Todo (S5) — create: `?date=YYYY-MM-DD` · edit: `?todoId=…&occurrenceDate=YYYY-MM-DD`.
export default function TodoFormScreen() {
  const { settings } = useAuth();
  const params = useLocalSearchParams<{ todoId?: string; occurrenceDate?: string; date?: string }>();
  const isEdit = !!params.todoId;
  const occDate = params.occurrenceDate ? parseIsoDate(params.occurrenceDate) : NO_DATE;

  const loaded = useTodosInRange({ from: occDate, to: occDate }, settings.timeZone, isEdit);
  const baseTodo = isEdit ? loaded.data?.todos.find((t) => t.id === params.todoId) : undefined;
  const occurrence = isEdit ? loaded.occurrences.find((o) => o.eventId === params.todoId && o.occurrenceDate === params.occurrenceDate) : undefined;

  // Creating: both types' defaults, so the form can switch to an event (S5).
  const defaults = useMemo(() => {
    if (isEdit) return undefined;
    const date = params.date ? parseIsoDate(params.date) : todayIn(settings.timeZone);
    const now = new Date();
    return { todo: newTodoFormState(date, settings.timeZone, now), event: newFormState(date, settings.timeZone, now) };
  }, [isEdit, params.date, settings.timeZone]);

  const initial = useMemo<EntryInitial | null>(() => {
    if (defaults) return { form: defaults.todo, items: [], done: false };
    if (!baseTodo || !occurrence) return null;
    return { form: formStateFromOccurrence(baseTodo, occurrence, settings.timeZone), items: itemsFromOccurrence(occurrence), done: occurrence.status.done };
  }, [defaults, baseTodo, occurrence, settings.timeZone]);

  if (!initial) return null;
  return <EntryForm key={params.todoId ?? 'create'} kind="todo" initial={initial} defaults={defaults} baseTodo={baseTodo} occurrence={occurrence} />;
}
