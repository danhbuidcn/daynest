import { contrast } from '@/lib/colors';
import { eventColors } from '@/theme/tokens';
import type { Palette } from './palettes';
import { mix } from './resolveTheme';

// Screen backgrounds (spec S6 § Nền). Everything is drawn from the palette and the event
// colours, so each set gets its own look; nothing is copied from another app.

export const BG_COLORS_LIGHT = ['#FDF6E3', '#FCE8EF', '#E6F2FB', '#E9F6EF', '#F1ECFB', '#FFF0E0', '#FFF8D6', '#EFEFEC'] as const;
export const BG_COLORS_DARK = ['#24201A', '#2A1F24', '#1B2430', '#1C2A24', '#231F2E', '#2B2219', '#2A2716', '#222225'] as const;

export const GRADIENT_COUNT = 8;
export const PATTERN_COUNT = 6;
export const PHOTO_FADE_DEFAULT = 40;
export const PHOTO_FADE_MAX = 80;

export type BackgroundKind = 'plain' | 'color' | 'gradient' | 'pattern' | 'photo';

// 'color-3' → { kind: 'color', index: 3 }; 'plain', 'color' (custom), 'photo' have no index.
export function parseBackground(value: string): { kind: BackgroundKind; index: number } {
  const m = /^(color|gradient|pattern)-(\d)$/.exec(value);
  if (m) return { kind: m[1] as BackgroundKind, index: Number(m[2]) };
  if (value === 'color' || value === 'photo') return { kind: value, index: 0 };
  return { kind: 'plain', index: 0 };
}

// Fixed colour of a "Màu" background, or null when it needs the user's own colour.
export function solidBackground(value: string, dark: boolean, custom: string | null): string | null {
  const { kind, index } = parseBackground(value);
  if (kind !== 'color') return null;
  if (index === 0) return custom;
  return (dark ? BG_COLORS_DARK : BG_COLORS_LIGHT)[index - 1] ?? null;
}

// "Màu khác" must keep the text readable: refuse a colour that drops `text` under 4.5:1.
export function isReadableBackground(color: string, palette: Pick<Palette, 'text'>): boolean {
  return contrast(palette.text, color) >= 4.5;
}

export type Stop = { offset: number; color: string; opacity: number };
export type GradientLayer =
  | { type: 'linear'; x1: number; y1: number; x2: number; y2: number; stops: Stop[] }
  | { type: 'radial'; cx: number; cy: number; r: number; stops: Stop[] };

const stop = (offset: number, color: string, opacity = 1): Stop => ({ offset, color, opacity });
// The colour of an event hue seen through `percent` over the page: same as the mockup's color-mix.
const tint = (p: Palette, hue: keyof typeof eventColors, percent: number) => mix(p.bg, eventColors[hue], percent / 100);

// Angles are CSS-like: 180 = top → bottom, 160 / 135 lean towards the bottom right.
function linear(angle: number, stops: Stop[]): GradientLayer {
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  return { type: 'linear', x1: 0.5 - dx / 2, y1: 0.5 - dy / 2, x2: 0.5 + dx / 2, y2: 0.5 + dy / 2, stops };
}

export function gradientLayers(index: number, p: Palette): GradientLayer[] {
  switch (index) {
    case 1:
      return [linear(180, [stop(0, p.primarySoft), stop(0.6, p.bg)])];
    case 2:
      return [linear(160, [stop(0, tint(p, 'pink', 35)), stop(0.55, p.bg), stop(1, tint(p, 'sky', 30))])];
    case 3:
      return [
        { type: 'radial', cx: 0.15, cy: 0.08, r: 0.6, stops: [stop(0, tint(p, 'lemon', 55)), stop(0.75, tint(p, 'lemon', 55), 0)] },
        { type: 'radial', cx: 0.95, cy: 0.95, r: 0.7, stops: [stop(0, tint(p, 'lavender', 45)), stop(0.7, tint(p, 'lavender', 45), 0)] },
      ];
    case 4:
      return [linear(180, [stop(0, tint(p, 'sky', 40)), stop(0.7, p.bg)])];
    case 5:
      return [linear(135, [stop(0, tint(p, 'peach', 35)), stop(1, tint(p, 'pink', 25))])];
    case 6:
      return [linear(180, [stop(0, tint(p, 'lavender', 35)), stop(1, tint(p, 'mint', 25))])];
    case 7:
      return [linear(180, [stop(0, tint(p, 'mint', 35)), stop(1, tint(p, 'sky', 30))])];
    case 8:
      return [
        { type: 'radial', cx: 0.5, cy: 0, r: 0.7, stops: [stop(0, tint(p, 'peach', 45)), stop(0.8, tint(p, 'peach', 45), 0)] },
        { type: 'radial', cx: 0.5, cy: 1, r: 0.7, stops: [stop(0, tint(p, 'lavender', 40)), stop(0.8, tint(p, 'lavender', 40), 0)] },
      ];
    default:
      return [];
  }
}

export type PatternSpec = {
  size: number;
  // SVG path drawn in a `size` × `size` tile (stroke or fill), with its colour and opacity.
  shapes: { d: string; color: string; opacity: number; fill?: boolean; strokeWidth?: number }[];
};

const STAR = 'M14 6l2 5h5l-4 3 1.6 5L14 16l-4.6 3L11 14l-4-3h5z';
const HEART = 'M14 20s-6-3.6-6-8a3.4 3.4 0 0 1 6-2 3.4 3.4 0 0 1 6 2c0 4.4-6 8-6 8z';

// Faint on purpose; the dark sets are fainter still so text stays readable.
export function patternSpec(index: number, p: Palette, dark: boolean): PatternSpec | null {
  const k = dark ? 0.5 : 1;
  switch (index) {
    case 1:
      return { size: 16, shapes: [{ d: 'M8 8m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0', color: p.primary, opacity: 0.3 * k, fill: true }] };
    case 2:
      return { size: 18, shapes: [{ d: 'M0 0H18M0 0V18', color: p.primary, opacity: 0.16 * k, strokeWidth: 1 }] };
    case 3:
      return { size: 24, shapes: [{ d: 'M0 23.5H24', color: p.primary, opacity: 0.22 * k, strokeWidth: 1 }] };
    case 4:
      return { size: 20, shapes: [{ d: 'M-5 5L5 -5M-5 25L25 -5M15 25L25 15', color: p.primary, opacity: 0.12 * k, strokeWidth: 6 }] };
    case 5:
      return { size: 40, shapes: [{ d: STAR, color: eventColors.lemon, opacity: dark ? 0.2 : 0.55, fill: true }] };
    case 6:
      return { size: 40, shapes: [{ d: HEART, color: eventColors.pink, opacity: dark ? 0.2 : 0.55, fill: true }] };
    default:
      return null;
  }
}

