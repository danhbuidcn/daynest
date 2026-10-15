import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;

    const sync = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const { data: auth } = await supabase.auth.getSession();
        const userId = auth.session?.user.id;
        if (!userId) return;
        if (dirty) {
          const { error } = await supabase.from('user_settings').update(toRow(appearance)).eq('user_id', userId);
          if (!error && !cancelled) markSynced(appearance);
        } else {
          const { data, error } = await supabase.from('user_settings').select(COLUMNS).eq('user_id', userId).single();
          if (!error && data && !cancelled) {
            const remote = fromRow(data);
            if (JSON.stringify(remote) !== JSON.stringify(appearance)) applyRemote(remote);
          }
        }
      } catch {
        // offline: try again on the next change or when the app returns
      } finally {
        busy.current = false;
      }
    };

    void sync();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && void sync());
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [signedIn, appearance, dirty, applyRemote, markSynced]);
}
