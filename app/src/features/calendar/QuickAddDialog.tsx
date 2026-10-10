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
    <DialogShell visible={visible} onClose={onClose} boxStyle={styles.box}>
      <PopupHeader title={title} onClose={onClose} />
      <View style={styles.options}>
        <QuickOption icon="calendar" label={t('events.quickAdd.event')} tone="primary" onPress={onCreateEvent} />
        <QuickOption icon="note" label={t('events.quickAdd.note')} tone="warning" onPress={onCreateNote} />
      </View>
    </DialogShell>
  );
}

function QuickOption({ icon, label, tone, onPress }: { icon: IconName; label: string; tone: 'primary' | 'warning'; onPress: () => void }) {
  const soft = tone === 'primary' ? colors.primarySoft : colors.warningSoft;
  const iconColor = tone === 'primary' ? colors.primaryDark : colors.warning;
  const labelColor = tone === 'primary' ? colors.primaryDark : colors.text;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.option, { backgroundColor: soft }]}>
      <View style={styles.icon}>
        <Icon name={icon} size={28} color={iconColor} />
      </View>
      <AppText weight="bold" color={labelColor}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { paddingTop: space.lg, paddingHorizontal: space.md, paddingBottom: space.lg },
  options: { flexDirection: 'row', gap: space.md },
  option: { flex: 1, height: 112, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', gap: 10 },
  icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
