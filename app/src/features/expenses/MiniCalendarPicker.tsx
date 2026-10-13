import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { addMonths, monthGrid, sameDay, weekdayOrder, type WeekStart } from '@/lib/calendar/monthGrid';
import { startOfWeek } from '@/lib/calendar/week';
import { MAX_YEAR, MIN_YEAR, type SolarDate } from '@/lib/lunar';
import { colors, space } from '@/theme';

// S4 mockup 2b / 3b: a small month to pick a day, or the whole week holding the tapped day.
export function MiniCalendarPicker({
  visible,
  mode,
  selected,
  weekStart,
  currentLabel,
  onSelect,
  onCurrent,
  onClose,
}: {
  visible: boolean;
  mode: 'day' | 'week';
  selected: SolarDate;
  weekStart: WeekStart;
  currentLabel: string;
  onSelect: (date: SolarDate) => void;
  onCurrent: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [shown, setShown] = useState({ year: selected.year, month: selected.month });
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setShown({ year: selected.year, month: selected.month });
  }

  const days = monthGrid(shown.year, shown.month, weekStart);
  const rows = Array.from({ length: 6 }, (_, r) => days.slice(r * 7, r * 7 + 7));
  const selectedWeek = startOfWeek(selected, weekStart);
  const canPrev = shown.year > MIN_YEAR || shown.month > 1;
  const canNext = shown.year < MAX_YEAR || shown.month < 12;

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <View style={styles.head}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.previous')}
          disabled={!canPrev}
          onPress={() => setShown((s) => addMonths(s.year, s.month, -1))}
          hitSlop={8}
          style={styles.nav}>
          <Icon name="back" size={22} color={canPrev ? colors.text : colors.border} />
        </Pressable>
        <AppText variant="heading">
          {t('calendar.monthTitle', { month: t(`calendar.months.${shown.month}`), year: shown.year })}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('calendar.next')}
          disabled={!canNext}
          onPress={() => setShown((s) => addMonths(s.year, s.month, 1))}
          hitSlop={8}
          style={styles.nav}>
          <Icon name="chevron" size={22} color={canNext ? colors.text : colors.border} />
        </Pressable>
      </View>
      <View style={styles.row}>
        {weekdayOrder(weekStart).map((wd) => (
          <AppText key={wd} variant="caption" weight="extrabold" color={colors.textMuted} style={styles.weekday}>
            {t(`calendar.weekdays.${wd}`)}
          </AppText>
        ))}
      </View>
      {rows.map((row) => {
        const weekOn = mode === 'week' && sameDay(startOfWeek(row[0], weekStart), selectedWeek);
        return (
          <View key={row[0].day + '-' + row[0].month} style={[styles.row, weekOn && styles.weekOn]}>
            {row.map((d) => {
              const dayOn = mode === 'day' && sameDay(d, selected);
              return (
                <Pressable
                  key={d.day}
                  accessibilityRole="button"
                  accessibilityState={{ selected: dayOn || weekOn }}
                  onPress={() => onSelect({ year: d.year, month: d.month, day: d.day })}
                  style={[styles.cell, !d.inMonth && styles.out]}>
                  <View style={[styles.dot, dayOn && styles.dotOn]}>
                    <AppText
                      weight={dayOn || weekOn ? 'extrabold' : undefined}
                      color={dayOn ? colors.white : weekOn ? colors.primaryDark : colors.text}>
                      {d.day}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}
      <Button variant="secondary" label={currentLabel} onPress={onCurrent} style={styles.current} />
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.md },
  nav: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', borderRadius: 12 },
  weekday: { flex: 1, textAlign: 'center', marginBottom: space.xs },
  weekOn: { backgroundColor: colors.primarySoft },
  cell: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' },
  out: { opacity: 0.4 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.primary },
  current: { marginTop: space.md },
});
