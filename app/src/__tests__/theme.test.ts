import { describe, expect, it } from '@jest/globals';

import { contrast } from '@/lib/colors';
import { DEFAULT_APPEARANCE, parseAppearance } from '@/lib/theme/appearance';
import { PALETTES, THEME_IDS } from '@/lib/theme/palettes';
import { buildCustomPalette, resolvePalette } from '@/lib/theme/resolveTheme';

describe('built-in palettes', () => {
  it.each(THEME_IDS)('%s: text reads on bg and surface (≥ 4.5:1)', (id) => {
    const p = PALETTES[id];
    expect(contrast(p.text, p.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.text, p.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(p.textMuted, p.bg)).toBeGreaterThanOrEqual(3);
  });
});

describe('custom palette', () => {
  it.each(['#FF7A59', '#FFFF00', '#FFFFFF', '#000000', '#0A0A3C', '#7FD1B0'])('%s: link text readable in light and dark', (c) => {
    const light = buildCustomPalette(c, false);
    const dark = buildCustomPalette(c, true);
    expect(contrast(light.text, light.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(dark.text, dark.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(light.primaryDark, light.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(dark.primaryDark, dark.bg)).toBeGreaterThanOrEqual(4.5);
    expect(light.primary).toBe(c);
  });
});

describe('resolvePalette', () => {
  const a = { theme: 'mint' as const, themePrimary: null, themeDark: false };
  it('follows the phone for "system"', () => {
    expect(resolvePalette({ ...a, theme: 'system' }, true).dark).toBe(true);
    expect(resolvePalette({ ...a, theme: 'system' }, false).palette).toBe(PALETTES.mint);
  });
  it('custom without a colour falls back to mint', () => {
    expect(resolvePalette({ ...a, theme: 'custom' }, false).palette).toBe(PALETTES.mint);
  });
});

describe('parseAppearance', () => {
  it('keeps valid values and replaces bad ones field by field', () => {
    expect(parseAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    const p = parseAppearance({ theme: 'dark', font: 'itim', fontScale: 2, themePrimary: 'red', background: 'gradient-3' });
    expect(p).toMatchObject({ theme: 'dark', font: 'itim', fontScale: 1, themePrimary: null, background: 'gradient-3' });
  });
});
