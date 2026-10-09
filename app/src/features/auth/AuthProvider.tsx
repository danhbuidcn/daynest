import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { mockAuthService, type AuthService, type Profile } from './authService';

type AuthState = {
  loading: boolean;
  profile: Profile | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: AuthService['updateProfile'];
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children, service = mockAuthService }: { children: ReactNode; service?: AuthService }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    service
      .getSession()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [service]);

  const signIn = useCallback(async () => setProfile(await service.signIn()), [service]);
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

  const value = useMemo(
    () => ({ loading, profile, signIn, signOut, updateProfile }),
    [loading, profile, signIn, signOut, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
