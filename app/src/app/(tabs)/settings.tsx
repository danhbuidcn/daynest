import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { ChoiceDialog, ConfirmDialog } from '@/components/Dialog';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingRow } from '@/components/SettingRow';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { LANGUAGES, type Language } from '@/i18n';
import { colors, radius, space } from '@/theme';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { profile, signOut, saveLanguage } = useAuth();
  const toast = useToast();
  const [langOpen, setLangOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const current = (i18n.language as Language) ?? 'en';
  const currentLabel = LANGUAGES.find((l) => l.code === current)?.label ?? '';

  if (!profile) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings/account')}>
          {({ pressed }) => (
            <Card style={[styles.account, pressed && { opacity: 0.7 }]}>
              <Avatar name={profile.displayName} uri={profile.avatarUrl} />
              <View style={styles.who}>
                <AppText variant="heading" numberOfLines={1}>
                  {profile.displayName}
                </AppText>
                <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {profile.email}
                </AppText>
              </View>
              <View style={styles.edit}>
                <Ionicons name="pencil" size={18} color={colors.primaryDark} />
              </View>
            </Card>
          )}
        </Pressable>

        <GroupLabel text={t('settings.account')} />
        <Card>
          <SettingRow first icon="mail-outline" label={t('settings.signedInWith')} value="Google" />
        </Card>

        <GroupLabel text={t('settings.app')} />
        <Card>
          <SettingRow first icon="globe-outline" label={t('settings.language')} value={currentLabel} onPress={() => setLangOpen(true)} />
          <SettingRow icon="information-circle-outline" label={t('settings.version')} value={Constants.expoConfig?.version ?? ''} />
        </Card>

        <Card>
          <SettingRow first danger icon="log-out-outline" label={t('settings.logout')} onPress={() => setLogoutOpen(true)} />
        </Card>
      </ScrollView>

      <ChoiceDialog
        visible={langOpen}
        title={t('settings.language')}
        options={LANGUAGES.map((l) => ({ value: l.code, label: l.label, tag: l.code.toUpperCase() }))}
        selected={current}
        onSelect={(lang) => {
          setLangOpen(false);
          // Chữ đổi ngay (lưu trên máy); lưu DB lỗi thì báo, lần sau đổi lại sẽ ghi tiếp.
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
  edit: { width: 34, height: 34, borderRadius: radius.icon, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  group: { marginHorizontal: space.xs, marginBottom: -space.sm, letterSpacing: 0.6 },
});
