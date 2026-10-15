import { contrast } from '@/lib/colors';
import type { Appearance } from './appearance';
import { PALETTES, type Palette } from './palettes';

type Rgb = [number, number, number];

function toRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// `amount` of `b` mixed into `a` (0 → a, 1 → b).
export function mix(a: string, b: string, amount: number): string {
  const [x, y] = [toRgb(a), toRgb(b)];
  return toHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * amount) as Rgb);
}

const MIN_CONTRAST = 4.5;

// Link-style text (`primaryDark`) must read on the page: darker on a light set, lighter on a dark one,
// pushed further until it reaches 4.5:1 (or runs out of room).
function readableOn(primary: string, bg: string, dark: boolean): string {
  const toward = dark ? '#FFFFFF' : '#000000';
  let c = mix(primary, toward, 0.2);
  for (let step = 0; step < 20 && contrast(c, bg) < MIN_CONTRAST; step++) c = mix(c, toward, 0.1);
  return c;
}

// The custom set: one primary colour + light/dark. The rest comes from Mint (light) or Dark,
// tinted a little with the primary.
export function buildCustomPalette(primary: string, dark: boolean): Palette {
  const base = dark ? PALETTES.dark : PALETTES.mint;
  const tint = (c: string, amount: number) => mix(c, primary, amount);
  const bg = tint(base.bg, 0.04);
  const text = tint(base.text, 0.06);
  return {
    ...base,
    primary,
    primaryDark: readableOn(primary, bg, dark),
    primarySoft: mix(bg, primary, dark ? 0.25 : 0.15),
    bg,
    surface: dark ? tint(base.surface, 0.04) : base.surface,
    border: tint(base.border, 0.1),
    text,
    textMuted: tint(base.textMuted, 0.08),
    toast: dark ? base.toast : text,
  };
}

// `systemDark`: the phone is in dark mode (only matters for "Theo hệ thống").
export function resolvePalette(a: Pick<Appearance, 'theme' | 'themePrimary' | 'themeDark'>, systemDark: boolean): { palette: Palette; dark: boolean } {
  if (a.theme === 'custom' && a.themePrimary) {
    return { palette: buildCustomPalette(a.themePrimary, a.themeDark), dark: a.themeDark };
  }
  if (a.theme === 'system') return systemDark ? { palette: PALETTES.dark, dark: true } : { palette: PALETTES.mint, dark: false };
  if (a.theme === 'custom') return { palette: PALETTES.mint, dark: false };
  return { palette: PALETTES[a.theme], dark: a.theme === 'dark' };
}
