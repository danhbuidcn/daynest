import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { CycleDrop } from '@/components/CycleDrop';
import { Icon } from '@/components/Icon';
import { dayBars, type BarItem } from '@/lib/calendar/eventBars';
import { sameDay, weekdayOrder, type WeekStart } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import { makeStyles, space, useTheme } from '@/theme';
import type { DayInfo } from './dayInfo';
import { EventBar } from './EventBar';

export function WeekdayRow({ weekStart }: { weekStart: WeekStart }) {
  const { colors } = useTheme();
  const styles = useStyles();
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
  onPressAdd,
  barsForDay,
  cycleKind,
}: {
  days: DayInfo[];
  selected: SolarDate | null;
  // A day with no events/holidays only selects on first tap (shows a `+` badge); the badge
  // itself opens the day popup. A day that already has something opens the popup right away.
  onPressDay: (day: DayInfo) => void;
  onPressAdd: (day: DayInfo) => void;
  barsForDay: (day: DayInfo) => BarItem[];
  cycleKind: (day: DayInfo) => 'period' | 'predicted' | null;
}) {
  const styles = useStyles();
  const rows = Array.from({ length: 6 }, (_, r) => days.slice(r * 7, r * 7 + 7));
  return (
    <View style={styles.month}>
      {rows.map((row) => (
        <View key={`${row[0].year}-${row[0].month}-${row[0].day}`} style={styles.row}>
          {row.map((d) => {
            const isSelected = !!selected && sameDay(d, selected);
            return (
              <DayCell
                key={d.day}
                day={d}
                selected={isSelected}
                onPress={onPressDay}
                onPressAdd={onPressAdd}
                items={barsForDay(d)}
                cycle={cycleKind(d)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const DayCell = memo(function DayCell({
  day,
  selected,
  onPress,
  onPressAdd,
  items,
  cycle,
}: {
  day: DayInfo;
  selected: boolean;
  onPress: (day: DayInfo) => void;
  onPressAdd: (day: DayInfo) => void;
  items: BarItem[];
  cycle: 'period' | 'predicted' | null;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const red = day.weekday === 0 || day.holidays.length > 0;
  const { shown, extra } = dayBars(items);
  const showAddBadge = selected && items.length === 0;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(day)}
      style={[styles.cell, selected && styles.selected, !day.inMonth && styles.out]}>
      <View style={styles.top}>
        {cycle ? (
          <View style={styles.drop}>
            <CycleDrop predicted={cycle === 'predicted'} />
          </View>
        ) : null}
        <AppText
          fixedSize
          variant="micro"
          weight={day.lunarKey ? 'extrabold' : undefined}
          color={day.lunarKey ? colors.primaryDark : colors.textMuted}
          numberOfLines={1}
          style={styles.lunar}>
          {day.lunarLabel}
        </AppText>
        <View style={[styles.num, day.isToday && styles.today]}>
          <AppText
            fixedSize
            weight={day.isToday ? 'extrabold' : undefined}
            color={day.isToday ? colors.white : red ? colors.error : colors.text}>
            {day.day}
          </AppText>
        </View>
      </View>
      {showAddBadge ? (
        <View style={styles.addLayer} pointerEvents="box-none">
          <Pressable accessibilityRole="button" accessibilityLabel="Add" onPress={() => onPressAdd(day)} hitSlop={12} style={styles.addBadge}>
            <Icon name="plus" size={14} color={colors.white} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.bars}>
          {shown.map((item) => (
            <EventBar key={item.id} item={item} />
          ))}
          {extra > 0 ? (
            <AppText fixedSize variant="caption" color={colors.textMuted}>
              +{extra}
            </AppText>
          ) : null}
        </View>
      )}
    </Pressable>
  );
});

const useStyles = makeStyles(({ colors }) => ({
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
  top: { paddingHorizontal: 1 },
  drop: { position: 'absolute', left: 28, bottom: 4 },
  lunar: { alignSelf: 'flex-end', height: 12, lineHeight: 12 },
  num: { alignSelf: 'flex-start', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  today: { backgroundColor: colors.primary },
  bars: { gap: 2, marginTop: 2 },
  // Centred on the whole cell, not under the date row.
  addLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  addBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
}));
