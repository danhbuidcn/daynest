import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { clockLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import type { WeekStart } from '@/lib/calendar/monthGrid';
import { timeOfDayIn } from '@/lib/calendar/timeZone';
import { weekDates } from '@/lib/calendar/week';
import type { SolarDate } from '@/lib/lunar';
import { colors, space } from '@/theme';
import { byStartTime, occurrenceKey, occurrencesOnDay } from './dayOccurrences';
import { dayDetails } from './dayInfo';
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
  onSelectDay,
  onPressOccurrence,
}: {
  cursor: SolarDate;
  today: SolarDate;
  weekStart: WeekStart;
  occurrences: EventOccurrence[];
  use24h: boolean;
  timeZone: string;
  onSelectDay: (d: SolarDate) => void;
  onPressOccurrence: (o: EventOccurrence) => void;
}) {
  const { t } = useTranslation();
  const days = useMemo(() => weekDates(cursor, weekStart).map((d) => dayDetails(d, today)), [cursor, weekStart, today]);
  const day = days.find((d) => d.day === cursor.day && d.month === cursor.month) ?? dayDetails(cursor, today);
  const events = useMemo(() => occurrencesOnDay(occurrences, cursor, timeZone).sort(byStartTime), [occurrences, cursor, timeZone]);
  const clock = (iso: string) => clockLabel(t, timeOfDayIn(new Date(iso), timeZone), use24h);
  const empty = events.length === 0 && day.holidays.length === 0;

  return (
    <View style={styles.flex}>
      <DayStrip
        days={days}
        selected={cursor}
        hasItems={(d) => d.holidays.length > 0 || occurrencesOnDay(occurrences, d, timeZone).length > 0}
        onSelect={onSelectDay}
      />
      {empty ? (
        <AppText color={colors.textMuted} style={styles.empty}>
          {t('events.dayDialog.empty')}
        </AppText>
      ) : (
        <ScrollView contentContainerStyle={styles.agenda}>
          {day.holidays.map((h) => (
            <View key={h} style={styles.row}>
              <View style={styles.times}>
                <AppText variant="caption" color={colors.textMuted} style={styles.right}>
                  {t('events.form.allDay')}
                </AppText>
              </View>
              <HolidayCard title={t(`holidays.${h}`)} style={styles.flex} />
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
                    <AppText weight="bold" style={styles.right} numberOfLines={1}>
                      {clock(o.startsAt!)}
                    </AppText>
                    <AppText variant="caption" color={colors.textMuted} style={styles.right} numberOfLines={1}>
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
