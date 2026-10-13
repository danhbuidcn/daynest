import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, type RefreshControlProps } from 'react-native';

import { AppText } from '@/components/AppText';
import { clockLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import type { TodoOccurrence } from '@/features/todos/todo';
import type { WeekStart } from '@/lib/calendar/monthGrid';
import { timeOfDayIn } from '@/lib/calendar/timeZone';
import { weekDates } from '@/lib/calendar/week';
import type { SolarDate } from '@/lib/lunar';
import { colors, space } from '@/theme';
import { calendarOrder, isTodo, occurrenceKey, occurrencesOnDay } from './dayOccurrences';
import { dayDetails, type DayDisplay } from './dayInfo';
import { DayStrip } from './DayStrip';
import { EventCard, HolidayCard } from './EventCard';

// Màn 4: day strip of the shown week · events of the selected day by time (holidays first).
export function ListView({
  cursor,
  today,
  weekStart,
  occurrences,
  use24h,
  timeZone,
  display,
  onSelectDay,
  onPressOccurrence,
  onTickTodo,
  onPressHoliday,
  refreshControl,
}: {
  cursor: SolarDate;
  today: SolarDate;
  weekStart: WeekStart;
  occurrences: EventOccurrence[];
  use24h: boolean;
  timeZone: string;
  display: DayDisplay;
  onSelectDay: (d: SolarDate) => void;
  onPressOccurrence: (o: EventOccurrence) => void;
  onTickTodo: (o: TodoOccurrence) => void;
  onPressHoliday: (d: SolarDate) => void;
  // Pull down → Google sync (F4); only while syncing is on.
  refreshControl?: ReactElement<RefreshControlProps>;
}) {
  const { t } = useTranslation();
  const days = useMemo(() => weekDates(cursor, weekStart).map((d) => dayDetails(d, today, display)), [cursor, weekStart, today, display]);
  const day = days.find((d) => d.day === cursor.day && d.month === cursor.month) ?? dayDetails(cursor, today, display);
  const events = useMemo(() => occurrencesOnDay(occurrences, cursor, timeZone).sort(calendarOrder), [occurrences, cursor, timeZone]);
  const clock = (iso: string) => clockLabel(t, timeOfDayIn(new Date(iso), timeZone), use24h);
  const empty = events.length === 0 && day.holidays.length === 0;

  return (
    <View style={styles.flex}>
      <DayStrip
        days={days}
        selected={cursor}
        onSelect={onSelectDay}
      />
      {empty ? (
        <AppText color={colors.textMuted} style={styles.empty}>
          {t('events.dayDialog.empty')}
        </AppText>
      ) : (
        <ScrollView contentContainerStyle={styles.agenda} refreshControl={refreshControl}>
          {day.holidays.map((h) => (
            <View key={h} style={styles.row}>
              <View style={styles.times}>
                <AppText variant="caption" color={colors.textMuted} style={styles.right}>
                  {t('events.form.allDay')}
                </AppText>
              </View>
              <HolidayCard title={t(`holidaysShort.${h}`)} onPress={() => onPressHoliday(cursor)} style={styles.flex} />
            </View>
          ))}
          {events.map((o) => (
            <View key={occurrenceKey(o)} style={styles.row}>
              <View style={styles.times}>
                {o.allDay ? (
                  <AppText variant="caption" color={colors.textMuted} style={styles.right}>
                    {t('events.form.allDay')}
                  </AppText>
                ) : (
                  <>
                    <AppText weight="bold" style={styles.right} numberOfLines={1} ellipsizeMode="clip">
                      {clock(o.startsAt!)}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted} style={styles.right} numberOfLines={1} ellipsizeMode="clip">
                      {clock(o.endsAt!)}
                    </AppText>
                  </>
                )}
              </View>
              <EventCard
                occurrence={o}
                subtitle={o.note || undefined}
                use24h={use24h}
                timeZone={timeZone}
                onPress={() => onPressOccurrence(o)}
                onTick={isTodo(o) ? () => onTickTodo(o) : undefined}
                style={styles.flex}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  agenda: { paddingHorizontal: space.lg, paddingBottom: space.lg, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  times: { width: 56, justifyContent: 'center' },
  right: { textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: space.xl },
});
