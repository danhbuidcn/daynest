import { Image, View } from 'react-native';

import { makeStyles, useTheme } from '@/theme';
import { AppText } from './AppText';

export function Logo() {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      <Image source={require('../../assets/logo.png')} style={styles.icon} />
      <AppText style={styles.word} color={colors.text}>
        Daynest
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ fonts }) => ({
  wrap: { alignItems: 'center', gap: 16 },
  icon: { width: 96, height: 96 },
  word: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 38 },
}));
