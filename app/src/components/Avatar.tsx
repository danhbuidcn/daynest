import { Image, View } from 'react-native';

import { useTheme } from '@/theme';
import { AppText } from './AppText';

export function Avatar({ name, uri, size = 56 }: { name: string; uri: string | null; size?: number }) {
  const { colors, type } = useTheme();
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={shape} />;
  return (
    <View style={[shape, { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }]}>
      <AppText style={type.title} color={colors.white}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </AppText>
    </View>
  );
}
