import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import type { WeekStart } from '@/lib/calendar/monthGrid';
import { addDays, startOfWeek } from '@/lib/calendar/week';
import type { SolarDate } from '@/lib/lunar';
import { makeStyles, radius, space, useTheme } from '@/theme';

const AROUND = 2;

// Màn 2 thanh chọn tuần: two weeks either side of the shown one, spread evenly across the width.
export function WeekChips({ cursor, weekStart, onSelect }: { cursor: SolarDate; weekStart: WeekStart; onSelect: (deltaWeeks: number) => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const start = startOfWeek(cursor, weekStart);

  return (
    <View style={styles.bar}>
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
            <AppText weight="extrabold" color={on ? colors.white : colors.text} numberOfLines={1} style={styles.range}>
              {`${first.day} – ${last.day}`}
            </AppText>
            <AppText variant="caption" color={on ? colors.white : colors.textMuted} numberOfLines={1}>
              {t(`calendar.monthsShort.${first.month}`)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors, shadow }) => ({
  bar: { flexDirection: 'row', gap: space.xs, paddingHorizontal: space.md, paddingBottom: space.sm, paddingTop: 2 },
  chip: { flex: 1, height: 46, borderRadius: radius.button, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow },
  range: { fontSize: 14, lineHeight: 20 },
  on: { backgroundColor: colors.primary },
  pressed: { opacity: 0.7 },
}));
