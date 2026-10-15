import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { PopupHeader } from '@/components/PopupHeader';
import { Icon, type IconName } from '@/components/Icon';
import { useAuth } from '@/features/auth/AuthProvider';
import { clockLabel } from '@/features/events/format';
import { weekdayOf } from '@/lib/calendar/monthGrid';
import { timeOfDayIn, todayIn } from '@/lib/calendar/timeZone';
import { eventColors, makeStyles, radius, space, useTheme, type Theme } from '@/theme';

// Pop-up `+` (màn 8): tạo nhanh, 2×2 — Sự kiện · Todo (S5) / Ghi chú · Khoản chi (S4).
// Also opened from a create form's "Todo ▾" title, with that form's type marked (`current`).
export function QuickAddDialog({
  visible,
  current,
  onClose,
  onCreateEvent,
  onCreateTodo,
  onCreateNote,
  onCreateExpense,
}: {
  visible: boolean;
  current?: 'event' | 'todo';
  onClose: () => void;
  onCreateEvent: () => void;
  onCreateTodo: () => void;
  onCreateNote: () => void;
  onCreateExpense: () => void;
}) {
  const styles = useStyles();
  const { t } = useTranslation();
  const { settings } = useAuth();
  // Weekday, date and the current time, taken when the popup opens (mockup screen 8).
  const title = useMemo(() => {
    if (!visible) return '';
    const today = todayIn(settings.timeZone);
    const time = clockLabel(t, timeOfDayIn(new Date(), settings.timeZone), settings.use24h);
    return `${t(`calendar.weekdaysLong.${weekdayOf(today)}`)}, ${today.day}/${today.month} · ${time}`;
  }, [visible, settings.timeZone, settings.use24h, t]);

  return (
    <DialogShell visible={visible} onClose={onClose} boxStyle={styles.box}>
      <PopupHeader title={title} onClose={onClose} />
      <View style={styles.options}>
        <QuickOption icon="calendar" label={t('events.quickAdd.event')} tone="primary" selected={current === 'event'} onPress={onCreateEvent} />
        <QuickOption icon="todo" label={t('events.quickAdd.todo')} tone="lavender" selected={current === 'todo'} onPress={onCreateTodo} />
      </View>
      <View style={[styles.options, styles.nextRow]}>
        <QuickOption icon="note" label={t('events.quickAdd.note')} tone="warning" onPress={onCreateNote} />
        <QuickOption icon="wallet" label={t('events.quickAdd.expense')} tone="peach" onPress={onCreateExpense} />
      </View>
    </DialogShell>
  );
}

const tones = (colors: Theme['colors']) => ({
  primary: { soft: colors.primarySoft, icon: colors.primaryDark, label: colors.primaryDark },
  warning: { soft: colors.warningSoft, icon: colors.warning, label: colors.text },
  // Mockup: peach 25% / lavender 28% on the white box (tint layer below).
  peach: { soft: colors.surface, icon: colors.text, label: colors.text, tint: eventColors.peach, tintOpacity: 0.25 },
  lavender: { soft: colors.surface, icon: colors.text, label: colors.text, tint: eventColors.lavender, tintOpacity: 0.28 },
}) as const;

function QuickOption({
  icon,
  label,
  tone,
  selected,
  onPress,
}: {
  icon: IconName;
  label: string;
  tone: 'primary' | 'warning' | 'peach' | 'lavender';
  selected?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const look: { soft: string; icon: string; label: string; tint?: string; tintOpacity?: number } = tones(colors)[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.option, { backgroundColor: look.soft }, selected && styles.selected]}>
      {look.tint ? <View style={[styles.tint, { backgroundColor: look.tint, opacity: look.tintOpacity }]} /> : null}
      {selected ? (
        <View style={styles.check}>
          <Icon name="check" size={12} color={colors.white} />
        </View>
      ) : null}
      <View style={styles.icon}>
        <Icon name={icon} size={28} color={look.icon} />
      </View>
      <AppText weight="bold" color={look.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  box: { paddingTop: space.lg, paddingHorizontal: space.md, paddingBottom: space.lg },
  options: { flexDirection: 'row', gap: space.md },
  nextRow: { marginTop: space.md },
  option: { flex: 1, height: 112, borderRadius: radius.card, alignItems: 'center', justifyContent: 'center', gap: 10, overflow: 'hidden' },
  tint: { ...StyleSheet.absoluteFill },
  selected: { borderWidth: 2, borderColor: colors.primary },
  check: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
}));
