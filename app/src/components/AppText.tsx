import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, type as typeScale } from '@/theme';
import { useUiScale } from '@/theme/useUiScale';

type Props = TextProps & {
  variant?: keyof typeof typeScale;
  color?: string;
  weight?: 'semibold' | 'bold' | 'extrabold';
};

const weightFamily = {
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

export function AppText({ variant = 'body', color = colors.text, weight, style, ...rest }: Props) {
  const scale = useUiScale();
  const base = StyleSheet.flatten([typeScale[variant], { color }, weight && { fontFamily: weightFamily[weight] }, style]);
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
