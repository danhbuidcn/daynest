import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { configureReminders, resyncReminders } from './reminderSync';

// Mounted once at the root: resyncs on sign-in/out, on settings that change what gets scheduled,
// and whenever the app returns to the foreground (F3).
export function useReminderSync() {
  const { profile, settings } = useAuth();
  const { t, i18n } = useTranslation();
  const signedIn = !!profile;

  useEffect(() => {
    configureReminders({ signedIn, enabled: settings.notificationsEnabled, timeZone: settings.timeZone, use24h: settings.use24h, t });
    void resyncReminders();
  }, [signedIn, settings.notificationsEnabled, settings.timeZone, settings.use24h, t, i18n.language]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void resyncReminders();
    });
    return () => sub.remove();
  }, []);
}
