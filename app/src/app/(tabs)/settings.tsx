import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { ChoiceDialog, ConfirmDialog } from '@/components/Dialog';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingRow } from '@/components/SettingRow';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { GoogleSettings } from '@/features/google/GoogleSettings';
import { CalendarSettings } from '@/features/settings/CalendarSettings';
import { CycleSettings } from '@/features/settings/CycleSettings';
import { NotificationSettings } from '@/features/settings/NotificationSettings';
import { LANGUAGES, type Language } from '@/i18n';
import { colors, space } from '@/theme';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { profile, signOut, saveLanguage, listDevices } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [langOpen, setLangOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);

  useEffect(() => {
    listDevices()
      .then((rows) => setDeviceCount(rows.length))
      .catch(() => setDeviceCount(null));
  }, [listDevices]);

  const current = (i18n.language as Language) ?? 'en';
  const currentLabel = LANGUAGES.find((l) => l.code === current)?.label ?? '';

  if (!profile) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.account}>
          <Avatar name={profile.displayName} uri={profile.avatarUrl} />
          <View style={styles.who}>
            <AppText variant="heading" numberOfLines={1}>
              {profile.displayName}
            </AppText>
            <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
              {profile.email}
            </AppText>
          </View>
        </Card>

        <GroupLabel text={t('settings.account')} />
        <Card>
          <SettingRow first icon="mail" label={t('settings.signedInWith')} value="Google" />
          <SettingRow
            icon="devices"
            label={t('settings.devices')}
            value={deviceCount !== null ? `${deviceCount}/2` : ''}
            onPress={() => router.push('/settings/devices')}
          />
        </Card>

        <GroupLabel text={t('settings.notifications')} />
        <NotificationSettings />

        <GroupLabel text={t('settings.calendar')} />
        <CalendarSettings />

        <GroupLabel text={t('settings.cycle')} />
        <CycleSettings />

        <GroupLabel text={t('google.group')} />
        <GoogleSettings />

        <GroupLabel text={t('settings.app')} />
        <Card>
          <SettingRow first icon="globe" label={t('settings.language')} value={currentLabel} onPress={() => setLangOpen(true)} />
          <SettingRow icon="info" label={t('settings.version')} value={Constants.expoConfig?.version ?? ''} />
        </Card>

        <Card>
          <SettingRow first danger icon="logout" label={t('settings.logout')} onPress={() => setLogoutOpen(true)} />
        </Card>
      </ScrollView>

      <ChoiceDialog
        visible={langOpen}
        title={t('settings.language')}
        options={LANGUAGES.map((l) => ({ value: l.code, label: l.label, tag: l.code.toUpperCase() }))}
        selected={current}
        onSelect={(lang) => {
          setLangOpen(false);
          // Text switches immediately (saved on device); if the DB save fails, show a toast; the next change retries.
          saveLanguage(lang).catch(() => toast(t('common.offline'), 'error'));
        }}
        onClose={() => setLangOpen(false)}
      />
      <ConfirmDialog
        visible={logoutOpen}
        title={t('logoutDialog.title')}
        text={t('logoutDialog.text')}
        cancelLabel={t('logoutDialog.cancel')}
        confirmLabel={t('logoutDialog.confirm')}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          signOut();
        }}
      />
    </SafeAreaView>
  );
}

function GroupLabel({ text }: { text: string }) {
  return (
    <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.group}>
      {text.toUpperCase()}
    </AppText>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xxl, gap: space.lg },
  account: { padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: 14 },
  who: { flex: 1, minWidth: 0 },
  group: { marginHorizontal: space.xs, marginBottom: -space.sm, letterSpacing: 0.6 },
});
