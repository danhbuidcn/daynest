import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { fitWithin } from '@/lib/bugReport';
import { PHOTO_FADE_DEFAULT } from '@/lib/theme/backgrounds';

// "Ảnh của bạn" lives only on this device (app folder + this key), never on the server.
const KEY = 'daynest.backgroundPhoto';

export type BackgroundPhoto = { uri: string; fade: number };

type Listener = (photo: BackgroundPhoto | null) => void;
const listeners = new Set<Listener>();
let current: BackgroundPhoto | null = null;

function emit(photo: BackgroundPhoto | null) {
  current = photo;
  listeners.forEach((l) => l(photo));
}

export function onPhotoChange(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function exists(uri: string) {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

function remove(uri: string) {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // already gone
  }
}

// A missing file (cleared app data, other device) means "no photo": the background falls back to plain.
export async function loadPhoto(): Promise<BackgroundPhoto | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as Partial<BackgroundPhoto>) : null;
    const ok = p && typeof p.uri === 'string' && exists(p.uri);
    current = ok ? { uri: p.uri as string, fade: typeof p.fade === 'number' ? p.fade : PHOTO_FADE_DEFAULT } : null;
  } catch {
    current = null;
  }
  return current;
}

async function persist(photo: BackgroundPhoto | null) {
  await (photo ? AsyncStorage.setItem(KEY, JSON.stringify(photo)) : AsyncStorage.removeItem(KEY)).catch(() => {});
  emit(photo);
}

// Opens the system picker (no permission needed), shrinks the long side to ≤ 1600 px and keeps a copy in the app folder.
// Returns false when the user cancelled.
export async function pickPhoto(): Promise<boolean> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled || !result.assets[0]) return false;
  const a = result.assets[0];
  const size = fitWithin(a.width, a.height);
  const out = await ImageManipulator.manipulateAsync(a.uri, size ? [{ resize: size }] : [], {
    compress: 0.85,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  // A new name each time, so the image view never shows the old picture from its cache.
  const target = new File(Paths.document, `background-${Date.now()}.jpg`);
  new File(out.uri).copy(target);
  const previous = current;
  await persist({ uri: target.uri, fade: previous?.fade ?? PHOTO_FADE_DEFAULT });
  if (previous) remove(previous.uri);
  return true;
}

export async function setPhotoFade(fade: number) {
  if (current) await persist({ ...current, fade });
}

// Sign-out: the next person must not see this one's picture.
export async function clearPhoto() {
  const previous = current;
  await persist(null);
  if (previous) remove(previous.uri);
}
