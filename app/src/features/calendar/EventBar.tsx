import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { TodoTick } from '@/features/todos/TodoTick';
import type { BarItem } from '@/lib/calendar/eventBars';
import { textOn, toHex } from '@/lib/colors';
import { colors } from '@/theme';

// Month cells use the small bar; the day view's "Cả ngày" row uses `large` (tappable for events).
// A todo bar starts with a round tick: only shown on the small bar, tappable (`onTick`) on the large one.
export function EventBar({ item, large = false, onPress, onTick }: { item: BarItem; large?: boolean; onPress?: () => void; onTick?: () => void }) {
  const background = item.kind === 'holiday' ? colors.error : toHex(item.color ?? 'mint');
  const textColor = item.kind === 'holiday' ? colors.white : textOn(item.color ?? 'mint');
  const done = !!item.todo?.done;
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.bar, large && styles.large, { backgroundColor: background }, done && styles.done, pressed && styles.pressed]}>
      {item.todo && large && onTick ? <TodoTick done={done} size={18} onPress={onTick} label={item.title} /> : null}
      {item.todo && !large ? (
        <View style={[styles.dot, { borderColor: textColor }, done && { backgroundColor: textColor }]}>
          {done ? <Icon name="check" size={7} color={background} /> : null}
        </View>
      ) : null}
      <AppText
        variant={large ? 'body' : 'caption'}
        color={textColor}
        numberOfLines={1}
        ellipsizeMode="clip"
        style={[styles.flex, done && styles.strike]}>
        {item.title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { height: 16, borderRadius: 6, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', gap: 2 },
  large: { height: 32, borderRadius: 10, paddingHorizontal: 10, gap: 6 },
  pressed: { opacity: 0.7 },
  done: { opacity: 0.55 },
  flex: { flex: 1 },
  strike: { textDecorationLine: 'line-through' },
  dot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center' },
});
