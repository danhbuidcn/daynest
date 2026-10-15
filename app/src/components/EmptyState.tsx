import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { makeStyles, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { ScreenHeader } from './ScreenHeader';

export function EmptyState({ title, icon }: { title: string; icon: IconName }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title={title} />
      <View style={styles.body}>
        <View style={styles.bubble}>
          <Icon name={icon} size={52} color={colors.primary} />
        </View>
        <AppText variant="heading" style={styles.center}>
          {t('empty.title', { name: title })}
        </AppText>
        <AppText color={colors.textMuted} style={[styles.center, styles.text]}>
          {t('empty.text')}
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.xl, paddingBottom: 80 },
  bubble: { width: 112, height: 112, borderRadius: 40, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  text: { maxWidth: 260 },
}));
