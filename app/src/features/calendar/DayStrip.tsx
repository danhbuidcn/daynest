import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { sameDay, weekdayOf } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import { colors, radius, space } from '@/theme';
import type { DayDetails } from './dayInfo';

// Màn 4 thanh ngày: the 7 days of the shown week; today has its own number colour.
export function DayStrip({
  days,
  selected,
  onSelect,
}: {
  days: DayDetails[];
  selected: SolarDate;
  onSelect: (d: SolarDate) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.strip}>
      {days.map((d) => {
        const on = sameDay(d, selected);
        const weekday = weekdayOf(d);
        const red = !on && (weekday === 0 || d.holidays.length > 0);
        const numberColor = on ? colors.white : d.isToday ? colors.primaryDark : red ? colors.error : colors.text;
        const muted = on ? colors.white : colors.textMuted;
        return (
          <Pressable
            key={`${d.month}-${d.day}`}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(d)}
            style={({ pressed }) => [styles.day, on && styles.on, pressed && !on && styles.pressed]}>
            <AppText variant="caption" color={muted}>
              {t(`calendar.weekdays.${weekday}`)}
            </AppText>
            <AppText variant="heading" weight="extrabold" color={numberColor}>
              {d.day}
            </AppText>
            <AppText variant="micro" color={muted} numberOfLines={1} ellipsizeMode="clip">
              {d.lunarDayMonth}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', gap: space.xs, paddingHorizontal: space.md, paddingBottom: 10 },
  day: { flex: 1, height: 58, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.primary },
  pressed: { backgroundColor: colors.primarySoft },
});
