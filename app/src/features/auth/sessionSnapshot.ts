import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Profile, UserSettings } from './authService';

const KEY = 'daynest.session';

export type SessionSnapshot = { profile: Profile; settings: UserSettings };

// The last profile + settings read from the server, so opening the app can draw the
// screens (and the cached events) right away instead of waiting for 3 requests.
export async function loadSnapshot(): Promise<SessionSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionSnapshot) : null;
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshot: SessionSnapshot) {
  return AsyncStorage.setItem(KEY, JSON.stringify(snapshot)).catch(() => {});
}

export function clearSnapshot() {
  return AsyncStorage.removeItem(KEY).catch(() => {});
}
