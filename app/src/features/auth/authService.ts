import { GoogleSignin, isCancelledResponse, isErrorWithCode } from '@react-native-google-signin/google-signin';
import { getNetworkStateAsync } from 'expo-network';

import { isLanguage, type Language } from '@/i18n';
import type { WeekStart } from '@/lib/calendar/monthGrid';
import { supabase } from '@/lib/supabase';
import { toProfile, type Profile } from './profile';

export type { Profile } from './profile';

export type UserSettings = { language: Language | null; weekStart: WeekStart };
export const DEFAULT_SETTINGS: UserSettings = { language: null, weekStart: 1 };

export class AuthError extends Error {
  constructor(public kind: 'cancelled' | 'offline' | 'failed', cause?: unknown) {
    super(kind, { cause });
  }
}

export interface AuthService {
  getSession(): Promise<Profile | null>;
  signIn(): Promise<Profile>;
  signOut(): Promise<void>;
  getSettings(): Promise<UserSettings>;
  saveLanguage(lang: Language): Promise<void>;
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

export const supabaseAuthService: AuthService = {
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
      return await loadProfile(data.user.id);
    } catch (e) {
      throw classify(e);
    }
  },

  async signOut() {
    await supabase.auth.signOut();
    await GoogleSignin.signOut().catch(() => {});
  },

  async getSettings() {
    const userId = await currentUserId();
    if (!userId) return DEFAULT_SETTINGS;
    const { data } = await supabase.from('user_settings').select('language, week_start').eq('user_id', userId).single();
    return {
      language: isLanguage(data?.language) ? data.language : null,
      weekStart: data?.week_start === 0 ? 0 : 1,
    };
  },

  async saveLanguage(lang) {
    await ensureOnline();
    const userId = await currentUserId();
    if (!userId) return;
    const { error } = await supabase.from('user_settings').update({ language: lang }).eq('user_id', userId);
    if (error) throw classify(error);
  },
};
