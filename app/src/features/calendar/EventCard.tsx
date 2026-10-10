import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { timeRangeLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import { colors, eventColors, radius, shadow, space } from '@/theme';

// Week rows and the list view (màn 2, 4): colour stripe · title · time (or note) · repeat/reminder icons.
export function EventCard({
  occurrence,
  subtitle,
  use24h,
  timeZone,
  onPress,
  style,
}: {
  occurrence: EventOccurrence;
  subtitle?: string;
  use24h: boolean;
  timeZone: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  const time = timeRangeLabel(t, occurrence, use24h, timeZone);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${occurrence.title}, ${time}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      <View style={[styles.stripe, { backgroundColor: eventColors[occurrence.color] }]} />
      <View style={styles.body}>
        <AppText numberOfLines={1}>{occurrence.title}</AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
          {subtitle ?? time}
        </AppText>
      </View>
      <View style={styles.icons}>
        {occurrence.repeat !== 'none' ? <Icon name="repeat" size={14} color={colors.textMuted} /> : null}
        {occurrence.reminderMinutes.length > 0 ? <Icon name="bell" size={14} color={colors.textMuted} /> : null}
      </View>
    </Pressable>
  );
}

// Holidays sit among the cards but are not tappable (F1).
export function HolidayCard({ title, style }: { title: string; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.card, styles.holiday, style]} accessibilityLabel={`${title}, ${t('events.dayDialog.holiday')}`}>
      <View style={styles.body}>
        <AppText color={colors.white} numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="caption" color={colors.white} numberOfLines={1}>
          {t('events.dayDialog.holiday')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'stretch', minHeight: 48, borderRadius: radius.button, backgroundColor: colors.surface, overflow: 'hidden', ...shadow },
  pressed: { opacity: 0.7 },
  holiday: { backgroundColor: colors.error },
  stripe: { width: 4 },
  body: { flex: 1, minWidth: 0, paddingVertical: space.sm, paddingHorizontal: 10 },
  icons: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingRight: 10 },
});
