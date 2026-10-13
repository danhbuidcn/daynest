import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AutoGrowField } from '@/components/AutoGrowField';
import { Button } from '@/components/Button';
import { ColorRow } from '@/components/ColorRow';
import { ConfirmDialog } from '@/components/Dialog';
import { FormScreen } from '@/components/FormScreen';
import { Switch } from '@/components/Switch';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { formStateFromOccurrence, isFormValid, NOTE_MAX, TITLE_MAX, type FormState } from '@/features/events/eventFormState';
import { DateTimeRows } from '@/features/events/form/DateTimeRows';
import { FormRow } from '@/features/events/form/FormRow';
import { ReminderSection } from '@/features/events/form/ReminderSection';
import { ConflictDialog, OccurrenceActionDialog } from '@/features/events/OccurrenceDialogs';
import { repeatLabel } from '@/features/events/repeatLabel';
import { RepeatPicker } from '@/features/events/RepeatPicker';
import { ChecklistBlock } from '@/features/notes/editor/ChecklistBlock';
import type { TodoOccurrence, TodoRow } from '@/features/todos/todo';
import { itemsFromOccurrence, newTodoFormState } from '@/features/todos/todoFormState';
import { useTodoFormSave } from '@/features/todos/useTodoFormSave';
import { useTodosInRange } from '@/features/todos/useTodos';
import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import type { ChecklistItem } from '@/lib/notes';
import { SUBTASK_MAX_ITEMS } from '@/lib/todos';
import { colors, radius, space } from '@/theme';

const NO_DATE = { year: 1900, month: 1, day: 1 };

type Initial = { form: FormState; items: ChecklistItem[]; done: boolean };

// Form Todo (S5) — create: `?date=YYYY-MM-DD` · edit: `?todoId=…&occurrenceDate=YYYY-MM-DD`.
export default function TodoFormScreen() {
  const { settings } = useAuth();
  const params = useLocalSearchParams<{ todoId?: string; occurrenceDate?: string; date?: string }>();
  const isEdit = !!params.todoId;
  const occDate = params.occurrenceDate ? parseIsoDate(params.occurrenceDate) : NO_DATE;

  const loaded = useTodosInRange({ from: occDate, to: occDate }, settings.timeZone, isEdit);
  const baseTodo = isEdit ? loaded.data?.todos.find((t) => t.id === params.todoId) : undefined;
  const occurrence = isEdit ? loaded.occurrences.find((o) => o.eventId === params.todoId && o.occurrenceDate === params.occurrenceDate) : undefined;

  const initial = useMemo<Initial | null>(() => {
    if (!isEdit) {
      const date = params.date ? parseIsoDate(params.date) : todayIn(settings.timeZone);
      return { form: newTodoFormState(date, settings.timeZone), items: [], done: false };
    }
    if (!baseTodo || !occurrence) return null;
    return { form: formStateFromOccurrence(baseTodo, occurrence, settings.timeZone), items: itemsFromOccurrence(occurrence), done: occurrence.status.done };
  }, [isEdit, baseTodo, occurrence, params.date, settings.timeZone]);

  if (!initial) return null;
  return <TodoForm key={params.todoId ?? 'create'} initial={initial} baseTodo={baseTodo} occurrence={occurrence} />;
}

function TodoForm({ initial, baseTodo, occurrence }: { initial: Initial; baseTodo?: TodoRow; occurrence?: TodoOccurrence }) {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { settings } = useAuth();
  const [form, setForm] = useState(initial.form);
  const [items, setItems] = useState(initial.items);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const saver = useTodoFormSave({
    form,
    items,
    done: initial.done,
    baseTodo,
    occurrence,
    onSaved: () => {
      toast(t('events.form.saved'));
      router.back();
    },
    onClose: () => router.back(),
    onError: () => toast(t('events.form.saveFailed'), 'error'),
  });

  const dirty = JSON.stringify({ form, items }) !== JSON.stringify({ form: initial.form, items: initial.items });
  const canSave = isFormValid(form, settings.timeZone) && !saver.saving;
  const close = () => (dirty ? setDiscardOpen(true) : router.back());
  const filled = items.filter((i) => i.text.trim() !== '');

  return (
    <FormScreen
      title={t('todos.form.title')}
      onBack={close}
      closeIcon
      nestable
      footer={<Button label={t('events.form.save')} onPress={saver.save} disabled={!canSave} />}>
      <View style={styles.card}>
        <AutoGrowField
          value={form.title}
          onChangeText={(title) => setForm({ ...form, title })}
          placeholder={t('events.form.titlePlaceholder')}
          maxLength={TITLE_MAX}
          maxLines={3}
          variant="heading"
        />
        <View style={styles.divider} />
        <AutoGrowField
          value={form.note}
          onChangeText={(note) => setForm({ ...form, note })}
          placeholder={t('events.form.notePlaceholder')}
          maxLength={NOTE_MAX}
          maxLines={6}
        />
      </View>

      <View style={styles.card}>
        <FormRow
          icon="checklist"
          label={t('todos.subtasks')}
          trailing={
            filled.length > 0 ? (
              <AppText variant="caption" color={colors.textMuted}>
                {`${filled.filter((i) => i.done).length}/${filled.length}`}
              </AppText>
            ) : undefined
          }
        />
        <ChecklistBlock
          items={items}
          onChange={(next, nextFocus) => {
            setItems(next);
            if (nextFocus) setFocusId(nextFocus);
          }}
          focusId={focusId}
          onFocusHandled={() => setFocusId(null)}
          maxItems={SUBTASK_MAX_ITEMS}
          addLabel={t('todos.addSubtask')}
          placeholder={t('todos.subtaskPlaceholder')}
          rowBackground={colors.surface}
          showWhenEmpty
        />
      </View>

      <View style={styles.card}>
        <FormRow icon="allDay" label={t('events.form.allDay')} trailing={<Switch value={form.allDay} onValueChange={(allDay) => setForm({ ...form, allDay })} />} />
        <DateTimeRows form={form} onChange={setForm} />
        <View style={styles.divider} />
        <ReminderSection form={form} onChange={setForm} />
        <View style={styles.divider} />
        <FormRow icon="repeat" label={repeatLabel(t, form.repeat, form.repeatInterval, form.startDate).title} onPress={() => setRepeatOpen(true)} chevron />
        <View style={styles.divider} />
        <FormRow icon="palette" label={t('events.form.color')} />
        <ColorRow value={form.color} onChange={(color) => setForm({ ...form, color })} />
      </View>

      <RepeatPicker
        visible={repeatOpen}
        value={{ repeat: form.repeat, interval: form.repeatInterval, until: form.repeatUntil }}
        startDate={form.startDate}
        onCancel={() => setRepeatOpen(false)}
        onDone={(v) => {
          setRepeatOpen(false);
          setForm({ ...form, repeat: v.repeat, repeatInterval: v.interval, repeatUntil: v.until });
        }}
      />
      <ConfirmDialog
        visible={discardOpen}
        title={t('events.form.discardTitle')}
        text={t('events.form.discardText')}
        cancelLabel={t('events.form.keepEditing')}
        confirmLabel={t('events.form.discard')}
        onCancel={() => setDiscardOpen(false)}
        onConfirm={() => router.back()}
      />
      <OccurrenceActionDialog title={t('todos.occurrenceTitle')} {...saver.scope} />
      <ConfirmDialog
        visible={saver.clearExceptions.visible}
        title={t('events.form.clearExceptionsTitle')}
        text={t('events.form.clearExceptionsText')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('events.form.save')}
        onCancel={saver.clearExceptions.onCancel}
        onConfirm={saver.clearExceptions.onConfirm}
      />
      <ConflictDialog {...saver.conflict} />
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space.lg, gap: space.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.xs },
});
