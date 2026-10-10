import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { sameDay, weekdayOrder, type WeekStart } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import { colors, space } from '@/theme';
import type { DayInfo } from './dayInfo';

export function WeekdayRow({ weekStart }: { weekStart: WeekStart }) {
  const { t } = useTranslation();
  return (
    <View style={styles.weekdays}>
      {weekdayOrder(weekStart).map((wd) => (
        <AppText
          key={wd}
          variant="caption"
          weight="extrabold"
          color={wd === 0 ? colors.error : colors.textMuted}
          style={styles.weekday}>
          {t(`calendar.weekdays.${wd}`)}
        </AppText>
      ))}
    </View>
  );
}

export function MonthView({
  days,
  selected,
  onPressDay,
}: {
  days: DayInfo[];
  selected: SolarDate | null;
  onPressDay: (day: DayInfo) => void;
}) {
  const rows = Array.from({ length: 6 }, (_, r) => days.slice(r * 7, r * 7 + 7));
  return (
    <View style={styles.month}>
      {rows.map((row) => (
        <View key={`${row[0].year}-${row[0].month}-${row[0].day}`} style={styles.row}>
          {row.map((d) => (
            <DayCell key={d.day} day={d} selected={!!selected && sameDay(d, selected)} onPress={onPressDay} />
          ))}
        </View>
      ))}
    </View>
  );
}

const DayCell = memo(function DayCell({
  day,
  selected,
  onPress,
}: {
  day: DayInfo;
  selected: boolean;
  onPress: (day: DayInfo) => void;
}) {
  const { t } = useTranslation();
  const red = day.weekday === 0 || day.holidays.length > 0;
  const holiday = day.holidays[0];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(day)}
      style={[styles.cell, selected && styles.selected, !day.inMonth && styles.out]}>
      <AppText
        variant="micro"
        weight={day.lunarKey ? 'extrabold' : undefined}
        color={day.lunarKey ? colors.primaryDark : colors.textMuted}
        numberOfLines={1}
        style={styles.lunar}>
        {day.lunarLabel}
      </AppText>
      <View style={[styles.num, day.isToday && styles.today]}>
        <AppText
          weight={day.isToday ? 'extrabold' : undefined}
          color={day.isToday ? colors.white : red ? colors.error : colors.text}>
          {day.day}
        </AppText>
      </View>
      {holiday ? (
        <AppText variant="caption" color={colors.error} numberOfLines={1} style={styles.holiday}>
          {t(`holidays.${holiday}`)}
        </AppText>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  weekdays: { flexDirection: 'row', paddingHorizontal: space.sm },
  weekday: { flex: 1, textAlign: 'center', paddingVertical: space.xs },
  month: { flex: 1, paddingHorizontal: space.sm, paddingBottom: space.xs },
  row: { flex: 1, flexDirection: 'row' },
  cell: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 3,
    paddingHorizontal: 2,
    gap: 2,
  },
  selected: { backgroundColor: colors.primarySoft, borderRadius: 10 },
  out: { opacity: 0.4 },
  lunar: { alignSelf: 'flex-end', paddingHorizontal: 1 },
  num: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: colors.primary },
  holiday: { lineHeight: 14 },
});
