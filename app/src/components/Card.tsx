import { View, type ViewProps } from 'react-native';

import { radius, useTheme } from '@/theme';

export function Card({ style, ...rest }: ViewProps) {
  const { colors, shadow } = useTheme();
  return <View {...rest} style={[{ backgroundColor: colors.surface, borderRadius: radius.card }, shadow, style]} />;
}
