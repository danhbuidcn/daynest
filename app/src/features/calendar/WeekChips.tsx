import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import type { WeekStart } from '@/lib/calendar/monthGrid';
import { addDays, startOfWeek } from '@/lib/calendar/week';
import type { SolarDate } from '@/lib/lunar';
import { colors, radius, shadow, space } from '@/theme';

const AROUND = 4;
const CHIP_WIDTH = 76;
const GAP = space.sm;

// Màn 2 thanh chọn tuần: a few weeks either side of the shown one, the shown one centred.
export function WeekChips({ cursor, weekStart, onSelect }: { cursor: SolarDate; weekStart: WeekStart; onSelect: (deltaWeeks: number) => void }) {
  const { t } = useTranslation();
  const scroll = useRef<ScrollView>(null);
  const start = startOfWeek(cursor, weekStart);

  useEffect(() => {
    scroll.current?.scrollTo({ x: Math.max(0, (AROUND - 1) * (CHIP_WIDTH + GAP)), animated: false });
  }, [start.year, start.month, start.day]);

  return (
    <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bar} style={styles.scroll}>
      {Array.from({ length: AROUND * 2 + 1 }, (_, i) => {
        const delta = i - AROUND;
        const first = addDays(start, delta * 7);
        const last = addDays(first, 6);
        const on = delta === 0;
        return (
          <Pressable
            key={delta}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(delta)}
            style={({ pressed }) => [styles.chip, on && styles.on, pressed && !on && styles.pressed]}>
            <AppText weight="extrabold" color={on ? colors.white : colors.text} numberOfLines={1}>
              {`${first.day} – ${last.day}`}
            </AppText>
            <AppText variant="caption" color={on ? colors.white : colors.textMuted} numberOfLines={1}>
              {t(`calendar.monthsShort.${first.month}`)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  bar: { gap: GAP, paddingHorizontal: space.lg, paddingBottom: space.sm, paddingTop: 2 },
  chip: { width: CHIP_WIDTH, height: 52, borderRadius: radius.button, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow },
  on: { backgroundColor: colors.primary },
  pressed: { opacity: 0.7 },
});
