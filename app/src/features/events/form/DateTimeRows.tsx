import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, space } from '@/theme';
import { endsBeforeStart, withStartDate, type FormState } from '../eventFormState';
import { clockLabel, dateLabel } from '../format';
import { FormRow } from './FormRow';

type Picking = { which: 'start' | 'end'; mode: 'date' | 'time' } | null;

// Start/end rows (màn 9) + the OS date/time picker (màn 12) + the "end before start" error.
export function DateTimeRows({ form, onChange }: { form: FormState; onChange: (f: FormState) => void }) {
  const { t } = useTranslation();
  const { settings } = useAuth();
  const [picking, setPicking] = useState<Picking>(null);

  const row = (which: 'start' | 'end') => {
    const date = which === 'start' ? form.startDate : form.endDate;
    const time = which === 'start' ? form.startTime : form.endTime;
    return (
      <FormRow
        icon={which === 'start' ? 'arrowRight' : 'arrowLeft'}
        label={dateLabel(t, date)}
        onPress={() => setPicking({ which, mode: 'date' })}
        trailing={
          form.allDay ? undefined : (
            <Pressable accessibilityRole="button" onPress={() => setPicking({ which, mode: 'time' })} hitSlop={8}>
              <AppText>{clockLabel(t, time, settings.use24h)}</AppText>
            </Pressable>
          )
        }
      />
    );
  };

  const pickerValue = () => {
    if (!picking) return new Date();
    const date = picking.which === 'start' ? form.startDate : form.endDate;
    const time = picking.which === 'start' ? form.startTime : form.endTime;
    return picking.mode === 'date' ? new Date(date.year, date.month - 1, date.day) : new Date(2000, 0, 1, time.hour, time.minute);
  };

  const onPicked = (value: Date) => {
    if (!picking) return;
    if (picking.mode === 'date') {
      const d = { year: value.getFullYear(), month: value.getMonth() + 1, day: value.getDate() };
      onChange(picking.which === 'start' ? withStartDate(form, d) : { ...form, endDate: d });
    } else {
      const time = { hour: value.getHours(), minute: value.getMinutes(), second: 0 };
      onChange(picking.which === 'start' ? { ...form, startTime: time } : { ...form, endTime: time });
    }
  };

  return (
    <>
      {row('start')}
      {row('end')}
      {endsBeforeStart(form, settings.timeZone) ? (
        <AppText variant="caption" color={colors.error} style={styles.error}>
          {t('events.form.endBeforeStart')}
        </AppText>
      ) : null}
      {picking ? (
        <DateTimePicker
          value={pickerValue()}
          mode={picking.mode}
          is24Hour={settings.use24h}
          onChange={(e: { type: string }, value?: Date) => {
            setPicking(null);
            if (e.type === 'set' && value) onPicked(value);
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  error: { marginTop: -space.xs, marginBottom: space.xs },
});
