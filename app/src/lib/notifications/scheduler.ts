import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// F3 — thin wrapper over expo-notifications so the rest of the app never touches it directly.
export const REMINDER_CHANNEL_ID = 'event-reminders';

export type ReminderNotification = { at: Date; title: string; body: string; data: Record<string, string> };

export type PermissionState = 'granted' | 'denied' | 'undetermined';

// Foreground: still show the banner — a reminder that only appears when the app is closed would be missed.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureChannel(name: string) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name,
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function getPermission(): Promise<PermissionState> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionState;
}

// Asks only when the OS still allows asking; afterwards only the system settings can change it.
export async function requestPermission(): Promise<PermissionState> {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted' || !current.canAskAgain) return current.status as PermissionState;
  const { status } = await Notifications.requestPermissionsAsync();
  return status as PermissionState;
}

export async function cancelAll() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAll(items: ReminderNotification[]) {
  for (const item of items) {
    await Notifications.scheduleNotificationAsync({
      content: { title: item.title, body: item.body, data: item.data, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.at, channelId: REMINDER_CHANNEL_ID },
    });
  }
}

export function onNotificationTap(handler: (data: Record<string, unknown>) => void) {
  const sub = Notifications.addNotificationResponseReceivedListener((r) => handler(r.notification.request.content.data ?? {}));
  return () => sub.remove();
}

// The tap that cold-started the app (the listener above is not attached yet at that point).
export async function launchTapData(): Promise<Record<string, unknown> | null> {
  const r = await Notifications.getLastNotificationResponseAsync();
  if (!r) return null;
  await Notifications.clearLastNotificationResponseAsync();
  return r.notification.request.content.data ?? null;
}
