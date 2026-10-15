import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, TransitionPresets } from 'expo-router/js-stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { LogBox, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashView } from '@/components/SplashView';
import { ToastProvider } from '@/components/Toast';
import { UpdateRequiredScreen } from '@/features/appVersion/UpdateRequiredScreen';
import { useUpdateRequired } from '@/features/appVersion/useUpdateRequired';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { persistOptions, queryClient } from '@/features/cache/queryClient';
import { useGoogleSyncLifecycle } from '@/features/google/useGoogleSync';
import { useReminderSync } from '@/features/reminders/useReminderSync';
import { loadSavedLanguage } from '@/i18n';
import { loadAppearance, type StoredAppearance } from '@/features/appearance/appearanceStorage';
import { useAppearanceSync } from '@/features/appearance/useAppearanceSync';
import { FONT_FILES } from '@/theme/fonts';
import { ThemeProvider, makeStyles, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Warning comes from JS stack (react-navigation), not app code; dev builds only.
LogBox.ignoreLogs(['InteractionManager has been deprecated']);

export default function RootLayout() {
  const [fontsLoaded] = useFonts(FONT_FILES);
  const [langLoaded, setLangLoaded] = useState(false);
  // Read with the fonts, before the splash hides, so the first frame already has the saved look.
  const [stored, setStored] = useState<StoredAppearance | null>(null);

  useEffect(() => {
    loadAppearance().then(setStored);
  }, []);

  useEffect(() => {
    loadSavedLanguage().finally(() => setLangLoaded(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && stored) SplashScreen.hideAsync();
  }, [fontsLoaded, stored]);

  if (!fontsLoaded || !stored) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider initial={stored}>
          <ThemedStatusBar />
          <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
            <AuthProvider>
              <ToastProvider>
                <RootStack ready={langLoaded} />
              </ToastProvider>
            </AuthProvider>
          </PersistQueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStatusBar() {
  return <StatusBar style={useTheme().dark ? 'light' : 'dark'} />;
}

function RootStack({ ready }: { ready: boolean }) {
  const styles = useStyles();
  const { loading, profile } = useAuth();
  const updateRequired = useUpdateRequired();
  useReminderSync();
  useGoogleSyncLifecycle();
  useAppearanceSync();
  if (updateRequired) return <UpdateRequiredScreen {...updateRequired} />;
  if (!ready || loading) return <SplashView />;

  const signedIn = !!profile;
  return (
    <View style={styles.frame}>
      <AppStack signedIn={signedIn} />
    </View>
  );
}

function AppStack({ signedIn }: { signedIn: boolean }) {
  const { colors } = useTheme();
  return (
    // JS stack: swipe from the left edge to go back on both Android and iOS.
    <Stack
      screenOptions={{
        ...TransitionPresets.SlideFromRightIOS,
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyle: { backgroundColor: colors.bg },
      }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)/login" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings/devices" />
        <Stack.Screen name="settings/period" />
        <Stack.Screen name="settings/bug-report" />
        <Stack.Screen name="note/[id]" />
        <Stack.Screen name="note/categories" />
        <Stack.Screen name="note/trash" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
const useStyles = makeStyles(({ colors }) => ({ frame: { flex: 1, backgroundColor: colors.bg } }));
