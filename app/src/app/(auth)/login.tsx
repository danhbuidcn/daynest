import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { AuthError } from '@/features/auth/authService';
import { colors, space } from '@/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
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
        icon={<Ionicons name="logo-google" size={18} color={colors.white} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.xl, paddingBottom: 40 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  tagline: { textAlign: 'center' },
});
