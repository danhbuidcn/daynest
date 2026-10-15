import { Pressable } from 'react-native';

import { Icon } from '@/components/Icon';
import { makeStyles, useTheme } from '@/theme';

// Round tick of a todo (mockup S5): not done = primary ring · done = filled primary + white ✓.
// `square` is the subtask tick, same look as a note checklist item.
export function TodoTick({
  done,
  onPress,
  size = 22,
  square,
  label,
}: {
  done: boolean;
  onPress: () => void;
  size?: number;
  square?: boolean;
  label?: string;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      style={[styles.tick, { width: size, height: size, borderRadius: square ? 6 : size / 2 }, done && styles.on]}>
      {done ? <Icon name="check" size={Math.round(size * 0.64)} color={colors.white} /> : null}
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  tick: { borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.primary },
}));
