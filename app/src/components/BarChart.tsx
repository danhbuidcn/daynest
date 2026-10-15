import { Pressable, View } from 'react-native';

import { makeStyles, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Card } from './Card';

const BAR_MAX = 96;
const BAR_MIN = 3;

type Props = {
  title: string;
  values: number[];
  // Axis text per bar; '' leaves that slot blank.
  labels: string[];
  // The bar drawn in `primaryDark` (selected, else today / viewed period), -1 for none.
  highlight: number;
  // Short number over a bar ("2,5tr").
  formatTop: (value: number) => string;
  // Every bar shows its number (few bars); otherwise only the tallest and the highlighted one.
  showAll: boolean;
  // Full text of the highlighted bar, under the title.
  readout?: string;
  // Range buttons under the title ("Cả tháng", "1–10", …).
  chips?: { label: string; active: boolean; onPress: () => void }[];
  // Full text for one bar: screen readers.
  describe: (index: number) => string;
  onPress: (index: number) => void;
};

// design-system "Biểu đồ cột": one series, one colour.
export function BarChart({ title, values, labels, highlight, formatTop, showAll, readout, chips, describe, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const max = Math.max(...values, 0);
  const top = max > 0 ? values.indexOf(max) : -1;
  return (
    <Card>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      {chips ? (
        <View style={styles.chips}>
          {chips.map((c) => (
            <Pressable key={c.label} accessibilityRole="button" accessibilityState={{ selected: c.active }} onPress={c.onPress} style={[styles.chip, c.active && styles.chipOn]}>
              <AppText variant="caption" weight="bold" color={c.active ? colors.white : colors.primaryDark}>
                {c.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
      {readout ? (
        <AppText variant="caption" color={colors.textMuted} style={styles.readout}>
          {readout}
        </AppText>
      ) : null}
      <View style={styles.bars}>
        {values.map((v, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={describe(i)}
            onPress={() => onPress(i)}
            style={styles.slot}
          >
            {v > 0 && (showAll || i === top || i === highlight) ? (
              <AppText variant="micro" weight="extrabold" numberOfLines={1} style={[styles.overflowText, styles.topValue]}>
                {formatTop(v)}
              </AppText>
            ) : null}
            {v > 0 ? (
              <View
                style={[
                  styles.bar,
                  i === highlight ? styles.barOn : styles.barOff,
                  { height: Math.max((v / max) * BAR_MAX, BAR_MIN) },
                ]}
              />
            ) : null}
          </Pressable>
        ))}
      </View>
      <View style={styles.axis}>
        {labels.map((l, i) => (
          <View key={i} style={styles.labelSlot}>
            <AppText
              variant="caption"
              numberOfLines={1}
              color={i === highlight ? colors.primaryDark : colors.textMuted}
              weight={i === highlight ? 'extrabold' : undefined}
              style={styles.overflowText}
            >
              {l}
            </AppText>
          </View>
        ))}
      </View>
    </Card>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  title: { paddingTop: space.md, paddingHorizontal: space.lg, paddingBottom: space.xs },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 120,
    paddingHorizontal: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  slot: { flex: 1, height: '100%', minWidth: 0, alignItems: 'center', justifyContent: 'flex-end' },
  labelSlot: { flex: 1, minWidth: 0, alignItems: 'center' },
  // A month-day slot is ~9 px wide: text gets a fixed width and spills over its neighbours instead of being cut.
  overflowText: { width: 48, textAlign: 'center' },
  topValue: { marginBottom: 2 },
  chips: { flexDirection: 'row', gap: 6, paddingHorizontal: space.lg, paddingBottom: space.sm },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.primarySoft },
  chipOn: { backgroundColor: colors.primary },
  readout: { paddingHorizontal: space.lg, paddingBottom: space.sm },
  bar: { width: '100%', maxWidth: 28, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  // "primary nhạt 55%" on the white card.
  barOff: { backgroundColor: colors.primary, opacity: 0.55 },
  barOn: { backgroundColor: colors.primaryDark },
  axis: { flexDirection: 'row', gap: 2, paddingTop: space.xs, paddingBottom: space.md, paddingHorizontal: space.lg },
}));
