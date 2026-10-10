import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { lunarLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import type { SolarDate } from '@/lib/lunar';
import { colors, space } from '@/theme';
import { byStartTime, occurrenceKey, occurrencesOnDay, timedSpansOnDay } from './dayOccurrences';
import { dayDetails, type DayDisplay } from './dayInfo';
import { DayTimeline, LABEL_WIDTH } from './DayTimeline';
import { EventBar } from './EventBar';

// Màn 3: lunar date · "Cả ngày" row (holidays + all-day events) · hour grid.
export function DayView({
  cursor,
  today,
  occurrences,
  use24h,
  timeZone,
  display,
  onPressOccurrence,
  onPressHoliday,
  onAddAt,
}: {
  cursor: SolarDate;
  today: SolarDate;
  occurrences: EventOccurrence[];
  use24h: boolean;
  timeZone: string;
  display: DayDisplay;
  onPressOccurrence: (o: EventOccurrence) => void;
  onPressHoliday: (d: SolarDate) => void;
  // Tapping an empty hour (hour) or the "Cả ngày" row (null) opens the event form for it.
  onAddAt: (d: SolarDate, hour: number | null) => void;
}) {
  const { t } = useTranslation();
  const day = useMemo(() => dayDetails(cursor, today, display), [cursor, today, display]);
  const onDay = useMemo(() => occurrencesOnDay(occurrences, cursor, timeZone).sort(byStartTime), [occurrences, cursor, timeZone]);
  const allDay = onDay.filter((o) => o.allDay);
  const spans = useMemo(() => timedSpansOnDay(occurrences, cursor, timeZone), [occurrences, cursor, timeZone]);
  const hasAllDay = allDay.length > 0 || day.holidays.length > 0;

  return (
    <View style={styles.flex}>
      {day.showLunar ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.lunar}>
          {lunarLabel(t, cursor)}
        </AppText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => onAddAt(cursor, null)}
        style={({ pressed }) => [styles.allDay, pressed && styles.pressed]}>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1} ellipsizeMode="clip" style={styles.allDayLabel}>
          {t('events.form.allDay')}
        </AppText>
        {hasAllDay ? (
          <ScrollView style={styles.allDayList} contentContainerStyle={styles.allDayItems} nestedScrollEnabled>
            {day.holidays.map((h) => (
              <EventBar key={h} item={{ kind: 'holiday', id: h, title: t(`holidaysShort.${h}`) }} large onPress={() => onPressHoliday(cursor)} />
            ))}
            {allDay.map((o) => (
              <EventBar
                key={occurrenceKey(o)}
                item={{ kind: 'event', id: occurrenceKey(o), title: o.title, color: o.color }}
                large
                onPress={() => onPressOccurrence(o)}
              />
            ))}
          </ScrollView>
        ) : (
          <AppText variant="caption" color={colors.textMuted}>
            —
          </AppText>
        )}
      </Pressable>
      <DayTimeline
        spans={spans}
        isToday={day.isToday}
        use24h={use24h}
        timeZone={timeZone}
        onPressOccurrence={onPressOccurrence}
        onPressHour={(hour) => onAddAt(cursor, hour)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lunar: { paddingHorizontal: space.lg, paddingBottom: 6 },
  allDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: space.lg,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.primarySoft },
  allDayLabel: { width: LABEL_WIDTH },
  allDayList: { flex: 1, maxHeight: 96 },
  allDayItems: { gap: space.xs },
});
