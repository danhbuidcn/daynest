import { Image, StyleSheet, View } from 'react-native';

import { colors, fonts } from '@/theme';
import { AppText } from './AppText';

/** Logo tạm: ô sổ ghi chú + chữ "Daynest" (cỡ 30, riêng logo). */
export function Logo() {
  return (
    <View style={styles.wrap}>
      <Image source={require('../../assets/logo.png')} style={styles.icon} />
      <AppText style={styles.word} color={colors.text}>
        Daynest
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 16 },
  icon: { width: 96, height: 96 },
  word: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 38 },
});
