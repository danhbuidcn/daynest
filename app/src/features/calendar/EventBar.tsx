import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import type { BarItem } from '@/lib/calendar/eventBars';
import { textOn, toHex } from '@/lib/colors';
import { colors } from '@/theme';

// Month cells use the small bar; the day view's "Cả ngày" row uses `large` (tappable for events).
export function EventBar({ item, large = false, onPress }: { item: BarItem; large?: boolean; onPress?: () => void }) {
  const background = item.kind === 'holiday' ? colors.error : toHex(item.color ?? 'mint');
  const textColor = item.kind === 'holiday' ? colors.white : textOn(item.color ?? 'mint');
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.bar, large && styles.large, { backgroundColor: background }, pressed && styles.pressed]}>
      <AppText variant={large ? 'body' : 'caption'} color={textColor} numberOfLines={1} ellipsizeMode="clip">
        {item.title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { height: 16, borderRadius: 6, paddingHorizontal: 4, justifyContent: 'center' },
  large: { height: 32, borderRadius: 10, paddingHorizontal: 10 },
  pressed: { opacity: 0.7 },
});
