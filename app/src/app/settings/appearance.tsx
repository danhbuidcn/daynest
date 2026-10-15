import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { AppearancePreview } from '@/features/appearance/AppearancePreview';
import { BackgroundSection } from '@/features/appearance/BackgroundSection';
import { FontScaleSection, FontSection } from '@/features/appearance/FontSection';
import { ThemeSection } from '@/features/appearance/ThemeSection';
import { makeStyles, space, useTheme } from '@/theme';

// Every choice applies at once to the whole app; the preview on top shows it.
export default function AppearanceScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const label = (key: string) => (
    <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.group}>
      {t(key).toUpperCase()}
    </AppText>
  );
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title={t('appearance.title')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppearancePreview />
        {label('appearance.theme')}
        <ThemeSection />
        {label('appearance.background')}
        <BackgroundSection />
        {label('appearance.font')}
        <FontSection />
        {label('appearance.fontScale')}
        <FontScaleSection />
        <View style={styles.end} />
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg },
  group: { marginHorizontal: space.xs, marginBottom: -space.sm, letterSpacing: 0.6 },
  end: { height: space.lg },
}));
