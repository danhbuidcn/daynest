import { GoogleSignin, isCancelledResponse, isErrorWithCode } from '@react-native-google-signin/google-signin';
import { File } from 'expo-file-system';
import { getNetworkStateAsync } from 'expo-network';

import { isLanguage, type Language } from '@/i18n';
import { supabase } from '@/lib/supabase';
import { avatarPath, isLocalUri, toProfile, withVersion, type Profile } from './profile';

export type { Profile } from './profile';

/** Lỗi đã phân loại để màn hình chọn thông báo. `cancelled` → không báo gì. */
export class AuthError extends Error {
  constructor(public kind: 'cancelled' | 'offline' | 'failed', cause?: unknown) {
    super(kind, { cause });
  }
}

export interface AuthService {
  getSession(): Promise<Profile | null>;
  signIn(): Promise<Profile>;
  signOut(): Promise<void>;
  updateProfile(patch: { displayName: string; avatarUrl: string | null }): Promise<Profile>;
  getLanguage(): Promise<Language | null>;
  saveLanguage(lang: Language): Promise<void>;
}

GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });

// Google Play Services trả mã '7' (NETWORK_ERROR); fetch của Supabase báo "Network request failed".
// Lỗi của supabase-js là object thường (không phải Error) → đọc message + details.
const errorText = (e: unknown) =>
  e && typeof e === 'object' ? `${(e as { message?: unknown }).message ?? ''} ${(e as { details?: unknown }).details ?? ''}` : String(e);
const isNetworkError = (e: unknown) =>
  (isErrorWithCode(e) && e.code === '7') || /network|fetch|internet|timeout/i.test(errorText(e));

const classify = (e: unknown) =>
  e instanceof AuthError ? e : new AuthError(isNetworkError(e) ? 'offline' : 'failed', e);

/** Mất mạng thì request lúc treo, lúc báo lỗi chung → kiểm tra trước khi gửi. */
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

async function uploadAvatar(userId: string, localUri: string) {
  const body = await new File(localUri).arrayBuffer();
  const path = avatarPath(userId);
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, body, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return withVersion(data.publicUrl, Date.now());
}

/** Google (native) → idToken → Supabase. Profile + user_settings do trigger DB tạo lần đầu. */
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

  async updateProfile({ displayName, avatarUrl }) {
    try {
      await ensureOnline();
      const userId = await currentUserId();
      if (!userId) throw new AuthError('failed');
      const url = isLocalUri(avatarUrl) ? await uploadAvatar(userId, avatarUrl) : avatarUrl;
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName, avatar_url: url })
        .eq('id', userId);
      if (error) throw error;
      return await loadProfile(userId);
    } catch (e) {
      throw classify(e);
    }
  },

  async getLanguage() {
    const userId = await currentUserId();
    if (!userId) return null;
    const { data } = await supabase.from('user_settings').select('language').eq('user_id', userId).single();
    return isLanguage(data?.language) ? data.language : null;
  },

  async saveLanguage(lang) {
    await ensureOnline();
    const userId = await currentUserId();
    if (!userId) return;
    const { error } = await supabase.from('user_settings').update({ language: lang }).eq('user_id', userId);
    if (error) throw classify(error);
  },
};
