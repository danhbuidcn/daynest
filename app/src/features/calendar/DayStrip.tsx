import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { sameDay, weekdayOf } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import { colors, radius, space } from '@/theme';
import { lunarDayMonth, type DayDetails } from './dayInfo';

// Màn 4 thanh ngày: the 7 days of the shown week; a dot marks days that have events or holidays.
export function DayStrip({
  days,
  selected,
  hasItems,
  onSelect,
  onAdd,
}: {
  days: DayDetails[];
  selected: SolarDate;
  hasItems: (d: DayDetails) => boolean;
  onSelect: (d: SolarDate) => void;
  onAdd: (d: SolarDate) => void;
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
              {lunarDayMonth(d.lunar)}
            </AppText>
            {on ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Add" onPress={() => onAdd(d)} hitSlop={8} style={styles.plus}>
                <Icon name="plus" size={12} color={colors.primary} />
              </Pressable>
            ) : null}
            <View style={[styles.dot, hasItems(d) && { backgroundColor: on ? colors.white : colors.primary }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', gap: space.xs, paddingHorizontal: space.md, paddingBottom: 10 },
  day: { flex: 1, height: 68, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.primary },
  pressed: { backgroundColor: colors.primarySoft },
  plus: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: radius.pill, marginTop: 2 },
});
