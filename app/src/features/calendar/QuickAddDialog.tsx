import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { PopupHeader } from '@/components/PopupHeader';
import { Icon, type IconName } from '@/components/Icon';
import { colors, radius, space } from '@/theme';

// Pop-up `+` (màn 8): tạo nhanh — Sự kiện (mở form) · Ghi chú (tới bước 9, tạm toast).
export function QuickAddDialog({
  visible,
  title,
  onClose,
  onCreateEvent,
  onCreateNote,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onCreateEvent: () => void;
  onCreateNote: () => void;
}) {
  const { t } = useTranslation();
  return (
    <DialogShell visible={visible} onClose={onClose} compact>
      <PopupHeader title={title} onClose={onClose} />
      <QuickOption icon="calendar" label={t('events.quickAdd.event')} tone="primary" onPress={onCreateEvent} />
      <QuickOption icon="note" label={t('events.quickAdd.note')} tone="warning" onPress={onCreateNote} />
    </DialogShell>
  );
}

function QuickOption({ icon, label, tone, onPress }: { icon: IconName; label: string; tone: 'primary' | 'warning'; onPress: () => void }) {
  const soft = tone === 'primary' ? colors.primarySoft : colors.warningSoft;
  const fg = tone === 'primary' ? colors.primaryDark : colors.warning;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.option, { backgroundColor: soft }]}>
      <View style={[styles.icon, { backgroundColor: colors.surface }]}>
        <Icon name={icon} size={20} color={fg} />
      </View>
      <AppText weight="bold" color={fg}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 56, borderRadius: radius.button, paddingHorizontal: space.md, marginTop: space.sm },
  icon: { width: 32, height: 32, borderRadius: radius.icon, alignItems: 'center', justifyContent: 'center' },
});
