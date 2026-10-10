import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { SettingRow } from '@/components/SettingRow';
import { Switch } from '@/components/Switch';
import { useAuth } from '@/features/auth/AuthProvider';
import { useNotificationPermission } from '@/features/reminders/useNotificationPermission';
import { colors, radius, space } from '@/theme';
import { useSettingSaver } from './useSettingSaver';

// F3 "Công tắc Cho phép thông báo": on → ask for OS permission; denied → warning + system settings link.
export function NotificationSettings() {
  const { t } = useTranslation();
  const { settings } = useAuth();
  const save = useSettingSaver();
  const permission = useNotificationPermission();
  const blocked = settings.notificationsEnabled && permission.status === 'denied';

  const onToggle = async (on: boolean) => {
    await save({ notificationsEnabled: on });
    if (on) await permission.request();
  };

  return (
    <Card>
      <SettingRow
        first
        icon="bell"
        label={t('settings.allowNotifications')}
        trailing={<Switch value={settings.notificationsEnabled} onValueChange={onToggle} />}
      />
      {blocked ? (
        <View style={styles.warn}>
          <Icon name="warn" size={18} color={colors.warning} />
          <View style={styles.flex}>
            <AppText variant="caption">{t('settings.blocked')}</AppText>
            <Pressable accessibilityRole="link" hitSlop={8} onPress={() => Linking.openSettings()}>
              <AppText variant="caption" weight="extrabold" color={colors.primaryDark}>
                {t('settings.openSystemSettings')}
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  warn: {
    flexDirection: 'row',
    gap: space.sm,
    marginHorizontal: space.md,
    marginBottom: space.md,
    padding: space.md,
    borderRadius: radius.button,
    backgroundColor: colors.warningSoft,
  },
  flex: { flex: 1, gap: 2 },
});
