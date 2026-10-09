import { Image, View } from 'react-native';

import { colors, type as typeScale } from '@/theme';
import { AppText } from './AppText';

export function Avatar({ name, uri, size = 56 }: { name: string; uri: string | null; size?: number }) {
  const shape = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={shape} />;
  return (
    <View style={[shape, { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }]}>
      <AppText style={typeScale.title} color={colors.white}>
        {name.trim().charAt(0).toUpperCase() || '?'}
      </AppText>
    </View>
  );
}
