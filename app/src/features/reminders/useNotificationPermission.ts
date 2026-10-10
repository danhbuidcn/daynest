import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { getPermission, requestPermission, type PermissionState } from '@/lib/notifications/scheduler';
import { resyncReminders } from './reminderSync';

// OS permission as the Settings screen shows it; re-read on return from the system settings.
export function useNotificationPermission() {
  const [status, setStatus] = useState<PermissionState | null>(null);

  const refresh = useCallback(() => {
    getPermission()
      .then(setStatus)
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const request = useCallback(async () => {
    const next = await requestPermission().catch(() => 'denied' as const);
    setStatus(next);
    if (next === 'granted') await resyncReminders();
    return next;
  }, []);

  return { status, request };
}
