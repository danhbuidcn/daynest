import { Pressable, StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme';
import { AppText } from './AppText';

// Mockup `.seg`: the view switch of the Lịch and Chi tiêu tabs.
export function SegmentedBar<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.item, on && styles.on]}>
            <AppText weight={on ? 'bold' : undefined} color={on ? colors.white : colors.text} numberOfLines={1}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 36,
    marginTop: space.xs,
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    padding: 3,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  on: { backgroundColor: colors.primary },
});
