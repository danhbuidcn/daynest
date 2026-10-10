import { useTranslation } from 'react-i18next';
import { Linking, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { colors } from '@/theme';

// The battery-optimization list needs no extra permission, unlike the per-app request intent.
const BATTERY_SETTINGS = 'android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS';

// Màn 11b — from the `!` next to "Cài đặt nhắc nhở".
export function BatteryTipDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation();

  const exclude = () => {
    onClose();
    if (Platform.OS === 'android') Linking.sendIntent(BATTERY_SETTINGS).catch(() => Linking.openSettings());
    else void Linking.openSettings();
  };

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <View style={styles.icon}>
        <Icon name="battery" size={28} color={colors.warning} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {t('reminders.batteryTitle')}
      </AppText>
      <AppText color={colors.textMuted} style={[styles.center, styles.text]}>
        {t('reminders.batteryText')}
      </AppText>
      <View style={styles.actions}>
        <Button label={t('reminders.later')} variant="secondary" onPress={onClose} style={styles.flex} />
        <Button label={t('reminders.exclude')} onPress={exclude} style={styles.flex} />
      </View>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.warningSoft,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  center: { textAlign: 'center' },
  text: { marginTop: 6, marginBottom: 20 },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});
