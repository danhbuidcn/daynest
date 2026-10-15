import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme';
import { useUiScale } from '@/theme/useUiScale';
import type { typeSizes } from '@/theme/tokens';

type Props = TextProps & {
  variant?: keyof typeof typeSizes;
  color?: string;
  weight?: 'semibold' | 'bold' | 'extrabold';
};

export function AppText({ variant = 'body', color, weight, style, ...rest }: Props) {
  const scale = useUiScale();
  const { colors, fonts, type } = useTheme();
  const base = StyleSheet.flatten([type[variant], { color: color ?? colors.text }, weight && { fontFamily: fonts[weight] }, style]);
  const flat = scale === 1 ? base : { ...base, fontSize: base.fontSize && base.fontSize * scale, lineHeight: base.lineHeight && base.lineHeight * scale };
  return (
    // Samsung under-measures custom fonts with the default break strategy and clips the last word.
    <Text
      textBreakStrategy="simple"
      {...rest}
      style={flat}
    />
  );
}
