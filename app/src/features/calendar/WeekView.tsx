import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View, type RefreshControlProps } from 'react-native';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';

import { AppText } from '@/components/AppText';
import { CycleDrop } from '@/components/CycleDrop';
import type { CycleDay } from '@/lib/cycle';
import type { EventOccurrence } from '@/features/events/occurrences';
import type { TodoOccurrence } from '@/features/todos/todo';
import { weekdayOf, type WeekStart } from '@/lib/calendar/monthGrid';
import { weekDates } from '@/lib/calendar/week';
import type { SolarDate } from '@/lib/lunar';
import { makeStyles, space, useTheme } from '@/theme';
import { calendarOrder, isTodo, occurrenceKey, occurrencesOnDay } from './dayOccurrences';
import { dayDetails, type DayDisplay } from './dayInfo';
import { EventCard, HolidayCard } from './EventCard';
import { WeekChips } from './WeekChips';

const TITLE_MAX_CHARS = 10;

// Màn 2: one row per day — weekday, solar + lunar date, then its cards scrolling sideways.
// Tapping the row outside a card opens the event form as an all-day event on that day.
export function WeekView({
  cursor,
  today,
  weekStart,
  occurrences,
  use24h,
  timeZone,
  display,
  onSelectWeek,
  onPressOccurrence,
  onTickTodo,
  onPressHoliday,
  onAddAllDay,
  cycleOf,
  refreshControl,
}: {
  cursor: SolarDate;
  today: SolarDate;
  weekStart: WeekStart;
  occurrences: EventOccurrence[];
  use24h: boolean;
  timeZone: string;
  display: DayDisplay;
  onSelectWeek: (deltaWeeks: number) => void;
  onPressOccurrence: (o: EventOccurrence) => void;
  onTickTodo: (o: TodoOccurrence) => void;
  onPressHoliday: (d: SolarDate) => void;
  onAddAllDay: (d: SolarDate) => void;
  cycleOf: (d: SolarDate) => CycleDay | null;
  // Pull down → Google sync (F4); only while syncing is on.
  refreshControl?: ReactElement<RefreshControlProps>;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const days = useMemo(() => weekDates(cursor, weekStart).map((d) => dayDetails(d, today, display)), [cursor, weekStart, today, display]);

  return (
    <View style={styles.flex}>
      <WeekChips cursor={cursor} weekStart={weekStart} onSelect={onSelectWeek} />
      <ScrollView contentContainerStyle={styles.rows} refreshControl={refreshControl}>
        {days.map((d) => {
          const weekday = weekdayOf(d);
          const dayColor = d.isToday ? colors.primaryDark : weekday === 0 || d.holidays.length > 0 ? colors.error : colors.text;
          const events = occurrencesOnDay(occurrences, d, timeZone).sort(calendarOrder);
          const cycle = cycleOf(d);
          const empty = events.length === 0 && d.holidays.length === 0;
          return (
            <Pressable
              key={`${d.month}-${d.day}`}
              accessibilityRole="button"
              onPress={() => onAddAllDay(d)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View style={styles.date}>
                <AppText variant="caption" color={d.isToday ? colors.primaryDark : colors.textMuted}>
                  {t(`calendar.weekdays.${weekday}`)}
                </AppText>
                <View style={styles.number}>
                  <AppText variant="heading" weight="extrabold" color={dayColor}>
                    {String(d.day).padStart(2, '0')}
                  </AppText>
                  {cycle ? <CycleDrop predicted={cycle.kind === 'predicted'} /> : null}
                </View>
                <AppText variant="caption" color={d.isToday ? colors.primaryDark : colors.textMuted} numberOfLines={1} ellipsizeMode="clip">
                  {d.lunarDayMonth}
                </AppText>
              </View>
              {empty ? (
                <AppText variant="caption" color={colors.textMuted} style={styles.none}>
                  —
                </AppText>
              ) : (
                <GestureScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
                  {d.holidays.map((h) => (
                    <HolidayCard key={h} title={t(`holidaysShort.${h}`)} autoWidth onPress={() => onPressHoliday(d)} />
                  ))}
                  {events.map((o) => (
                    <EventCard
                      key={occurrenceKey(o)}
                      occurrence={o}
                      use24h={use24h}
                      titleMaxChars={TITLE_MAX_CHARS}
                      timeZone={timeZone}
                      onPress={() => onPressOccurrence(o)}
                      onTick={isTodo(o) ? () => onTickTodo(o) : undefined}
                    />
                  ))}
                </GestureScrollView>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  flex: { flex: 1 },
  rows: { paddingHorizontal: space.lg, paddingBottom: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 66, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { backgroundColor: colors.primarySoft },
  date: { width: 52 },
  number: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  none: { flex: 1 },
  cards: { gap: 6, alignItems: 'center', paddingVertical: 4, paddingRight: space.xs },
}));
