import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertDialog } from '@/components/Dialog';
import { LoadErrorCard, StaleLine } from '@/components/LoadError';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useAuth } from '@/features/auth/AuthProvider';
import { CalendarHeader } from '@/features/calendar/CalendarHeader';
import { dayDetails, monthDays, type DayDisplay, type DayInfo } from '@/features/calendar/dayInfo';
import { periodRange, shiftCursor } from '@/features/calendar/calendarNav';
import { DayEventsDialog } from '@/features/calendar/DayEventsDialog';
import { calendarOrder, isTodo, occurrencesOnDay } from '@/features/calendar/dayOccurrences';
import { DayView } from '@/features/calendar/DayView';
import { ListView } from '@/features/calendar/ListView';
import { MonthView, WeekdayRow } from '@/features/calendar/MonthView';
import { MonthYearPicker } from '@/features/calendar/MonthYearPicker';
import { useCalendarNav } from '@/features/calendar/useCalendarNav';
import { loadError } from '@/features/network/loadError';
import { ViewModeBar } from '@/features/calendar/ViewModeBar';
import { WeekView } from '@/features/calendar/WeekView';
import { useCycleCalendar } from '@/features/cycle/useCycleCalendar';
import type { EventOccurrence } from '@/features/events/occurrences';
import { syncNow } from '@/features/google/sync';
import { useGoogleSync } from '@/features/google/useGoogleSync';
import { useEventsInRange, usePrefetchEvents } from '@/features/events/useEvents';
import { useErrorToast } from '@/features/network/useErrorToast';
import type { TodoOccurrence } from '@/features/todos/todo';
import { usePrefetchTodos, useSetTodoStatus, useTodosInRange } from '@/features/todos/useTodos';
import { type BarItem } from '@/lib/calendar/eventBars';
import { isoDate, parseIsoDate } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import { toggleTodo } from '@/lib/todos';
import { makeStyles, space, useTheme } from '@/theme';

const SWIPE_DISTANCE = 50;

export default function CalendarScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const failed = useErrorToast();
  const { settings, newDeviceName, dismissNewDeviceName } = useAuth();
  const nav = useCalendarNav(settings.timeZone, settings.weekStart);
  const { today, mode, cursor, setCursor, go } = nav;
  // Month view only: the tapped cell (shows `+` when empty); other views centre on `cursor`.
  const [selected, setSelected] = useState<SolarDate | null>(today);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dayDialogDate, setDayDialogDate] = useState<SolarDate | null>(null);
  const cycle = useCycleCalendar();
  // Tapping the period reminder opens the calendar on the predicted day (S5).
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const [appliedDate, setAppliedDate] = useState<string>();
  if (dateParam && dateParam !== appliedDate) {
    const d = parseIsoDate(dateParam);
    setAppliedDate(dateParam);
    setCursor(d);
    setSelected(d);
  }
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
  const events = useEventsInRange(nav.range, settings.timeZone);
  const todos = useTodosInRange(nav.range, settings.timeZone);
  // Todos (S5) show alongside events everywhere on the calendar; never synced to Google.
  const occurrences = useMemo<EventOccurrence[]>(() => [...events.occurrences, ...todos.occurrences], [events.occurrences, todos.occurrences]);
  const eventsLoading = events.isLoading || todos.isLoading;
  const eventsFetching = events.isFetching || todos.isFetching;
  // Nothing on the device for this period and the load failed (or waits for the network).
  const loadFailure = loadError(events) ?? loadError(todos);
  const retryLoad = () => void Promise.all([events.refetch(), todos.refetch()]);
  const setTodoStatus = useSetTodoStatus();
  // Day view loads whole weeks, so its neighbours are the weeks before and after.
  const adjacentRanges = useMemo(() => {
    const step = mode === 'day' ? 'week' : mode;
    return [-1, 1].map((d) => periodRange(mode, shiftCursor(step, cursor, d), settings.weekStart));
  }, [mode, cursor, settings.weekStart]);
  usePrefetchEvents(adjacentRanges, !eventsFetching);
  usePrefetchTodos(adjacentRanges, !eventsFetching);

  const onTickTodo = useCallback(
    (o: TodoOccurrence) =>
      setTodoStatus.mutate(
        { todo: { id: o.eventId, repeat: o.repeat }, occurrenceDate: o.occurrenceDate, status: toggleTodo(o.subtasks, o.status) },
        { onError: failed('todos.tickFailed') },
      ),
    [setTodoStatus, failed],
  );

  const goToday = () => setSelected(nav.goToday());

  const barsForDay = useCallback(
    (d: DayInfo): BarItem[] => {
      const holidayItems: BarItem[] = d.holidays.map((h) => ({ kind: 'holiday', id: h, title: t(`holidaysShort.${h}`) }));
      const eventItems: BarItem[] = occurrencesOnDay(occurrences, d, settings.timeZone)
        .sort(calendarOrder)
        .map((o) => ({
          kind: 'event',
          id: `${o.eventId}-${o.occurrenceDate}`,
          title: o.title,
          color: o.color,
          todo: isTodo(o) ? { done: o.status.done } : undefined,
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
    () => (dayDialogDate ? occurrencesOnDay(occurrences, dayDialogDate, settings.timeZone).sort(calendarOrder) : []),
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
    const pathname = isTodo(o) ? '/todo/[id]' : '/event/[id]';
    router.push({ pathname, params: { id: o.eventId, occurrenceDate: o.occurrenceDate } });
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

  const viewProps = { refreshControl, cursor, today, occurrences, use24h: settings.use24h, timeZone: settings.timeZone, display, onPressOccurrence, onTickTodo, onPressHoliday: setDayDialogDate };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenBackground />
      <CalendarHeader title={nav.title} onPrev={() => go(-1)} onNext={() => go(1)} onTitle={() => setPickerOpen(true)} onToday={goToday} />
      <ViewModeBar value={mode} onChange={nav.setMode} />
      {!loadFailure && (events.isError || todos.isError) ? <StaleLine onRetry={retryLoad} /> : null}
      {mode === 'month' ? <WeekdayRow weekStart={settings.weekStart} /> : null}
      <GestureDetector gesture={swipe}>
        <View style={styles.swipeArea} collapsable={false}>
          {mode === 'month' ? (
            <MonthView days={days} selected={selected} onPressDay={onPressDay} onPressAdd={onPressAdd} barsForDay={barsForDay} cycleKind={(d) => cycle.dayOf(d)?.kind ?? null} />
          ) : mode === 'week' ? (
            <WeekView {...viewProps} weekStart={settings.weekStart} onSelectWeek={go} onAddAllDay={(d) => onAddAt(d, null)} cycleOf={cycle.dayOf} />
          ) : mode === 'day' ? (
            <DayView {...viewProps} onAddAt={onAddAt} cycleOf={cycle.dayOf} />
          ) : (
            <ListView {...viewProps} weekStart={settings.weekStart} onSelectDay={setCursor} cycleOf={cycle.dayOf} />
          )}
          {eventsLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
          {loadFailure ? (
            <View style={styles.failure}>
              <LoadErrorCard error={loadFailure} onRetry={retryLoad} />
            </View>
          ) : null}
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
          onTickTodo={onTickTodo}
          cycle={cycle.enabled ? cycle.summaryOf(dayDialogDate) : undefined}
          onOpenCycle={cycle.enabled ? () => { closeDayDialog(); router.push('/settings/period'); } : undefined}
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

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1 },
  swipeArea: { flex: 1 },
  loading: { position: 'absolute', top: space.sm, alignSelf: 'center' },
  failure: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: colors.bg },
}));
