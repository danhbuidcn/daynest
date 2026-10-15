import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { radius, space, useTheme, type Theme } from '@/theme';
import { AppText } from './AppText';

type Variant = 'primary' | 'secondary' | 'danger' | 'dangerSoft';

const looks = (colors: Theme['colors']): Record<Variant, { bg: string; fg: string; border?: string }> => ({
  primary: { bg: colors.primary, fg: colors.white },
  secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
  danger: { bg: colors.error, fg: colors.white },
  dangerSoft: { bg: colors.errorSoft, fg: colors.error },
});

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
  const { colors } = useTheme();
  const v = looks(colors)[variant];
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
      <AppText weight="bold" color={v.fg} numberOfLines={1}>
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
