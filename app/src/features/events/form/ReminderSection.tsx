import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { Switch } from '@/components/Switch';
import { colors, space } from '@/theme';
import { withReminderOn, type FormState } from '../eventFormState';
import { ReminderPicker } from '../ReminderPicker';
import { MAX_REMINDERS } from '../reminderOptions';
import { FormRow } from './FormRow';

// "Cài đặt nhắc nhở" (F3 mô tả): switch · one row per threshold with ✕ · "+ Thêm nhắc nhở".
export function ReminderSection({ form, onChange }: { form: FormState; onChange: (f: FormState) => void }) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <FormRow
        icon="bell"
        label={t('events.form.reminders')}
        trailing={<Switch value={form.reminderOn} onValueChange={(on) => onChange(withReminderOn(form, on))} />}
      />
      {form.reminderOn
        ? form.reminderMinutes.map((m) => (
            <FormRow
              key={m}
              icon="clock"
              indent
              label={t(`events.reminderOptions.${m}`)}
              trailing={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove"
                  hitSlop={8}
                  onPress={() => onChange({ ...form, reminderMinutes: form.reminderMinutes.filter((x) => x !== m) })}>
                  <Icon name="close" size={16} color={colors.textMuted} />
                </Pressable>
              }
            />
          ))
        : null}
      {form.reminderOn && form.reminderMinutes.length < MAX_REMINDERS ? (
        <Pressable accessibilityRole="button" onPress={() => setPickerOpen(true)} style={styles.add}>
          <Icon name="plus" size={16} color={colors.text} />
          <AppText>{t('events.form.addReminder')}</AppText>
        </Pressable>
      ) : null}
      <ReminderPicker
        visible={pickerOpen}
        already={form.reminderMinutes}
        onCancel={() => setPickerOpen(false)}
        onAdd={(m) => {
          setPickerOpen(false);
          onChange({ ...form, reminderMinutes: [...form.reminderMinutes, m] });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  add: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 40, paddingLeft: space.xl },
});
