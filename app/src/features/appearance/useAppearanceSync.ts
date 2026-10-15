import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { parseAppearance, type Appearance } from '@/lib/theme/appearance';
import { supabase } from '@/lib/supabase';
import { useAppearance } from '@/theme';

const COLUMNS = 'theme, theme_primary, theme_dark, background, background_color, font, font_scale';

function fromRow(r: Record<string, unknown>): Appearance {
  return parseAppearance({
    theme: r.theme,
    themePrimary: r.theme_primary,
    themeDark: r.theme_dark,
    background: r.background,
    backgroundColor: r.background_color,
    font: r.font,
    fontScale: r.font_scale,
  });
}

function toRow(a: Appearance) {
  return {
    theme: a.theme,
    theme_primary: a.themePrimary,
    theme_dark: a.themeDark,
    background: a.background,
    background_color: a.backgroundColor,
    font: a.font,
    font_scale: a.fontScale,
  };
}

// Keeps the device and the account in step. A change made here is saved to the account (and
// retried later if it failed, e.g. offline); otherwise the account's copy is applied, so a
// second phone shows the same look. Failures are silent: the look still works from the device copy.
export function useAppearanceSync() {
  const { profile } = useAuth();
  const { appearance, dirty, applyRemote, markSynced } = useAppearance();
  const signedIn = !!profile;
  const busy = useRef(false);
  // A change that arrives while a save is in flight must be saved right after it, not dropped.
  const again = useRef(false);
  const latest = useRef({ appearance, dirty });
  useEffect(() => {
    latest.current = { appearance, dirty };
  }, [appearance, dirty]);

  const syncOnce = useCallback(async () => {
    try {
      const { data: auth } = await supabase.auth.getSession();
      const userId = auth.session?.user.id;
      if (!userId) return;
      const { appearance: current, dirty: isDirty } = latest.current;
      if (isDirty) {
        const { error } = await supabase.from('user_settings').update(toRow(current)).eq('user_id', userId);
        if (!error) markSynced(current);
      } else {
        const { data, error } = await supabase.from('user_settings').select(COLUMNS).eq('user_id', userId).single();
        if (!error && data) {
          const remote = fromRow(data);
          if (JSON.stringify(remote) !== JSON.stringify(current)) applyRemote(remote);
        }
      }
    } catch {
      // offline: try again on the next change or when the app returns
    }
  }, [applyRemote, markSynced]);

  const sync = useCallback(async () => {
    if (busy.current) {
      again.current = true;
      return;
    }
    busy.current = true;
    try {
      do {
        again.current = false;
        await syncOnce();
      } while (again.current);
    } finally {
      busy.current = false;
    }
  }, [syncOnce]);

  useEffect(() => {
    if (!signedIn) return;
    void sync();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && void sync());
    return () => sub.remove();
  }, [signedIn, appearance, dirty, sync]);
}
