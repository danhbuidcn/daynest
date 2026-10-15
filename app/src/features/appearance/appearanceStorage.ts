import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_APPEARANCE, parseAppearance, type Appearance } from '@/lib/theme/appearance';

const KEY = 'daynest.appearance';

// `dirty`: changed on this device and not yet saved to the account (e.g. made offline).
export type StoredAppearance = { appearance: Appearance; dirty: boolean };

export const DEFAULT_STORED: StoredAppearance = { appearance: DEFAULT_APPEARANCE, dirty: false };

export async function loadAppearance(): Promise<StoredAppearance> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_STORED;
    const j = JSON.parse(raw) as { appearance?: unknown; dirty?: unknown };
    return { appearance: parseAppearance(j.appearance), dirty: j.dirty === true };
  } catch {
    return DEFAULT_STORED;
  }
}

export function saveAppearance(stored: StoredAppearance) {
  return AsyncStorage.setItem(KEY, JSON.stringify(stored)).catch(() => {});
}
