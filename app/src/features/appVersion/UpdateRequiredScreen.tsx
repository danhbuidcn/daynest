import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { colors, space } from '@/theme';
import type { UpdateInfo } from './useUpdateRequired';

export function UpdateRequiredScreen({ updateUrl }: UpdateInfo) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.body}>
        <View style={styles.bubble}>
          <Icon name="sync" size={52} color={colors.primary} />
        </View>
        <AppText variant="heading" style={styles.center}>
          {t('update.title')}
        </AppText>
        <AppText color={colors.textMuted} style={[styles.center, styles.text]}>
          {t('update.text')}
        </AppText>
      </View>
      {updateUrl ? (
        <View style={styles.footer}>
          <Button label={t('update.action')} onPress={() => Linking.openURL(updateUrl)} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.xl },
  bubble: { width: 112, height: 112, borderRadius: 40, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  text: { maxWidth: 280 },
  footer: { paddingHorizontal: space.lg, paddingBottom: space.lg },
});
