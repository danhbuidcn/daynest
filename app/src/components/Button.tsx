import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { colors, radius, space } from '@/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'danger';

const look: Record<Variant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.primary, fg: colors.white },
  secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
  danger: { bg: colors.error, fg: colors.white },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const v = look[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed && variant === 'primary' ? colors.primaryDark : v.bg },
        v.border && { borderWidth: 1.5, borderColor: v.border },
        (pressed && variant !== 'primary') || disabled ? { opacity: 0.7 } : null,
        style,
      ]}>
      {icon ? <View>{icon}</View> : null}
      <AppText weight="bold" color={v.fg}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
});
