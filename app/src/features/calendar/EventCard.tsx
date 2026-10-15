import { useTranslation } from 'react-i18next';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { timeRangeLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import { SyncIcon } from '@/features/events/SyncIcon';
import { TodoTick } from '@/features/todos/TodoTick';
import { toHex } from '@/lib/colors';
import { subtaskProgress } from '@/lib/todos';
import { makeStyles, radius, space, useTheme } from '@/theme';
import { isTodo } from './dayOccurrences';

// Week rows and the list view (màn 2, 4): colour stripe · title · time (or note) · repeat/reminder icons.
// A todo (S5) adds a round tick before the title (`onTick`) and "2/5" after the time.
export function EventCard({
  occurrence,
  subtitle,
  titleMaxChars,
  use24h,
  timeZone,
  onPress,
  onTick,
  style,
}: {
  occurrence: EventOccurrence;
  subtitle?: string;
  // Week rows show only the first N characters (no `…`) so the start – end time always fits.
  titleMaxChars?: number;
  use24h: boolean;
  timeZone: string;
  onPress: () => void;
  onTick?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const todo = isTodo(occurrence) ? occurrence : null;
  const progress = todo && todo.subtasks.length > 0 ? subtaskProgress(todo.subtasks, todo.status) : null;
  const time = timeRangeLabel(t, occurrence, use24h, timeZone);
  const title = titleMaxChars ? Array.from(occurrence.title).slice(0, titleMaxChars).join('') : occurrence.title;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${occurrence.title}, ${time}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      <View style={[styles.stripe, { backgroundColor: toHex(occurrence.color) }]} />
      {todo && onTick ? (
        <View style={styles.tick}>
          <TodoTick done={todo.status.done} onPress={onTick} label={occurrence.title} />
        </View>
      ) : null}
      <View style={[styles.body, titleMaxChars ? styles.bodyAuto : null]}>
        <AppText numberOfLines={1} ellipsizeMode="clip" color={todo?.status.done ? colors.textMuted : undefined} style={todo?.status.done && styles.strike}>
          {title}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1} ellipsizeMode="clip">
          {progress ? `${subtitle ?? time} · ${progress.done}/${progress.total}` : (subtitle ?? time)}
        </AppText>
      </View>
      <View style={styles.icons}>
        {occurrence.repeat !== 'none' ? <Icon name="repeat" size={14} color={colors.textMuted} /> : null}
        {occurrence.reminderMinutes.length > 0 ? <Icon name="bell" size={14} color={colors.textMuted} /> : null}
        <SyncIcon occurrence={occurrence} />
      </View>
    </Pressable>
  );
}

// Holidays show their short name; tapping opens the day popup with the full name.
export function HolidayCard({
  title,
  autoWidth,
  onPress,
  style,
}: {
  title: string;
  autoWidth?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${t('events.dayDialog.holiday')}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles.holiday, pressed && styles.pressed, style]}>
      <View style={[styles.body, autoWidth ? styles.bodyAuto : null]}>
        <AppText color={colors.white} numberOfLines={1} ellipsizeMode="clip">
          {title}
        </AppText>
        <AppText variant="caption" color={colors.white} numberOfLines={1} ellipsizeMode="clip">
          {t('events.dayDialog.holiday')}
        </AppText>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, shadow }) => ({
  card: { flexDirection: 'row', alignItems: 'stretch', minHeight: 48, borderRadius: radius.button, backgroundColor: colors.surface, overflow: 'hidden', ...shadow },
  pressed: { opacity: 0.7 },
  holiday: { backgroundColor: colors.error },
  stripe: { width: 4 },
  tick: { justifyContent: 'center', paddingLeft: 10 },
  strike: { textDecorationLine: 'line-through' },
  body: { flex: 1, minWidth: 0, paddingVertical: space.sm, paddingHorizontal: 10 },
  // No fixed card width (week rows): size to the text instead of filling the card.
  bodyAuto: { flex: 0 },
  icons: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingRight: 10 },
}));
