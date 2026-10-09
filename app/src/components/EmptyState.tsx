import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space } from '@/theme';
import { AppText } from './AppText';
import { ScreenHeader } from './ScreenHeader';

/** Tab chưa có tính năng: cùng màu `primary` cho mọi tab. */
export function EmptyState({ title, icon }: { title: string; icon: keyof typeof Ionicons.glyphMap }) {
  const { t } = useTranslation();
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title={title} />
      <View style={styles.body}>
        <View style={styles.bubble}>
          <Ionicons name={icon} size={52} color={colors.primary} />
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.xl, paddingBottom: 80 },
  bubble: { width: 112, height: 112, borderRadius: 40, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  text: { maxWidth: 260 },
});
