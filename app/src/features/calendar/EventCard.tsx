import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { timeRangeLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import { SyncIcon } from '@/features/events/SyncIcon';
import { colors, eventColors, radius, shadow, space } from '@/theme';

// Week rows and the list view (màn 2, 4): colour stripe · title · time (or note) · repeat/reminder icons.
export function EventCard({
  occurrence,
  subtitle,
  titleMaxChars,
  use24h,
  timeZone,
  onPress,
  style,
}: {
  occurrence: EventOccurrence;
  subtitle?: string;
  // Week rows show only the first N characters (no `…`) so the start – end time always fits.
  titleMaxChars?: number;
  use24h: boolean;
  timeZone: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  const time = timeRangeLabel(t, occurrence, use24h, timeZone);
  const title = titleMaxChars ? Array.from(occurrence.title).slice(0, titleMaxChars).join('') : occurrence.title;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${occurrence.title}, ${time}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      <View style={[styles.stripe, { backgroundColor: eventColors[occurrence.color] }]} />
      <View style={[styles.body, titleMaxChars ? styles.bodyAuto : null]}>
        <AppText numberOfLines={1} ellipsizeMode="clip">
          {title}
        </AppText>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1} ellipsizeMode="clip">
          {subtitle ?? time}
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

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'stretch', minHeight: 48, borderRadius: radius.button, backgroundColor: colors.surface, overflow: 'hidden', ...shadow },
  pressed: { opacity: 0.7 },
  holiday: { backgroundColor: colors.error },
  stripe: { width: 4 },
  body: { flex: 1, minWidth: 0, paddingVertical: space.sm, paddingHorizontal: 10 },
  // No fixed card width (week rows): size to the text instead of filling the card.
  bodyAuto: { flex: 0 },
  icons: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingRight: 10 },
});
