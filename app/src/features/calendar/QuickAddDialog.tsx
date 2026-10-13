import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { PopupHeader } from '@/components/PopupHeader';
import { Icon, type IconName } from '@/components/Icon';
import { colors, eventColors, radius, space } from '@/theme';

// Pop-up `+` (màn 8): tạo nhanh — Sự kiện · Ghi chú · Khoản chi (S4, dòng dưới).
export function QuickAddDialog({
  visible,
  title,
  onClose,
  onCreateEvent,
  onCreateNote,
  onCreateExpense,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onCreateEvent: () => void;
  onCreateNote: () => void;
  onCreateExpense: () => void;
}) {
  const { t } = useTranslation();
  return (
    <DialogShell visible={visible} onClose={onClose} boxStyle={styles.box}>
      <PopupHeader title={title} onClose={onClose} />
      <View style={styles.options}>
        <QuickOption icon="calendar" label={t('events.quickAdd.event')} tone="primary" onPress={onCreateEvent} />
        <QuickOption icon="note" label={t('events.quickAdd.note')} tone="warning" onPress={onCreateNote} />
      </View>
      <View style={[styles.options, styles.nextRow]}>
        <QuickOption icon="wallet" label={t('events.quickAdd.expense')} tone="peach" onPress={onCreateExpense} />
        <View style={styles.spacer} />
      </View>
    </DialogShell>
  );
}

const TONES = {
  primary: { soft: colors.primarySoft, icon: colors.primaryDark, label: colors.primaryDark },
  warning: { soft: colors.warningSoft, icon: colors.warning, label: colors.text },
  // Mockup: peach 25% on the white box (tint layer below).
  peach: { soft: colors.surface, icon: colors.text, label: colors.text },
} as const;

function QuickOption({ icon, label, tone, onPress }: { icon: IconName; label: string; tone: keyof typeof TONES; onPress: () => void }) {
  const look = TONES[tone];
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.option, { backgroundColor: look.soft }]}>
      {tone === 'peach' ? <View style={styles.peachTint} /> : null}
      <View style={styles.icon}>
        <Icon name={icon} size={28} color={look.icon} />
      </View>
      <AppText weight="bold" color={look.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { paddingTop: space.lg, paddingHorizontal: space.md, paddingBottom: space.lg },
  options: { flexDirection: 'row', gap: space.md },
  nextRow: { marginTop: space.md },
  option: { flex: 1, height: 112, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' },
  spacer: { flex: 1 },
  peachTint: { ...StyleSheet.absoluteFill, backgroundColor: eventColors.peach, opacity: 0.25 },
  icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
