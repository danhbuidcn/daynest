import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { timeRangeLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import { SyncIcon } from '@/features/events/SyncIcon';
import { colors, eventColors, radius, space } from '@/theme';

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

// One event line (pop-up ngày now; week/list views in step 7): dot · title · time · note · icons.
export function EventListRow({
  occurrence,
  use24h,
  timeZone,
  onPress,
}: {
  occurrence: EventOccurrence;
  use24h: boolean;
  timeZone: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const time = timeRangeLabel(t, occurrence, use24h, timeZone);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={[styles.dot, { backgroundColor: eventColors[occurrence.color] }]} />
      <View style={styles.flex}>
        <AppText numberOfLines={1} ellipsizeMode="clip">{occurrence.title}</AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1} ellipsizeMode="clip">
          {occurrence.note ? `${time} · ${occurrence.note}` : time}
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
});
