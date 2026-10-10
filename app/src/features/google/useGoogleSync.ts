import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { EVENTS_KEY } from '@/features/events/useEvents';
import { resyncReminders } from '@/features/reminders/reminderSync';
import { configureGoogleSync, getStatus, subscribe, syncIfStale } from './sync';

export function useGoogleSync() {
  return useSyncExternalStore(subscribe, getStatus);
}

// Mounted once at the root: loads the sync state on sign-in and pulls on foreground (F4).
// Every pull or push refreshes the calendar and re-plans reminders (F3).
export function useGoogleSyncLifecycle() {
  const { profile, settings } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const signedIn = !!profile;

  useEffect(() => {
    configureGoogleSync({
      signedIn,
      timeZone: settings.timeZone,
      fallbackTitle: t('google.noTitle'),
      onChanged: () => {
        void queryClient.invalidateQueries({ queryKey: [EVENTS_KEY] });
        void resyncReminders();
      },
    });
  }, [signedIn, settings.timeZone, t, queryClient]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncIfStale();
    });
    return () => sub.remove();
  }, []);
}
