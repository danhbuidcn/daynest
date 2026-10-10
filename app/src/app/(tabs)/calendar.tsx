import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertDialog } from '@/components/Dialog';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { CalendarHeader } from '@/features/calendar/CalendarHeader';
import { monthDays, type DayInfo } from '@/features/calendar/dayInfo';
import { DayEventsDialog } from '@/features/calendar/DayEventsDialog';
import { occurrencesOnDay } from '@/features/calendar/dayOccurrences';
import { MonthView, WeekdayRow } from '@/features/calendar/MonthView';
import { MonthYearPicker } from '@/features/calendar/MonthYearPicker';
import { ViewModeBar, type ViewMode } from '@/features/calendar/ViewModeBar';
import type { EventOccurrence } from '@/features/events/occurrences';
import { useEventsInRange } from '@/features/events/useEvents';
import { type BarItem } from '@/lib/calendar/eventBars';
import { addMonths, isoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { MAX_YEAR, MIN_YEAR, type SolarDate } from '@/lib/lunar';
import { colors } from '@/theme';

const SWIPE_DISTANCE = 50;

export default function CalendarScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const router = useRouter();
  const { settings, newDeviceName, dismissNewDeviceName } = useAuth();
  const [today, setToday] = useState(() => todayIn(settings.timeZone));
  const [shown, setShown] = useState({ year: today.year, month: today.month });
  const [selected, setSelected] = useState<SolarDate | null>(today);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dayDialogDate, setDayDialogDate] = useState<SolarDate | null>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(todayIn(settings.timeZone));
    });
    return () => sub.remove();
  }, [settings.timeZone]);

  const days = useMemo(
    () => monthDays(shown.year, shown.month, settings.weekStart, today),
    [shown.year, shown.month, settings.weekStart, today],
  );
  // The 42-day grid already covers a little of the previous/next month, which is enough buffer
  // for swiping without an extra round trip (F1 — "tải theo khoảng ngày đang hiện").
  const range = useMemo(() => ({ from: days[0], to: days[days.length - 1] }), [days]);
  const { occurrences } = useEventsInRange(range, settings.timeZone);

  const goMonth = useCallback((delta: number) => {
    setShown((s) => {
      const next = addMonths(s.year, s.month, delta);
      return next.year < MIN_YEAR || next.year > MAX_YEAR ? s : next;
    });
  }, []);

  const goToday = () => {
    const now = todayIn(settings.timeZone);
    setToday(now);
    setShown({ year: now.year, month: now.month });
    setSelected(now);
  };

  const barsForDay = useCallback(
    (d: DayInfo): BarItem[] => {
      const holidayItems: BarItem[] = d.holidays.map((h) => ({ kind: 'holiday', id: h, title: t(`holidays.${h}`) }));
      const eventItems: BarItem[] = occurrencesOnDay(occurrences, d, settings.timeZone).map((o) => ({
        kind: 'event',
        id: `${o.eventId}-${o.occurrenceDate}`,
        title: o.title,
        color: o.color,
      }));
      return [...holidayItems, ...eventItems];
    },
    [occurrences, settings.timeZone, t],
  );

  // A day with nothing on it only selects (showing a `+` badge, see MonthView); a day that
  // already has something opens the day popup right away, matching the reference calendar app.
  const onPressDay = useCallback(
    (d: DayInfo) => {
      const date = { year: d.year, month: d.month, day: d.day };
      setSelected(date);
      if (!d.inMonth) setShown({ year: d.year, month: d.month });
      if (barsForDay(d).length > 0) setDayDialogDate(date);
    },
    [barsForDay],
  );

  const onPressAdd = useCallback((d: DayInfo) => {
    setDayDialogDate({ year: d.year, month: d.month, day: d.day });
  }, []);

  const onMode = (mode: ViewMode) => {
    if (mode !== 'month') toast(t('comingSoon'));
  };

  const dayDialogInfo = useMemo(
    () => (dayDialogDate ? days.find((d) => d.year === dayDialogDate.year && d.month === dayDialogDate.month && d.day === dayDialogDate.day) ?? null : null),
    [days, dayDialogDate],
  );
  const dayDialogOccurrences = useMemo(
    () => (dayDialogDate ? occurrencesOnDay(occurrences, dayDialogDate, settings.timeZone) : []),
    [occurrences, dayDialogDate, settings.timeZone],
  );

  const closeDayDialog = () => setDayDialogDate(null);

  const onAddForDay = () => {
    if (!dayDialogDate) return;
    closeDayDialog();
    router.push({ pathname: '/event/edit', params: { date: isoDate(dayDialogDate) } });
  };

  const onPressOccurrence = (o: EventOccurrence) => {
    closeDayDialog();
    router.push({ pathname: '/event/[id]', params: { id: o.eventId, occurrenceDate: o.occurrenceDate } });
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
          <MonthView days={days} selected={selected} onPressDay={onPressDay} onPressAdd={onPressAdd} barsForDay={barsForDay} />
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
      {dayDialogDate ? (
        <DayEventsDialog
          visible
          date={dayDialogDate}
          holidays={dayDialogInfo?.holidays ?? []}
          occurrences={dayDialogOccurrences}
          use24h={settings.use24h}
          timeZone={settings.timeZone}
          onClose={closeDayDialog}
          onAdd={onAddForDay}
          onPressOccurrence={onPressOccurrence}
        />
      ) : null}
      <AlertDialog
        visible={!!newDeviceName}
        tone="primary"
        icon="devices"
        title={t('newDeviceDialog.title')}
        text={t('newDeviceDialog.text', { name: newDeviceName })}
        buttonLabel={t('newDeviceDialog.button')}
        onClose={dismissNewDeviceName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  swipeArea: { flex: 1 },
});
