import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setLanguage, type Language } from '@/i18n';
import { supabaseAuthService, type AuthService, type Profile } from './authService';

type AuthState = {
  loading: boolean;
  profile: Profile | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: AuthService['updateProfile'];
  saveLanguage: (lang: Language) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children, service = supabaseAuthService }: { children: ReactNode; service?: AuthService }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Ngôn ngữ trên DB (nếu có) → áp dụng + ghi về máy.
  const syncLanguage = useCallback(async () => {
    const lang = await service.getLanguage().catch(() => null);
    if (lang) await setLanguage(lang);
  }, [service]);

  useEffect(() => {
    service
      .getSession()
      .then(async (p) => {
        setProfile(p);
        if (p) await syncLanguage();
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [service, syncLanguage]);

  const signIn = useCallback(async () => {
    const p = await service.signIn();
    await syncLanguage();
    setProfile(p);
  }, [service, syncLanguage]);
  const signOut = useCallback(async () => {
    await service.signOut();
    setProfile(null);
  }, [service]);
  const updateProfile = useCallback<AuthService['updateProfile']>(
    async (patch) => {
      const next = await service.updateProfile(patch);
      setProfile(next);
      return next;
    },
    [service],
  );

  const saveLanguage = useCallback(
    async (lang: Language) => {
      await setLanguage(lang);
      await service.saveLanguage(lang);
    },
    [service],
  );

  const value = useMemo(
    () => ({ loading, profile, signIn, signOut, updateProfile, saveLanguage }),
    [loading, profile, signIn, signOut, updateProfile, saveLanguage],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
