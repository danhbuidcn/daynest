import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { setLanguage, type Language } from '@/i18n';
import { DEFAULT_SETTINGS, supabaseAuthService, type AuthService, type Profile, type UserSettings } from './authService';

type AuthState = {
  loading: boolean;
  profile: Profile | null;
  settings: UserSettings;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveLanguage: (lang: Language) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children, service = supabaseAuthService }: { children: ReactNode; service?: AuthService }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const syncSettings = useCallback(async () => {
    const s = await service.getSettings().catch(() => DEFAULT_SETTINGS);
    if (s.language) await setLanguage(s.language);
    setSettings(s);
  }, [service]);

  useEffect(() => {
    service
      .getSession()
      .then(async (p) => {
        setProfile(p);
        if (p) await syncSettings();
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [service, syncSettings]);

  const signIn = useCallback(async () => {
    const p = await service.signIn();
    await syncSettings();
    setProfile(p);
  }, [service, syncSettings]);
  const signOut = useCallback(async () => {
    await service.signOut();
    setProfile(null);
    setSettings(DEFAULT_SETTINGS);
  }, [service]);

  const saveLanguage = useCallback(
    async (lang: Language) => {
      await setLanguage(lang);
      await service.saveLanguage(lang);
    },
    [service],
  );

  const value = useMemo(
    () => ({ loading, profile, settings, signIn, signOut, saveLanguage }),
    [loading, profile, settings, signIn, signOut, saveLanguage],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
