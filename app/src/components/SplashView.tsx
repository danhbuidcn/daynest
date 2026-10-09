import { StyleSheet, View } from 'react-native';

import { colors, space } from '@/theme';
import { Logo } from './Logo';

export function SplashView() {
  return (
    <View style={styles.screen}>
      <Logo />
      <View style={styles.dots}>
        {[0.35, 0.65, 1].map((opacity) => (
          <View key={opacity} style={[styles.dot, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  dots: { flexDirection: 'row', gap: 6, marginTop: space.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
