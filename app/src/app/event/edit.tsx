import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AutoGrowField } from '@/components/AutoGrowField';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/Dialog';
import { FormScreen } from '@/components/FormScreen';
import { Switch } from '@/components/Switch';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import type { EventRow } from '@/features/events/event';
import {
  formStateFromOccurrence,
  isFormValid,
  newFormState,
  NOTE_MAX,
  TITLE_MAX,
  type FormState,
} from '@/features/events/eventFormState';
import { ColorPicker } from '@/features/events/form/ColorPicker';
import { DateTimeRows } from '@/features/events/form/DateTimeRows';
import { FormRow } from '@/features/events/form/FormRow';
import { ReminderSection } from '@/features/events/form/ReminderSection';
import { ConflictDialog, OccurrenceActionDialog } from '@/features/events/OccurrenceDialogs';
import type { EventOccurrence } from '@/features/events/occurrences';
import { repeatLabel } from '@/features/events/repeatLabel';
import { RepeatPicker } from '@/features/events/RepeatPicker';
import { useEventFormSave } from '@/features/events/useEventFormSave';
import { useEventsInRange } from '@/features/events/useEvents';
import { parseIsoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { colors, radius, space } from '@/theme';

const NO_DATE = { year: 1900, month: 1, day: 1 };

// Màn 9 — create: `?date=YYYY-MM-DD` · edit: `?eventId=…&occurrenceDate=YYYY-MM-DD`.
export default function EventFormScreen() {
  const { settings } = useAuth();
  const params = useLocalSearchParams<{ eventId?: string; occurrenceDate?: string; date?: string }>();
  const isEdit = !!params.eventId;
  const occDate = params.occurrenceDate ? parseIsoDate(params.occurrenceDate) : NO_DATE;

  const loaded = useEventsInRange({ from: occDate, to: occDate }, settings.timeZone, isEdit);
  const baseEvent = isEdit ? loaded.data?.events.find((e) => e.id === params.eventId) : undefined;
  const occurrence = isEdit ? loaded.occurrences.find((o) => o.eventId === params.eventId && o.occurrenceDate === params.occurrenceDate) : undefined;

  const initial = useMemo<FormState | null>(() => {
    if (!isEdit) return newFormState(params.date ? parseIsoDate(params.date) : todayIn(settings.timeZone), settings.timeZone);
    return baseEvent && occurrence ? formStateFromOccurrence(baseEvent, occurrence, settings.timeZone) : null;
  }, [isEdit, baseEvent, occurrence, params.date, settings.timeZone]);

  if (!initial) return null;
  return <EventForm key={params.eventId ?? 'create'} initial={initial} baseEvent={baseEvent} occurrence={occurrence} />;
}

function EventForm({ initial, baseEvent, occurrence }: { initial: FormState; baseEvent?: EventRow; occurrence?: EventOccurrence }) {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { settings } = useAuth();
  const [form, setForm] = useState(initial);
  const [repeatOpen, setRepeatOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const saver = useEventFormSave({
    form,
    baseEvent,
    occurrence,
    onSaved: () => {
      toast(t('events.form.saved'));
      router.back();
    },
    onClose: () => router.back(),
    onError: () => toast(t('events.form.saveFailed'), 'error'),
  });

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const canSave = isFormValid(form, settings.timeZone) && !saver.saving;
  const close = () => (dirty ? setDiscardOpen(true) : router.back());

  return (
    <FormScreen
      title={t('events.form.title')}
      onBack={close}
      closeIcon
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
        <FormRow icon="allDay" label={t('events.form.allDay')} trailing={<Switch value={form.allDay} onValueChange={(allDay) => setForm({ ...form, allDay })} />} />
        <DateTimeRows form={form} onChange={setForm} />
        <View style={styles.divider} />
        <ReminderSection form={form} onChange={setForm} />
        <View style={styles.divider} />
        <FormRow icon="repeat" label={repeatLabel(t, form.repeat, form.repeatInterval, form.startDate).title} onPress={() => setRepeatOpen(true)} chevron />
        <View style={styles.divider} />
        <FormRow icon="palette" label={t('events.form.color')} />
        <ColorPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
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
      <OccurrenceActionDialog {...saver.scope} />
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
