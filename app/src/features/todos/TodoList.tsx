import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { CalendarHeader } from '@/features/calendar/CalendarHeader';
import { dayDetails, type DayDisplay } from '@/features/calendar/dayInfo';
import { occurrenceKey, todoListSpan } from '@/features/calendar/dayOccurrences';
import { DayStrip } from '@/features/calendar/DayStrip';
import { clockLabel } from '@/features/events/format';
import { isoDate } from '@/lib/calendar/monthGrid';
import { timeOfDayIn, todayIn } from '@/lib/calendar/timeZone';
import { addDays, weekDates } from '@/lib/calendar/week';
import { toHex } from '@/lib/colors';
import { jdFromDate, type SolarDate } from '@/lib/lunar';
import { subtaskProgress, toggleTodo } from '@/lib/todos';
import { groupTodoList, OVERDUE_DAYS, UPCOMING_DAYS } from '@/lib/todos/list';
import { makeStyles, radius, space, useTheme } from '@/theme';
import type { TodoOccurrence } from './todo';
import { TodoTick } from './TodoTick';
import { useSetTodoStatus, useTodosInRange } from './useTodos';

// Màn 7 / 7b — Ghi chú › Todo: week strip to pick a day · Quá hạn · chosen day · Sắp tới.
export function TodoList() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { settings } = useAuth();
  const { timeZone } = settings;
  const [today, setToday] = useState(() => todayIn(timeZone));
  const [selected, setSelected] = useState<SolarDate>(today);
  const [pulling, setPulling] = useState(false);

  // Reopening the tab goes back to today (spec § Danh sách todo).
  useFocusEffect(
    useCallback(() => {
      const now = todayIn(timeZone);
      setToday(now);
      setSelected(now);
    }, [timeZone]),
  );

  const display = useMemo<DayDisplay>(
    () => ({
      showLunar: settings.showLunar,
      showHolidays: settings.showHolidays,
    }),
    [settings.showLunar, settings.showHolidays],
  );
  const week = useMemo(() => weekDates(selected, settings.weekStart), [selected, settings.weekStart]);
  const days = useMemo(() => week.map((d) => dayDetails(d, today, display)), [week, today, display]);
  // Loaded per week, so picking another day of the same week needs no new request.
  const range = useMemo(
    () => ({
      from: addDays(week[0], -OVERDUE_DAYS),
      to: addDays(week[6], UPCOMING_DAYS),
    }),
    [week],
  );
  const todos = useTodosInRange(range, timeZone);
  const x = jdFromDate(selected);
  const groups = useMemo(() => groupTodoList(todos.occurrences, (o) => todoListSpan(o, timeZone), x), [todos.occurrences, timeZone, x]);
  const setTodoStatus = useSetTodoStatus();

  const onTick = (o: TodoOccurrence) =>
    setTodoStatus.mutate(
      {
        todo: { id: o.eventId, repeat: o.repeat },
        occurrenceDate: o.occurrenceDate,
        status: toggleTodo(o.subtasks, o.status),
      },
      { onError: () => toast(t('todos.tickFailed'), 'error') },
    );
  const onPress = (o: TodoOccurrence) =>
    router.push({
      pathname: '/todo/[id]',
      params: { id: o.eventId, occurrenceDate: o.occurrenceDate },
    });

  const todayJd = jdFromDate(today);
  const dayName = (d: SolarDate) => {
    const jd = jdFromDate(d);
    if (jd === todayJd) return t('calendar.today');
    if (jd === todayJd - 1) return t('todos.list.yesterday');
    if (jd === todayJd + 1) return t('todos.list.tomorrow');
    return `${t(`calendar.weekdays.${(jd + 1) % 7}`)}, ${d.day}/${d.month}`;
  };
  const longDayName = (d: SolarDate) => `${t(`calendar.weekdaysLong.${(jdFromDate(d) + 1) % 7}`)}, ${d.day}/${d.month}`;
  const shownDate = (o: TodoOccurrence, late: boolean) => {
    const span = todoListSpan(o, timeZone);
    return dayName(addDays(selected, (late ? span.end : span.start) - x));
  };

  const row = (o: TodoOccurrence, i: number, date?: { late: boolean }) => (
    <TodoListRow
      key={occurrenceKey(o)}
      divider={i > 0}
      todo={o}
      date={date ? shownDate(o, date.late) : undefined}
      late={date?.late}
      time={o.allDay ? undefined : clockLabel(t, timeOfDayIn(new Date(o.startsAt!), timeZone), settings.use24h)}
      onPress={() => onPress(o)}
      onTick={() => onTick(o)}
    />
  );

  const empty = groups.overdue.length === 0 && groups.day.length === 0 && groups.upcoming.length === 0;
  const doneToday = groups.day.filter((o) => o.status.done).length;

  return (
    <View style={styles.flex}>
      <CalendarHeader
        title={t('calendar.monthTitle', {
          month: t(`calendar.months.${selected.month}`),
          year: selected.year,
        })}
        onPrev={() => setSelected((d) => addDays(d, -7))}
        onNext={() => setSelected((d) => addDays(d, 7))}
        onTitle={() => {}}
        onToday={() => setSelected(today)}
      />
      <DayStrip days={days} selected={selected} onSelect={(d) => setSelected({ year: d.year, month: d.month, day: d.day })} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={pulling}
            colors={[colors.primary]}
            onRefresh={() => {
              setPulling(true);
              void todos.refetch().finally(() => setPulling(false));
            }}
          />
        }>
        {todos.isLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
        {todos.isError && todos.occurrences.length === 0 ? <EmptyTodos text={t('todos.list.loadFailed')} action={t('notes.retry')} onAction={() => void todos.refetch()} /> : null}
        {todos.isSuccess && empty ? (
          <EmptyTodos
            text={t('todos.list.empty')}
            action={t('todos.list.add')}
            onAction={() =>
              router.push({
                pathname: '/todo/edit',
                params: { date: isoDate(selected) },
              })
            }
          />
        ) : null}
        {groups.overdue.length > 0 ? (
          <Group title={t('todos.list.overdue')} titleColor={colors.error} aside={String(groups.overdue.length)}>
            {groups.overdue.map((o, i) => row(o, i, { late: true }))}
          </Group>
        ) : null}
        {groups.day.length > 0 ? (
          <Group
            title={jdFromDate(selected) === todayJd ? t('calendar.today') : longDayName(selected)}
            aside={t('todos.list.doneCount', {
              done: doneToday,
              total: groups.day.length,
            })}>
            {groups.day.map((o, i) => row(o, i))}
          </Group>
        ) : null}
        {groups.upcoming.length > 0 ? (
          <Group title={t('todos.list.upcoming')} aside={t('todos.list.upcomingSpan', { count: UPCOMING_DAYS })}>
            {groups.upcoming.map((o, i) => row(o, i, { late: false }))}
          </Group>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Group({ title, titleColor, aside, children }: { title: string; titleColor?: string; aside: string; children: ReactNode }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View>
      <View style={styles.groupHead}>
        <AppText weight="extrabold" color={titleColor}>
          {title}
        </AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {aside}
        </AppText>
      </View>
      <Card style={styles.card}>{children}</Card>
    </View>
  );
}

// Mockup `.trow`: tick · title · date (Quá hạn in error) · time · "2/5" · colour dot.
function TodoListRow({
  todo,
  divider,
  date,
  late,
  time,
  onPress,
  onTick,
}: {
  todo: TodoOccurrence;
  divider: boolean;
  date?: string;
  late?: boolean;
  time?: string;
  onPress: () => void;
  onTick: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const progress = todo.subtasks.length > 0 ? subtaskProgress(todo.subtasks, todo.status) : null;
  const done = todo.status.done;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}>
      <TodoTick done={done} onPress={onTick} label={todo.title} />
      <View style={styles.flex}>
        <AppText numberOfLines={1} color={done ? colors.textMuted : undefined} style={done && styles.strike}>
          {todo.title}
        </AppText>
        {date || time || progress ? (
          <View style={styles.meta}>
            {date ? (
              <AppText variant="caption" weight={late ? 'extrabold' : 'bold'} color={late ? colors.error : colors.textMuted}>
                {date}
              </AppText>
            ) : null}
            {time ? (
              <AppText variant="caption" color={colors.textMuted}>
                {time}
              </AppText>
            ) : null}
            {progress ? (
              <View style={styles.progress}>
                <Icon name="checklist" size={13} color={colors.primaryDark} />
                <AppText variant="caption" weight="extrabold" color={colors.primaryDark}>
                  {`${progress.done}/${progress.total}`}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={[styles.dot, { backgroundColor: toHex(todo.color) }]} />
    </Pressable>
  );
}

function EmptyTodos({ text, action, onAction }: { text: string; action: string; onAction: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.empty}>
      <View style={styles.bubble}>
        <Icon name="todo" size={44} color={colors.primary} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {text}
      </AppText>
      <Button label={action} onPress={onAction} />
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  flex: { flex: 1 },
  content: { paddingHorizontal: space.md, paddingBottom: 120, gap: space.md },
  loading: { marginVertical: space.xl },
  groupHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: space.xs,
    paddingTop: space.xs,
    paddingBottom: 6,
  },
  // Clips the pressed highlight to the card's rounded corners.
  card: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: space.md,
  },
  pressed: { backgroundColor: colors.primarySoft },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  strike: { textDecorationLine: 'line-through' },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  empty: {
    alignItems: 'center',
    gap: space.md,
    paddingTop: 80,
    paddingHorizontal: space.xl,
  },
  bubble: {
    width: 96,
    height: 96,
    borderRadius: 34,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
}));
