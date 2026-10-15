import { Pressable, View } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

export function Switch({ value, onValueChange, disabled }: { value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      style={[styles.track, { backgroundColor: value ? colors.primary : colors.border }, disabled && styles.disabled]}>
      <View style={[styles.thumb, value && styles.thumbOn]} />
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  track: { width: 44, height: 26, borderRadius: 999, padding: 2, justifyContent: 'center' },
  disabled: { opacity: 0.5 },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    shadowColor: colors.text,
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  thumbOn: { alignSelf: 'flex-end' },
}));
