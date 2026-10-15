import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { AutoGrowField } from '@/components/AutoGrowField';
import { Button } from '@/components/Button';
import { ColorRow } from '@/components/ColorRow';
import { ConfirmDialog } from '@/components/Dialog';
import { FormScreen } from '@/components/FormScreen';
import { Switch } from '@/components/Switch';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { QuickAddDialog } from '@/features/calendar/QuickAddDialog';
import { isFormValid, NOTE_MAX, TITLE_MAX, type FormState } from '@/features/events/eventFormState';
import { DateTimeRows } from '@/features/events/form/DateTimeRows';
import { FormRow } from '@/features/events/form/FormRow';
import { ReminderSection } from '@/features/events/form/ReminderSection';
import { ConflictDialog, OccurrenceActionDialog } from '@/features/events/OccurrenceDialogs';
import { repeatLabel } from '@/features/events/repeatLabel';
import { RepeatPicker } from '@/features/events/RepeatPicker';
import { useEventFormSave } from '@/features/events/useEventFormSave';
import { ChecklistBlock } from '@/features/notes/editor/ChecklistBlock';
import { newNoteHref } from '@/features/notes/newNote';
import { isoDate } from '@/lib/calendar/monthGrid';
import type { ChecklistItem } from '@/lib/notes';
import { SUBTASK_MAX_ITEMS } from '@/lib/todos';
import { makeStyles, radius, space, useTheme } from '@/theme';
import type { TodoOccurrence, TodoRow } from './todo';
import { switchKind } from './todoFormState';
import { useTodoFormSave } from './useTodoFormSave';

export type EntryKind = 'event' | 'todo';
export type EntryInitial = { form: FormState; items: ChecklistItem[]; done: boolean };

// Event + todo form (S5). Creating (`defaults` given): the "Todo ▾" title reopens the `+` popup
// to switch type in place. Editing a todo: no switch. Editing an event stays on its own screen.
export function EntryForm({
  kind: initialKind,
  initial,
  defaults,
  baseTodo,
  occurrence,
}: {
  kind: EntryKind;
  initial: EntryInitial;
  defaults?: Record<EntryKind, FormState>;
  baseTodo?: TodoRow;
  occurrence?: TodoOccurrence;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { settings } = useAuth();
  const [kind, setKind] = useState(initialKind);
  const [form, setForm] = useState(initial.form);
  const [items, setItems] = useState(initial.items);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [kindOpen, setKindOpen] = useState(false);
  // Where "Bỏ thay đổi" leads: back, or into the note / expense form picked in the popup.
  const [discardTo, setDiscardTo] = useState<(() => void) | null>(null);

  const callbacks = {
    onSaved: () => {
      toast(t('events.form.saved'));
      router.back();
    },
    onClose: () => router.back(),
    onError: () => toast(t('events.form.saveFailed'), 'error'),
  };
  const todoSaver = useTodoFormSave({ form, items, done: initial.done, baseTodo, occurrence, ...callbacks });
  const eventSaver = useEventFormSave({ form, ...callbacks });
  const saver = kind === 'todo' ? todoSaver : eventSaver;

  const start = defaults ? defaults[kind] : initial.form;
  const dirty = JSON.stringify({ form, items }) !== JSON.stringify({ form: start, items: initial.items });
  const canSave = isFormValid(form, settings.timeZone) && !saver.saving;
  const leave = (go: () => void) => (dirty ? setDiscardTo(() => go) : go());
  const filled = items.filter((i) => i.text.trim() !== '');

  const pickKind = (next: EntryKind) => {
    setKindOpen(false);
    if (!defaults || next === kind) return;
    setForm(switchKind(form, defaults[kind], defaults[next]));
    setKind(next);
  };
  const openOther = (href: Href) => {
    setKindOpen(false);
    leave(() => router.replace(href));
  };

  return (
    <FormScreen
      title={t(kind === 'todo' ? 'todos.form.title' : 'events.form.title')}
      onBack={() => leave(() => router.back())}
      closeIcon
      nestable
      onPressTitle={defaults ? () => setKindOpen(true) : undefined}
      titleHint={t('todos.form.changeKind')}
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

      {kind === 'todo' ? (
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
      ) : null}

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
      <QuickAddDialog
        visible={kindOpen}
        current={kind}
        onClose={() => setKindOpen(false)}
        onCreateEvent={() => pickKind('event')}
        onCreateTodo={() => pickKind('todo')}
        onCreateNote={() => openOther(newNoteHref())}
        onCreateExpense={() => openOther({ pathname: '/expense/edit', params: { date: isoDate(start.startDate) } })}
      />
      <ConfirmDialog
        visible={discardTo !== null}
        title={t('events.form.discardTitle')}
        text={t('events.form.discardText')}
        cancelLabel={t('events.form.keepEditing')}
        confirmLabel={t('events.form.discard')}
        onCancel={() => setDiscardTo(null)}
        onConfirm={() => {
          const go = discardTo;
          setDiscardTo(null);
          go?.();
        }}
      />
      {/* Only editing a repeating todo asks these; creating never does. */}
      <OccurrenceActionDialog title={t('todos.occurrenceTitle')} {...todoSaver.scope} />
      <ConfirmDialog
        visible={todoSaver.clearExceptions.visible}
        title={t('events.form.clearExceptionsTitle')}
        text={t('events.form.clearExceptionsText')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('events.form.save')}
        onCancel={todoSaver.clearExceptions.onCancel}
        onConfirm={todoSaver.clearExceptions.onConfirm}
      />
      <ConflictDialog {...saver.conflict} />
    </FormScreen>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space.lg, gap: space.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.xs },
}));
