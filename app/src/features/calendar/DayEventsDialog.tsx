import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { PopupHeader } from '@/components/PopupHeader';
import { dateLabel, lunarLabel } from '@/features/events/format';
import type { EventOccurrence } from '@/features/events/occurrences';
import type { TodoOccurrence } from '@/features/todos/todo';
import type { HolidayId } from '@/lib/holidays';
import type { SolarDate } from '@/lib/lunar';
import { colors, space } from '@/theme';
import { isTodo } from './dayOccurrences';
import { EventListRow, HolidayRow } from './EventListRow';

// Pop-up ngày (màn 7): lễ + event + todo (S5, tick được) của 1 ngày, nút `+` tạo event ngày đó.
export function DayEventsDialog({
  visible,
  date,
  holidays,
  showLunar,
  occurrences,
  use24h,
  timeZone,
  onClose,
  onAdd,
  onPressOccurrence,
  onTickTodo,
}: {
  visible: boolean;
  date: SolarDate;
  holidays: HolidayId[];
  showLunar: boolean;
  occurrences: EventOccurrence[];
  use24h: boolean;
  timeZone: string;
  onClose: () => void;
  onAdd: () => void;
  onPressOccurrence: (o: EventOccurrence) => void;
  onTickTodo: (o: TodoOccurrence) => void;
}) {
  const { t } = useTranslation();

  return (
    <DialogShell visible={visible} onClose={onClose} large>
      <PopupHeader
        title={
          <View>
            <AppText variant="heading" style={styles.center} numberOfLines={1}>
              {dateLabel(t, date)}
            </AppText>
            {showLunar ? (
              <AppText variant="caption" color={colors.textMuted} style={styles.center}>
                {lunarLabel(t, date)}
              </AppText>
            ) : null}
          </View>
        }
        onClose={onClose}
        onAdd={onAdd}
      />
      <ScrollView style={styles.list}>
        {holidays.map((h) => (
          <HolidayRow key={h} title={t(`holidays.${h}`)} />
        ))}
        {occurrences.map((o) => (
          <EventListRow key={`${o.eventId}-${o.occurrenceDate}`} occurrence={o} use24h={use24h} timeZone={timeZone} onPress={() => onPressOccurrence(o)} onTick={isTodo(o) ? () => onTickTodo(o) : undefined} />
        ))}
        {holidays.length === 0 && occurrences.length === 0 ? (
          <AppText color={colors.textMuted} style={styles.empty}>
            {t('events.dayDialog.empty')}
          </AppText>
        ) : null}
      </ScrollView>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  list: { maxHeight: 560 },
  empty: { textAlign: 'center', paddingVertical: space.xl },
});
