import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { timeRangeLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import { SyncIcon } from '@/features/events/SyncIcon';
import { TodoTick } from '@/features/todos/TodoTick';
import { toHex } from '@/lib/colors';
import { subtaskProgress } from '@/lib/todos';
import { colors, radius, space } from '@/theme';
import { isTodo } from './dayOccurrences';

export function HolidayRow({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: colors.error }]} />
      <View style={styles.flex}>
        <AppText numberOfLines={1} ellipsizeMode="clip">{title}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {t('events.dayDialog.holiday')}
        </AppText>
      </View>
    </View>
  );
}

// One event line (pop-up ngày): dot · title · time · note · icons. A todo (S5): round tick in place
// of the dot, "2/5" after the time.
export function EventListRow({
  occurrence,
  use24h,
  timeZone,
  onPress,
  onTick,
}: {
  occurrence: EventOccurrence;
  use24h: boolean;
  timeZone: string;
  onPress: () => void;
  onTick?: () => void;
}) {
  const { t } = useTranslation();
  const time = timeRangeLabel(t, occurrence, use24h, timeZone);
  const todo = isTodo(occurrence) ? occurrence : null;
  const progress = todo && todo.subtasks.length > 0 ? subtaskProgress(todo.subtasks, todo.status) : null;
  const detail = [time, progress ? `${progress.done}/${progress.total}` : null, occurrence.note || null].filter(Boolean).join(' · ');
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      {todo && onTick ? (
        <TodoTick done={todo.status.done} onPress={onTick} label={occurrence.title} />
      ) : (
        <View style={[styles.dot, { backgroundColor: toHex(occurrence.color) }]} />
      )}
      <View style={styles.flex}>
        <AppText numberOfLines={1} ellipsizeMode="clip" color={todo?.status.done ? colors.textMuted : undefined} style={todo?.status.done && styles.strike}>
          {occurrence.title}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1} ellipsizeMode="clip">
          {detail}
        </AppText>
      </View>
      {occurrence.repeat !== 'none' ? <Icon name="repeat" size={14} color={colors.textMuted} /> : null}
      {occurrence.reminderMinutes.length > 0 ? <Icon name="bell" size={14} color={colors.textMuted} /> : null}
      <SyncIcon occurrence={occurrence} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm, paddingHorizontal: space.xs },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  flex: { flex: 1 },
  strike: { textDecorationLine: 'line-through' },
});
