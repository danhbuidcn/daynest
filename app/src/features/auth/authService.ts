import { GoogleSignin, isCancelledResponse, isErrorWithCode } from '@react-native-google-signin/google-signin';
import { getNetworkStateAsync } from 'expo-network';

import { isLanguage, type Language } from '@/i18n';
import { DEFAULT_TIME_ZONE } from '@/lib/calendar/timeZone';
import type { WeekStart } from '@/lib/calendar/monthGrid';
import { supabase } from '@/lib/supabase';
import { getDeviceId, getDeviceName } from './device';
import { toProfile, type Profile } from './profile';

export type { Profile } from './profile';

export type UserSettings = {
  language: Language | null;
  weekStart: WeekStart;
  timeZone: string;
  use24h: boolean;
  notificationsEnabled: boolean;
  showLunar: boolean;
  showHolidays: boolean;
  cycleEnabled: boolean;
  cycleLength: number;
  periodLength: number;
  periodReminder: boolean;
  periodReminderDays: number;
  // "HH:MM", 5-minute steps.
  periodReminderTime: string;
  dailyMorning: boolean;
  dailyMorningTime: string;
  dailyEvening: boolean;
  dailyEveningTime: string;
};
export const DEFAULT_SETTINGS: UserSettings = {
  language: null,
  weekStart: 1,
  timeZone: DEFAULT_TIME_ZONE,
  use24h: true,
  notificationsEnabled: true,
  showLunar: true,
  showHolidays: true,
  cycleEnabled: false,
  cycleLength: 28,
  periodLength: 5,
  periodReminder: true,
  periodReminderDays: 2,
  periodReminderTime: '09:00',
  dailyMorning: false,
  dailyMorningTime: '08:00',
  dailyEvening: false,
  dailyEveningTime: '21:00',
};
// Everything F6 lets the Settings screen change; language has its own path (saved on device first).
export type SettingsPatch = Partial<Omit<UserSettings, 'language'>>;

const SETTING_COLUMNS: Record<keyof SettingsPatch, string> = {
  weekStart: 'week_start',
  timeZone: 'time_zone',
  use24h: 'use_24h',
  notificationsEnabled: 'notifications_enabled',
  showLunar: 'show_lunar',
  showHolidays: 'show_holidays',
  cycleEnabled: 'cycle_enabled',
  cycleLength: 'cycle_length',
  periodLength: 'period_length',
  periodReminder: 'period_reminder',
  periodReminderDays: 'period_reminder_days',
  periodReminderTime: 'period_reminder_time',
  dailyMorning: 'daily_morning',
  dailyMorningTime: 'daily_morning_time',
  dailyEvening: 'daily_evening',
  dailyEveningTime: 'daily_evening_time',
};

// F7 — max 2 devices per account; signing in on a 3rd kicks the earliest one out.
export type KickedDevice = { name: string; signedInAt: string };
export type DeviceRow = { deviceId: string; deviceName: string; signedInAt: string; lastSeenAt: string };

export class AuthError extends Error {
  constructor(public kind: 'cancelled' | 'offline' | 'failed', cause?: unknown) {
    super(kind, { cause });
  }
}

export interface AuthService {
  hasLocalSession(): Promise<boolean>;
  getSession(): Promise<Profile | null>;
  signIn(): Promise<{ profile: Profile; kicked: KickedDevice | null }>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  getSettings(): Promise<UserSettings>;
  saveLanguage(lang: Language): Promise<void>;
  saveSettings(patch: SettingsPatch): Promise<void>;
  checkSessionActive(): Promise<boolean>;
  touchDevice(): Promise<void>;
  listDevices(): Promise<DeviceRow[]>;
}

GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });

// Google Play Services returns code '7' (NETWORK_ERROR); Supabase fetch reports "Network request failed".
// supabase-js errors are plain objects (not Error) -> read message + details.
const errorText = (e: unknown) =>
  e && typeof e === 'object' ? `${(e as { message?: unknown }).message ?? ''} ${(e as { details?: unknown }).details ?? ''}` : String(e);
const isNetworkError = (e: unknown) =>
  (isErrorWithCode(e) && e.code === '7') || /network|fetch|internet|timeout/i.test(errorText(e));

const classify = (e: unknown) =>
  e instanceof AuthError ? e : new AuthError(isNetworkError(e) ? 'offline' : 'failed', e);

// Offline requests either hang or fail with a generic error -> check before sending.
async function ensureOnline() {
  const state = await getNetworkStateAsync().catch(() => null);
  if (state && (state.isConnected === false || state.isInternetReachable === false)) throw new AuthError('offline');
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

async function loadProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, avatar_url')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return toProfile(data);
}

// Must run right after signInWithIdToken and before any other table read: every table's RLS
// now requires session_active(), which is false until this device has a user_devices row (F7).
async function registerCurrentDevice(): Promise<KickedDevice | null> {
  const deviceId = await getDeviceId();
  const deviceName = getDeviceName();
  const { data, error } = await supabase.rpc('register_device', { p_device_id: deviceId, p_device_name: deviceName });
  if (error) throw classify(error);
  const row = data?.[0] as { kicked_name: string | null; kicked_signed_in_at: string | null } | undefined;
  return row?.kicked_name ? { name: row.kicked_name, signedInAt: row.kicked_signed_in_at! } : null;
}

export const supabaseAuthService: AuthService = {
  async hasLocalSession() {
    return !!(await currentUserId());
  },

  async getSession() {
    const userId = await currentUserId();
    if (!userId) return null;
    try {
      return await loadProfile(userId);
    } catch {
      return null;
    }
  },

  async signIn() {
    try {
      await ensureOnline();
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isCancelledResponse(response)) throw new AuthError('cancelled');
      const idToken = response.data.idToken;
      if (!idToken) throw new AuthError('failed');
      const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      if (error) throw error;
      const kicked = await registerCurrentDevice();
      const profile = await loadProfile(data.user.id);
      return { profile, kicked };
    } catch (e) {
      throw classify(e);
    }
  },

  async signOut() {
    try {
      await supabase.rpc('unregister_device');
    } catch {
      // Best-effort: the device row may already be gone (e.g. this session was the one kicked).
    }
    await supabase.auth.signOut();
    await GoogleSignin.signOut().catch(() => {});
  },

  // Server first: a failure leaves the account and the Google grant untouched, so the user can retry.
  async deleteAccount() {
    try {
      await ensureOnline();
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
    } catch (e) {
      throw classify(e);
    }
    // The user row is gone, so only clear the local session (no server call) and drop the Google grant.
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    await GoogleSignin.revokeAccess().catch(() => {});
  },

  // Fails open on a network/transient error: only a confirmed `false` signs the device out.
  async checkSessionActive() {
    const { data, error } = await supabase.rpc('session_active');
    if (error) return true;
    return data === true;
  },

  async touchDevice() {
    try {
      await supabase.rpc('touch_device');
    } catch {
      // Best-effort presence ping; failures are harmless.
    }
  },

  async listDevices() {
    const { data, error } = await supabase
      .from('user_devices')
      .select('device_id, device_name, signed_in_at, last_seen_at')
      .order('signed_in_at', { ascending: true });
    if (error) throw classify(error);
    return (data ?? []).map((r) => ({
      deviceId: r.device_id as string,
      deviceName: r.device_name as string,
      signedInAt: r.signed_in_at as string,
      lastSeenAt: r.last_seen_at as string,
    }));
  },

  async getSettings() {
    const userId = await currentUserId();
    if (!userId) return DEFAULT_SETTINGS;
    const { data, error } = await supabase
      .from('user_settings')
      .select('language, week_start, time_zone, use_24h, notifications_enabled, show_lunar, show_holidays, cycle_enabled, cycle_length, period_length, period_reminder, period_reminder_days, period_reminder_time, daily_morning, daily_morning_time, daily_evening, daily_evening_time')
      .eq('user_id', userId)
      .single();
    // No row yet (PGRST116) means defaults; any other error (e.g. offline) must not
    // overwrite the settings saved on the device with defaults.
    if (error && error.code !== 'PGRST116') throw classify(error);
    return {
      language: isLanguage(data?.language) ? data.language : null,
      weekStart: data?.week_start === 0 ? 0 : 1,
      timeZone: data?.time_zone ?? DEFAULT_TIME_ZONE,
      use24h: data?.use_24h ?? true,
      notificationsEnabled: data?.notifications_enabled ?? true,
      showLunar: data?.show_lunar ?? true,
      showHolidays: data?.show_holidays ?? true,
      cycleEnabled: data?.cycle_enabled ?? false,
      cycleLength: data?.cycle_length ?? 28,
      periodLength: data?.period_length ?? 5,
      periodReminder: data?.period_reminder ?? true,
      periodReminderDays: data?.period_reminder_days ?? 2,
      periodReminderTime: String(data?.period_reminder_time ?? '09:00').slice(0, 5),
      dailyMorning: data?.daily_morning ?? false,
      dailyMorningTime: String(data?.daily_morning_time ?? '08:00').slice(0, 5),
      dailyEvening: data?.daily_evening ?? false,
      dailyEveningTime: String(data?.daily_evening_time ?? '21:00').slice(0, 5),
    };
  },

  async saveLanguage(lang) {
    await ensureOnline();
    const userId = await currentUserId();
    if (!userId) return;
    const { error } = await supabase.from('user_settings').update({ language: lang }).eq('user_id', userId);
    if (error) throw classify(error);
  },

  async saveSettings(patch) {
    await ensureOnline();
    const userId = await currentUserId();
    if (!userId) return;
    const row = Object.fromEntries(
      Object.entries(patch).map(([key, value]) => [SETTING_COLUMNS[key as keyof SettingsPatch], value]),
    );
    const { error } = await supabase.from('user_settings').update(row).eq('user_id', userId);
    if (error) throw classify(error);
  },
};
