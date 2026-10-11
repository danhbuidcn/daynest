import * as Application from 'expo-application';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { supabase } from '@/lib/supabase';

export type UpdateInfo = { updateUrl: string | null };

// Fails open: no network or an unreadable row never locks the app.
async function fetchUpdateInfo(): Promise<UpdateInfo | null> {
  const { data, error } = await supabase.from('app_config').select('min_version_code, update_url').maybeSingle();
  if (error || !data) return null;
  const current = Number(Application.nativeBuildVersion);
  if (!Number.isFinite(current) || current >= data.min_version_code) return null;
  return { updateUrl: data.update_url };
}

export function useUpdateRequired(): UpdateInfo | null {
  const [info, setInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const check = () => fetchUpdateInfo().then(setInfo, () => {});
    check();
    const sub = AppState.addEventListener('change', (state) => state === 'active' && check());
    return () => sub.remove();
  }, []);

  return info;
}
