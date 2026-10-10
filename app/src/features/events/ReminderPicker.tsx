import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { BottomSheet } from '@/components/BottomSheet';
import { Icon } from '@/components/Icon';
import { colors, space } from '@/theme';
import { REMINDER_OPTIONS } from './reminderOptions';

// "+ Thêm nhắc nhở" (màn 11) — chọn đúng 1 mốc chưa có trong event rồi Hoàn tất.
export function ReminderPicker({
  visible,
  already,
  onCancel,
  onAdd,
}: {
  visible: boolean;
  already: number[];
  onCancel: () => void;
  onAdd: (minutes: number) => void;
}) {
  const { t } = useTranslation();
  const options = REMINDER_OPTIONS.filter((m) => !already.includes(m));
  const [picked, setPicked] = useState<number | null>(options[0] ?? null);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setPicked(options[0] ?? null);
  }

  return (
    <BottomSheet
      visible={visible}
      title={t('events.reminderSheet.title')}
      cancelLabel={t('events.reminderSheet.cancel')}
      doneLabel={t('events.reminderSheet.done')}
      onCancel={onCancel}
      onDone={() => {
        if (picked !== null) onAdd(picked);
      }}>
      <ScrollView style={styles.list}>
        {options.map((m) => {
          const on = m === picked;
          return (
            <Pressable key={m} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setPicked(m)} style={styles.row}>
              <AppText weight={on ? 'extrabold' : undefined} style={styles.flex}>
                {t(`events.reminderOptions.${m}`)}
              </AppText>
              {on ? <Icon name="check" size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 320 },
  row: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg },
  flex: { flex: 1 },
});
