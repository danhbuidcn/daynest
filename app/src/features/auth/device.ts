import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';

const DEVICE_ID_KEY = 'daynest.deviceId';

// Generated once per install; reinstalling the app counts as a new device (F7).
export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export function getDeviceName(): string {
  return Device.modelName ?? 'Unknown device';
}
