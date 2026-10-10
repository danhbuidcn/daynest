import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { setLanguage, type Language } from '@/i18n';
import {
  DEFAULT_SETTINGS,
  supabaseAuthService,
  type AuthService,
  type DeviceRow,
  type Profile,
  type SettingsPatch,
  type UserSettings,
} from './authService';

type AuthState = {
  loading: boolean;
  profile: Profile | null;
  settings: UserSettings;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveLanguage: (lang: Language) => Promise<void>;
  // F6 — applies right away; a failed save puts the old values back and rethrows (caller toasts).
  saveSettings: (patch: SettingsPatch) => Promise<void>;
  // F7 — 2-device limit.
  kickedOut: boolean;
  dismissKickedOut: () => void;
  newDeviceName: string | null;
  dismissNewDeviceName: () => void;
  listDevices: () => Promise<DeviceRow[]>;
  // A write rejected by RLS (Postgres 42501) can mean this device got kicked out (F7) — callers
  // re-check and let this trigger the same "signed out" dialog as the foreground check.
  recheckSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children, service = supabaseAuthService }: { children: ReactNode; service?: AuthService }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [kickedOut, setKickedOut] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState<string | null>(null);
  const signedIn = useRef(false);
  useEffect(() => {
    signedIn.current = !!profile;
  }, [profile]);

  const syncSettings = useCallback(async () => {
    const s = await service.getSettings().catch(() => DEFAULT_SETTINGS);
    if (s.language) await setLanguage(s.language);
    setSettings(s);
  }, [service]);

  // A device kicked out by a 3rd sign-in must stop right away, not wait for the token to expire (F7).
  const forceSignOut = useCallback(async () => {
    await service.signOut().catch(() => {});
    setProfile(null);
    setSettings(DEFAULT_SETTINGS);
    setKickedOut(true);
  }, [service]);

  useEffect(() => {
    (async () => {
      try {
        // Check session_active() before reading any table: every table's RLS now requires it,
        // and checking first (rather than letting a table read fail) lets us tell "kicked out"
        // apart from "never signed in" (F7).
        if (!(await service.hasLocalSession())) {
          setProfile(null);
          return;
        }
        const active = await service.checkSessionActive().catch(() => true);
        if (!active) {
          await forceSignOut();
          return;
        }
        service.touchDevice().catch(() => {});
        const p = await service.getSession();
        setProfile(p);
        if (p) await syncSettings();
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [service, syncSettings, forceSignOut]);

  // Re-check when the app comes back to the foreground (F7): opening the app is the only
  // moment a kicked-out device finds out, since there's no server push.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !signedIn.current) return;
      service
        .checkSessionActive()
        .then((active) => {
          if (active) service.touchDevice().catch(() => {});
          else forceSignOut();
        })
        .catch(() => {});
    });
    return () => sub.remove();
  }, [service, forceSignOut]);

  const signIn = useCallback(async () => {
    const { profile: p, kicked } = await service.signIn();
    await syncSettings();
    setProfile(p);
    setNewDeviceName(kicked?.name ?? null);
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

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  const saveSettings = useCallback(
    async (patch: SettingsPatch) => {
      const previous = settingsRef.current;
      setSettings({ ...previous, ...patch });
      try {
        await service.saveSettings(patch);
      } catch (e) {
        const rollback = Object.fromEntries(Object.keys(patch).map((k) => [k, previous[k as keyof SettingsPatch]]));
        setSettings((s) => ({ ...s, ...rollback }));
        throw e;
      }
    },
    [service],
  );

  const dismissKickedOut = useCallback(() => setKickedOut(false), []);
  const dismissNewDeviceName = useCallback(() => setNewDeviceName(null), []);
  const listDevices = useCallback(() => service.listDevices(), [service]);

  const recheckSession = useCallback(async () => {
    const active = await service.checkSessionActive().catch(() => true);
    if (!active) await forceSignOut();
    else service.touchDevice().catch(() => {});
    return active;
  }, [service, forceSignOut]);

  const value = useMemo(
    () => ({
      loading,
      profile,
      settings,
      signIn,
      signOut,
      saveLanguage,
      saveSettings,
      kickedOut,
      dismissKickedOut,
      newDeviceName,
      dismissNewDeviceName,
      listDevices,
      recheckSession,
    }),
    [
      loading,
      profile,
      settings,
      signIn,
      signOut,
      saveLanguage,
      saveSettings,
      kickedOut,
      dismissKickedOut,
      newDeviceName,
      dismissNewDeviceName,
      listDevices,
      recheckSession,
    ],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
