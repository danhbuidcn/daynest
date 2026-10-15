import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog, DialogShell } from '@/components/Dialog';
import { FormScreen } from '@/components/FormScreen';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOnline } from '@/features/network/useOnline';
import { makeStyles, radius, space, useTheme } from '@/theme';

const ITEMS = ['events', 'money', 'cycle', 'devices'] as const;

export default function DeleteAccountScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, deleteAccount } = useAuth();
  const { canWrite } = useOnline();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = async () => {
    setConfirmOpen(false);
    setFailed(false);
    setBusy(true);
    try {
      // Success clears the profile; the auth gate then replaces this screen with the sign-in screen.
      await deleteAccount();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormScreen
      title={t('deleteAccount.title')}
      onBack={() => router.back()}
      footer={<Button label={t('deleteAccount.button')} variant="danger" disabled={!canWrite || busy} onPress={() => setConfirmOpen(true)} />}
    >
      <Card style={styles.hero}>
        <View style={styles.heroIcon}>
          <Icon name="userx" size={28} color={colors.error} />
        </View>
        <AppText variant="heading" style={styles.center}>
          {t('deleteAccount.heading')}
        </AppText>
        <AppText color={colors.textMuted}>{profile?.email}</AppText>
      </Card>

      <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.group}>
        {t('deleteAccount.listTitle').toUpperCase()}
      </AppText>
      <Card>
        {ITEMS.map((key, i) => (
          <View key={key} style={[styles.row, i > 0 && styles.divider]}>
            <Icon name="trash" size={22} color={colors.error} />
            <AppText>{t(`deleteAccount.items.${key}`)}</AppText>
          </View>
        ))}
      </Card>

      <ConfirmDialog
        visible={confirmOpen}
        icon="userx"
        title={t('deleteAccount.confirmTitle')}
        text={t('deleteAccount.confirmText')}
        cancelLabel={t('deleteAccount.cancel')}
        confirmLabel={t('deleteAccount.confirm')}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void run()}
      />
      <ConfirmDialog
        visible={failed}
        icon="warn"
        tone="warning"
        title={t('deleteAccount.failedTitle')}
        text={t('deleteAccount.failedText')}
        cancelLabel={t('deleteAccount.close')}
        confirmLabel={t('deleteAccount.retry')}
        onCancel={() => setFailed(false)}
        onConfirm={() => void run()}
      />
      {/* Not closable: the request is in flight and the buttons stay locked until it ends. */}
      <DialogShell visible={busy} onClose={() => {}}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <AppText variant="heading" style={styles.center}>
          {t('deleteAccount.busy')}
        </AppText>
      </DialogShell>
    </FormScreen>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  hero: { padding: space.lg, alignItems: 'center', gap: space.sm },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.card,
    backgroundColor: colors.errorSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  group: { marginTop: space.lg, marginBottom: space.sm, marginLeft: space.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52, paddingHorizontal: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  spinner: { marginBottom: space.md },
}));
