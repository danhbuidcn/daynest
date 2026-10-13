import { colors, eventColors } from '@/theme';

// S4 § Màu bất kỳ: one of the 6 named colours, or any colour as upper-case `#RRGGBB` (DB check).
export type NamedColor = keyof typeof eventColors;
export type AppColor = NamedColor | `#${string}`;

export const NAMED_COLORS: readonly NamedColor[] = ['mint', 'sky', 'lavender', 'pink', 'peach', 'lemon'];

const HEX = /^#[0-9A-F]{6}$/;

export function isNamedColor(c: string): c is NamedColor {
  return (NAMED_COLORS as readonly string[]).includes(c);
}

export function isValidHex(c: string): boolean {
  return HEX.test(c);
}

export function isAppColor(c: string): c is AppColor {
  return isNamedColor(c) || isValidHex(c);
}

// Anything unexpected falls back to mint so a bad row never breaks a screen.
export function toHex(c: AppColor | string): string {
  if (isNamedColor(c)) return eventColors[c];
  return isValidHex(c) ? c : eventColors.mint;
}

// What the user typed in the hex box → `#RRGGBB`, or null while it isn't a full colour yet.
export function parseHex(input: string): `#${string}` | null {
  const v = '#' + input.trim().replace(/^#/, '').toUpperCase();
  return isValidHex(v) ? (v as `#${string}`) : null;
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Text on a coloured background: dark `text` or white, whichever reads better (≥ 4.5:1 when possible).
export function textOn(c: AppColor | string): string {
  const bg = toHex(c);
  return contrast(bg, colors.text) >= contrast(bg, colors.white) ? colors.text : colors.white;
}

// Squared RGB distance — enough to pick the nearest of a small fixed palette.
export function distance(a: string, b: string): number {
  const [x, y] = [channels(a), channels(b)];
  return x.reduce((sum, v, i) => sum + (v - y[i]) ** 2, 0);
}

export type Hsv = { h: number; s: number; v: number }; // h 0–360, s and v 0–1

export function hsvToHex({ h, s, v }: Hsv): `#${string}` {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))));
  };
  return ('#' + [f(5), f(3), f(1)].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()) as `#${string}`;
}

export function hexToHsv(hex: string): Hsv {
  const [r, g, b] = channels(hex).map((x) => x / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max };
}
