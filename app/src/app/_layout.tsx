import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashView } from '@/components/SplashView';
import { ToastProvider } from '@/components/Toast';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { loadSavedLanguage } from '@/i18n';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold });
  const [langLoaded, setLangLoaded] = useState(false);

  useEffect(() => {
    loadSavedLanguage().finally(() => setLangLoaded(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <ToastProvider>
          <RootStack ready={langLoaded} />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/** Guard: chưa đăng nhập → (auth)/login; có phiên → (tabs). */
function RootStack({ ready }: { ready: boolean }) {
  const { loading, profile } = useAuth();
  if (!ready || loading) return <SplashView />;

  const signedIn = !!profile;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings/account" />
      </Stack.Protected>
    </Stack>
  );
}
