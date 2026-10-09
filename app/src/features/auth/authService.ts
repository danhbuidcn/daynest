import AsyncStorage from '@react-native-async-storage/async-storage';

export type Profile = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

/** Giao diện dùng chung. Bước 3 thay mockAuthService bằng bản Supabase + Google. */
export interface AuthService {
  getSession(): Promise<Profile | null>;
  signIn(): Promise<Profile>;
  signOut(): Promise<void>;
  updateProfile(patch: { displayName: string; avatarUrl: string | null }): Promise<Profile>;
}

const STORAGE_KEY = 'daynest.mockSession';

const MOCK_PROFILE: Profile = {
  id: 'mock-user',
  displayName: 'Nguyễn An',
  email: 'an.nguyen@gmail.com',
  avatarUrl: null,
};

/** Đăng nhập giả: lưu profile trên máy (AsyncStorage). */
export const mockAuthService: AuthService = {
  async getSession() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  },
  async signIn() {
    const existing = await this.getSession();
    const profile = existing ?? MOCK_PROFILE;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  },
  async signOut() {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
  async updateProfile(patch) {
    const current = await this.getSession();
    if (!current) throw new Error('Not signed in');
    const next = { ...current, ...patch };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },
};
