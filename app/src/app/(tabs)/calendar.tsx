import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertDialog } from '@/components/Dialog';
import { useAuth } from '@/features/auth/AuthProvider';
import { CalendarHeader } from '@/features/calendar/CalendarHeader';
import { dayDetails, monthDays, type DayDisplay, type DayInfo } from '@/features/calendar/dayInfo';
import { DayEventsDialog } from '@/features/calendar/DayEventsDialog';
import { occurrencesOnDay } from '@/features/calendar/dayOccurrences';
import { DayView } from '@/features/calendar/DayView';
import { ListView } from '@/features/calendar/ListView';
import { MonthView, WeekdayRow } from '@/features/calendar/MonthView';
import { MonthYearPicker } from '@/features/calendar/MonthYearPicker';
import { useCalendarNav } from '@/features/calendar/useCalendarNav';
import { ViewModeBar } from '@/features/calendar/ViewModeBar';
import { WeekView } from '@/features/calendar/WeekView';
import type { EventOccurrence } from '@/features/events/occurrences';
import { syncNow } from '@/features/google/sync';
import { useGoogleSync } from '@/features/google/useGoogleSync';
import { useEventsInRange } from '@/features/events/useEvents';
import { type BarItem } from '@/lib/calendar/eventBars';
import { isoDate } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import { colors } from '@/theme';

const SWIPE_DISTANCE = 50;

export default function CalendarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { settings, newDeviceName, dismissNewDeviceName } = useAuth();
  const nav = useCalendarNav(settings.timeZone, settings.weekStart);
  const { today, mode, cursor, setCursor, go } = nav;
  // Month view only: the tapped cell (shows `+` when empty); other views centre on `cursor`.
  const [selected, setSelected] = useState<SolarDate | null>(today);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dayDialogDate, setDayDialogDate] = useState<SolarDate | null>(null);
  const googleSync = useGoogleSync();
  const [pulling, setPulling] = useState(false);

  const display = useMemo<DayDisplay>(
    () => ({ showLunar: settings.showLunar, showHolidays: settings.showHolidays }),
    [settings.showLunar, settings.showHolidays],
  );
  const days = useMemo(
    () => (mode === 'month' ? monthDays(cursor.year, cursor.month, settings.weekStart, today, display) : []),
    [mode, cursor.year, cursor.month, settings.weekStart, today, display],
  );
  const { occurrences } = useEventsInRange(nav.range, settings.timeZone);

  const goToday = () => setSelected(nav.goToday());

  const barsForDay = useCallback(
    (d: DayInfo): BarItem[] => {
      const holidayItems: BarItem[] = d.holidays.map((h) => ({ kind: 'holiday', id: h, title: t(`holidaysShort.${h}`) }));
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
      setCursor(date);
      if (barsForDay(d).length > 0) setDayDialogDate(date);
    },
    [barsForDay, setCursor],
  );

  const onPressAdd = useCallback((d: DayInfo) => {
    setDayDialogDate({ year: d.year, month: d.month, day: d.day });
  }, []);

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

  const onAddAt = (d: SolarDate, hour: number | null) => {
    const params = hour === null ? { date: isoDate(d), allDay: '1' } : { date: isoDate(d), hour: String(hour) };
    router.push({ pathname: '/event/edit', params });
  };

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (e.translationX <= -SWIPE_DISTANCE) go(1);
      else if (e.translationX >= SWIPE_DISTANCE) go(-1);
    });

  const refreshControl = googleSync.enabled ? (
    <RefreshControl
      refreshing={pulling}
      colors={[colors.primary]}
      onRefresh={() => {
        setPulling(true);
        void syncNow().finally(() => setPulling(false));
      }}
    />
  ) : undefined;

  const viewProps = { refreshControl, cursor, today, occurrences, use24h: settings.use24h, timeZone: settings.timeZone, display, onPressOccurrence, onPressHoliday: setDayDialogDate };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <CalendarHeader title={nav.title} onPrev={() => go(-1)} onNext={() => go(1)} onTitle={() => setPickerOpen(true)} onToday={goToday} />
      <ViewModeBar value={mode} onChange={nav.setMode} />
      {mode === 'month' ? <WeekdayRow weekStart={settings.weekStart} /> : null}
      <GestureDetector gesture={swipe}>
        <View style={styles.swipeArea} collapsable={false}>
          {mode === 'month' ? (
            <MonthView days={days} selected={selected} onPressDay={onPressDay} onPressAdd={onPressAdd} barsForDay={barsForDay} />
          ) : mode === 'week' ? (
            <WeekView {...viewProps} weekStart={settings.weekStart} onSelectWeek={go} onAddAllDay={(d) => onAddAt(d, null)} />
          ) : mode === 'day' ? (
            <DayView {...viewProps} onAddAt={onAddAt} />
          ) : (
            <ListView {...viewProps} weekStart={settings.weekStart} onSelectDay={setCursor} />
          )}
        </View>
      </GestureDetector>
      <MonthYearPicker
        visible={pickerOpen}
        year={cursor.year}
        month={cursor.month}
        onClose={() => setPickerOpen(false)}
        onSelect={(year, month) => {
          setCursor({ year, month, day: 1 });
          setPickerOpen(false);
        }}
      />
      {dayDialogDate ? (
        <DayEventsDialog
          visible
          date={dayDialogDate}
          holidays={dayDetails(dayDialogDate, today, display).holidays}
          showLunar={settings.showLunar}
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
