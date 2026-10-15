import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { saveAppearance, type StoredAppearance } from '@/features/appearance/appearanceStorage';
import { onPhotoChange, type BackgroundPhoto } from '@/features/appearance/photoStore';
import type { Appearance } from '@/lib/theme/appearance';
import { resolvePalette } from '@/lib/theme/resolveTheme';
import { FONT_FAMILIES, type FontFamilies } from './fonts';
import { ON_COLOR, typeSizes } from './tokens';

type TypeStyle = { fontSize: number; lineHeight: number; fontFamily: string };

export type Theme = {
  colors: ReturnType<typeof resolvePalette>['palette'] & { onColor: string };
  fonts: FontFamilies;
  type: Record<keyof typeof typeSizes, TypeStyle>;
  shadow: { shadowColor: string; shadowOpacity: number; shadowRadius: number; shadowOffset: { width: number; height: number }; elevation: number };
  dark: boolean;
  // The user's "Cỡ chữ" (0.9 / 1 / 1.15), already inside `type`.
  fontScale: number;
};

export function buildTheme(a: Appearance, systemDark: boolean): Theme {
  const { palette, dark } = resolvePalette(a, systemDark);
  const fonts = FONT_FAMILIES[a.font];
  const type = Object.fromEntries(
    Object.entries(typeSizes).map(([k, v]) => [
      k,
      { fontSize: v.fontSize * a.fontScale, lineHeight: v.lineHeight * a.fontScale, fontFamily: fonts[v.weight] },
    ]),
  ) as Theme['type'];
  return {
    colors: { ...palette, onColor: ON_COLOR },
    fonts,
    type,
    shadow: {
      shadowColor: dark ? '#000000' : palette.text,
      shadowOpacity: dark ? 0.3 : 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    dark,
    fontScale: a.fontScale,
  };
}

type Store = {
  appearance: Appearance;
  dirty: boolean;
  // The picture of "Ảnh của bạn" (this device only), null when there is none.
  photo: BackgroundPhoto | null;
  // A choice made on this device: shows at once, then is saved to the account (useAppearanceSync).
  setAppearance: (patch: Partial<Appearance>) => void;
  // What the account holds (or the account's copy after a successful save).
  applyRemote: (a: Appearance) => void;
  markSynced: (a: Appearance) => void;
};

const ThemeContext = createContext<Theme | null>(null);
const StoreContext = createContext<Store | null>(null);

export function ThemeProvider({
  initial,
  initialPhoto,
  children,
}: {
  initial: StoredAppearance;
  initialPhoto: BackgroundPhoto | null;
  children: ReactNode;
}) {
  const [state, setState] = useState(initial);
  const [photo, setPhoto] = useState(initialPhoto);
  useEffect(() => onPhotoChange(setPhoto), []);
  const systemDark = useColorScheme() === 'dark';
  const stateRef = useRef(state);

  const commit = useCallback((next: StoredAppearance) => {
    stateRef.current = next;
    setState(next);
    void saveAppearance(next);
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const store = useMemo<Store>(
    () => ({
      appearance: state.appearance,
      dirty: state.dirty,
      photo,
      setAppearance: (patch) => commit({ appearance: { ...stateRef.current.appearance, ...patch }, dirty: true }),
      applyRemote: (a) => commit({ appearance: a, dirty: false }),
      // Only clear the flag if nothing changed while the save was in flight.
      markSynced: (a) => {
        if (JSON.stringify(a) === JSON.stringify(stateRef.current.appearance)) commit({ appearance: a, dirty: false });
      },
    }),
    [state, photo, commit],
  );

  const theme = useMemo(() => buildTheme(state.appearance, systemDark), [state.appearance, systemDark]);

  return (
    <StoreContext.Provider value={store}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </StoreContext.Provider>
  );
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme outside ThemeProvider');
  return t;
}

export function useAppearance(): Store {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useAppearance outside ThemeProvider');
  return s;
}

// Styles that depend on the theme: built once per theme and shared by every component using them.
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(factory: (theme: Theme) => T) {
  const cache = new WeakMap<Theme, T>();
  return function useStyles(): T {
    const theme = useTheme();
    let styles = cache.get(theme);
    if (!styles) {
      styles = StyleSheet.create(factory(theme));
      cache.set(theme, styles);
    }
    return styles;
  };
}
