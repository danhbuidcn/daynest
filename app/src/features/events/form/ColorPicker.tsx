import { Pressable, StyleSheet, View } from 'react-native';

import { colors, eventColors, space } from '@/theme';
import { EVENT_COLORS, type EventColor } from '../event';

// 6 event colours as tappable dots (design-system § Màu) — reused by note categories later.
export function ColorPicker({ value, onChange }: { value: EventColor; onChange: (c: EventColor) => void }) {
  return (
    <View style={styles.row}>
      {EVENT_COLORS.map((c) => (
        <Pressable
          key={c}
          accessibilityRole="radio"
          accessibilityLabel={c}
          accessibilityState={{ selected: value === c }}
          onPress={() => onChange(c)}
          style={[styles.dot, { backgroundColor: eventColors[c] }, value === c && styles.on]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, paddingVertical: space.sm },
  dot: { width: 28, height: 28, borderRadius: 14 },
  on: { borderWidth: 3, borderColor: colors.text },
});
