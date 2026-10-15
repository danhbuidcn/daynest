import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme';
import { useUiScale } from '@/theme/useUiScale';
import type { typeSizes } from '@/theme/tokens';

type Props = TextProps & {
  variant?: keyof typeof typeSizes;
  color?: string;
  weight?: 'semibold' | 'bold' | 'extrabold';
  // Dense grids (month cells, event bars) sit in fixed-height boxes: keep the base size, ignore "Cỡ chữ".
  fixedSize?: boolean;
};

export function AppText({ variant = 'body', color, weight, fixedSize, style, ...rest }: Props) {
  const { colors, fonts, type, fontScale } = useTheme();
  const scale = useUiScale() / (fixedSize ? fontScale : 1);
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
