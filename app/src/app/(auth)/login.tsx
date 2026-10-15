import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { AlertDialog } from '@/components/Dialog';
import { Logo } from '@/components/Logo';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthError } from '@/features/auth/authService';
import { makeStyles, space, useTheme } from '@/theme';

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const { signIn, kickedOut, dismissKickedOut } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      const kind = e instanceof AuthError ? e.kind : 'failed';
      if (kind !== 'cancelled') toast(t(kind === 'offline' ? 'common.offline' : 'login.error'), 'error');
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.hero}>
        <Logo />
        <AppText color={colors.textMuted} style={styles.tagline}>
          {t('tagline')}
        </AppText>
      </View>
      <Button
        label={t('login.google')}
        onPress={onSignIn}
        disabled={busy}
        icon={<View style={styles.gIcon}><AppText variant="caption" weight="extrabold" color={colors.primaryDark}>G</AppText></View>}
      />
      <AlertDialog
        visible={kickedOut}
        tone="warning"
        icon="devices"
        title={t('kickedDialog.title')}
        text={t('kickedDialog.text')}
        buttonLabel={t('kickedDialog.button')}
        onClose={dismissKickedOut}
      />
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  gIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xl, paddingBottom: 40 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  tagline: { textAlign: 'center' },
}));
