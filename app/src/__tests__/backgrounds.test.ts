import { describe, expect, it } from '@jest/globals';

import {
  BG_COLORS_DARK,
  BG_COLORS_LIGHT,
  GRADIENT_COUNT,
  PATTERN_COUNT,
  gradientLayers,
  isReadableBackground,
  parseBackground,
  patternSpec,
  solidBackground,
} from '@/lib/theme/backgrounds';
import { contrast } from '@/lib/colors';
import { PALETTES } from '@/lib/theme/palettes';

describe('parseBackground', () => {
  it('reads kind and index', () => {
    expect(parseBackground('gradient-3')).toEqual({ kind: 'gradient', index: 3 });
    expect(parseBackground('pattern-6')).toEqual({ kind: 'pattern', index: 6 });
    expect(parseBackground('color-8')).toEqual({ kind: 'color', index: 8 });
    expect(parseBackground('color')).toEqual({ kind: 'color', index: 0 });
    expect(parseBackground('photo').kind).toBe('photo');
    expect(parseBackground('plain').kind).toBe('plain');
    expect(parseBackground('nonsense').kind).toBe('plain');
  });
});

describe('solidBackground', () => {
  it('uses the light or dark swatch, or the custom colour', () => {
    expect(solidBackground('color-1', false, null)).toBe(BG_COLORS_LIGHT[0]);
    expect(solidBackground('color-2', true, null)).toBe(BG_COLORS_DARK[1]);
    expect(solidBackground('color', false, '#AABBCC')).toBe('#AABBCC');
    expect(solidBackground('gradient-1', false, null)).toBeNull();
  });
});

describe('backgrounds', () => {
  it('every built-in colour keeps the text readable on its set', () => {
    for (const c of BG_COLORS_LIGHT) expect(contrast(PALETTES.mint.text, c)).toBeGreaterThanOrEqual(4.5);
    for (const c of BG_COLORS_DARK) expect(contrast(PALETTES.dark.text, c)).toBeGreaterThanOrEqual(4.5);
  });

  it('refuses a custom colour that makes the text hard to read', () => {
    expect(isReadableBackground('#FFFFFF', PALETTES.mint)).toBe(true);
    expect(isReadableBackground('#2F2D33', PALETTES.mint)).toBe(false);
    expect(isReadableBackground('#FFFFFF', PALETTES.dark)).toBe(false);
  });

  it('draws every gradient and pattern, in every set', () => {
    for (const id of ['mint', 'dark', 'lemon'] as const) {
      for (let i = 1; i <= GRADIENT_COUNT; i++) expect(gradientLayers(i, PALETTES[id]).length).toBeGreaterThan(0);
      for (let i = 1; i <= PATTERN_COUNT; i++) expect(patternSpec(i, PALETTES[id], id === 'dark')).not.toBeNull();
    }
    expect(gradientLayers(0, PALETTES.mint)).toEqual([]);
    expect(patternSpec(9, PALETTES.mint, false)).toBeNull();
  });
});
