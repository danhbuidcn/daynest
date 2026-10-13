import { Pressable, StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme';
import { AppText } from './AppText';
import { Card } from './Card';

const BAR_MAX = 96;
const BAR_MIN = 3;

type Props = {
  title: string;
  values: number[];
  // Axis text per bar; '' leaves that slot blank.
  labels: string[];
  // The bar drawn in `primaryDark` (viewed period / today), -1 for none.
  highlight: number;
  // Short number over the tallest bar ("2,5tr").
  formatTop: (value: number) => string;
  // Full text for one bar: screen readers and long press.
  describe: (index: number) => string;
  onPress: (index: number) => void;
  onLongPress: (index: number) => void;
};

// design-system "Biểu đồ cột": one series, one colour.
export function BarChart({ title, values, labels, highlight, formatTop, describe, onPress, onLongPress }: Props) {
  const max = Math.max(...values, 0);
  const top = max > 0 ? values.indexOf(max) : -1;
  return (
    <Card>
      <AppText variant="heading" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.bars}>
        {values.map((v, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={describe(i)}
            onPress={() => onPress(i)}
            onLongPress={() => onLongPress(i)}
            style={styles.slot}
          >
            {i === top ? (
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

const styles = StyleSheet.create({
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
  bar: { width: '100%', maxWidth: 28, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  // "primary nhạt 55%" on the white card.
  barOff: { backgroundColor: colors.primary, opacity: 0.55 },
  barOn: { backgroundColor: colors.primaryDark },
  axis: { flexDirection: 'row', gap: 2, paddingTop: space.xs, paddingBottom: space.md, paddingHorizontal: space.lg },
});
