import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { CalendarHeader } from '@/features/calendar/CalendarHeader';
import { monthDays, type DayInfo } from '@/features/calendar/dayInfo';
import { MonthView, WeekdayRow } from '@/features/calendar/MonthView';
import { MonthYearPicker } from '@/features/calendar/MonthYearPicker';
import { ViewModeBar, type ViewMode } from '@/features/calendar/ViewModeBar';
import { addMonths } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { MAX_YEAR, MIN_YEAR, type SolarDate } from '@/lib/lunar';
import { colors } from '@/theme';

const SWIPE_DISTANCE = 50;

export default function CalendarScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const { settings } = useAuth();
  const [today, setToday] = useState(() => todayIn());
  const [shown, setShown] = useState({ year: today.year, month: today.month });
  const [selected, setSelected] = useState<SolarDate | null>(today);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(todayIn());
    });
    return () => sub.remove();
  }, []);

  const days = useMemo(
    () => monthDays(shown.year, shown.month, settings.weekStart, today),
    [shown.year, shown.month, settings.weekStart, today],
  );

  const goMonth = useCallback((delta: number) => {
    setShown((s) => {
      const next = addMonths(s.year, s.month, delta);
      return next.year < MIN_YEAR || next.year > MAX_YEAR ? s : next;
    });
  }, []);

  const goToday = () => {
    const now = todayIn();
    setToday(now);
    setShown({ year: now.year, month: now.month });
    setSelected(now);
  };

  const onPressDay = useCallback(
    (d: DayInfo) => {
      setSelected({ year: d.year, month: d.month, day: d.day });
      if (!d.inMonth) setShown({ year: d.year, month: d.month });
    },
    [],
  );

  const onMode = (mode: ViewMode) => {
    if (mode !== 'month') toast(t('comingSoon'));
  };

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (e.translationX <= -SWIPE_DISTANCE) goMonth(1);
      else if (e.translationX >= SWIPE_DISTANCE) goMonth(-1);
    });

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <CalendarHeader
        title={t('calendar.monthTitle', { month: t(`calendar.months.${shown.month}`), year: shown.year })}
        onPrev={() => goMonth(-1)}
        onNext={() => goMonth(1)}
        onTitle={() => setPickerOpen(true)}
        onToday={goToday}
      />
      <ViewModeBar value="month" onChange={onMode} />
      <WeekdayRow weekStart={settings.weekStart} />
      <GestureDetector gesture={swipe}>
        <View style={styles.swipeArea} collapsable={false}>
          <MonthView days={days} selected={selected} onPressDay={onPressDay} />
        </View>
      </GestureDetector>
      <MonthYearPicker
        visible={pickerOpen}
        year={shown.year}
        month={shown.month}
        onClose={() => setPickerOpen(false)}
        onSelect={(year, month) => {
          setShown({ year, month });
          setPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  swipeArea: { flex: 1 },
});
