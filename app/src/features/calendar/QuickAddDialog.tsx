import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { PopupHeader } from '@/components/PopupHeader';
import { Icon, type IconName } from '@/components/Icon';
import { colors, eventColors, radius, space } from '@/theme';

// Pop-up `+` (màn 8): tạo nhanh, 2×2 — Sự kiện · Todo (S5) / Ghi chú · Khoản chi (S4).
export function QuickAddDialog({
  visible,
  title,
  onClose,
  onCreateEvent,
  onCreateTodo,
  onCreateNote,
  onCreateExpense,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onCreateEvent: () => void;
  onCreateTodo: () => void;
  onCreateNote: () => void;
  onCreateExpense: () => void;
}) {
  const { t } = useTranslation();
  return (
    <DialogShell visible={visible} onClose={onClose} boxStyle={styles.box}>
      <PopupHeader title={title} onClose={onClose} />
      <View style={styles.options}>
        <QuickOption icon="calendar" label={t('events.quickAdd.event')} tone="primary" onPress={onCreateEvent} />
        <QuickOption icon="todo" label={t('events.quickAdd.todo')} tone="lavender" onPress={onCreateTodo} />
      </View>
      <View style={[styles.options, styles.nextRow]}>
        <QuickOption icon="note" label={t('events.quickAdd.note')} tone="warning" onPress={onCreateNote} />
        <QuickOption icon="wallet" label={t('events.quickAdd.expense')} tone="peach" onPress={onCreateExpense} />
      </View>
    </DialogShell>
  );
}

const TONES = {
  primary: { soft: colors.primarySoft, icon: colors.primaryDark, label: colors.primaryDark },
  warning: { soft: colors.warningSoft, icon: colors.warning, label: colors.text },
  // Mockup: peach 25% / lavender 28% on the white box (tint layer below).
  peach: { soft: colors.surface, icon: colors.text, label: colors.text, tint: eventColors.peach, tintOpacity: 0.25 },
  lavender: { soft: colors.surface, icon: colors.text, label: colors.text, tint: eventColors.lavender, tintOpacity: 0.28 },
} as const;

function QuickOption({ icon, label, tone, onPress }: { icon: IconName; label: string; tone: keyof typeof TONES; onPress: () => void }) {
  const look: { soft: string; icon: string; label: string; tint?: string; tintOpacity?: number } = TONES[tone];
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.option, { backgroundColor: look.soft }]}>
      {look.tint ? <View style={[styles.tint, { backgroundColor: look.tint, opacity: look.tintOpacity }]} /> : null}
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
  tint: { ...StyleSheet.absoluteFill },
  icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
