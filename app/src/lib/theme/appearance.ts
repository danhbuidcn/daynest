import { THEME_IDS } from './palettes';

export const FONT_IDS = ['nunito', 'be-vietnam-pro', 'quicksand', 'baloo-2', 'itim', 'patrick-hand'] as const;
export type FontId = (typeof FONT_IDS)[number];
export const FONT_SCALES = [0.9, 1, 1.15] as const;

export type ThemeChoice = (typeof THEME_IDS)[number] | 'system' | 'custom';

// Mirrors the user_settings columns (db.md § Giao diện).
export type Appearance = {
  theme: ThemeChoice;
  themePrimary: string | null;
  themeDark: boolean;
  background: string;
  backgroundColor: string | null;
  font: FontId;
  fontScale: number;
};

export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'mint',
  themePrimary: null,
  themeDark: false,
  background: 'plain',
  backgroundColor: null,
  font: 'nunito',
  fontScale: 1,
};

const HEX = /^#[0-9A-F]{6}$/;

// Anything unexpected (old copy, hand-edited storage) falls back field by field.
export function parseAppearance(raw: unknown): Appearance {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_APPEARANCE;
  const hex = (v: unknown) => (typeof v === 'string' && HEX.test(v) ? v : null);
  return {
    theme: [...THEME_IDS, 'system', 'custom'].includes(r.theme as string) ? (r.theme as ThemeChoice) : d.theme,
    themePrimary: hex(r.themePrimary),
    themeDark: r.themeDark === true,
    background: typeof r.background === 'string' && /^(plain|color|photo|color-[1-8]|gradient-[1-8]|pattern-[1-6])$/.test(r.background) ? r.background : d.background,
    backgroundColor: hex(r.backgroundColor),
    font: (FONT_IDS as readonly unknown[]).includes(r.font) ? (r.font as FontId) : d.font,
    fontScale: (FONT_SCALES as readonly unknown[]).includes(r.fontScale) ? (r.fontScale as number) : d.fontScale,
  };
}
