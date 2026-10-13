import { describe, expect, it } from '@jest/globals';

import { contrast, hexToHsv, hsvToHex, isAppColor, isValidHex, parseHex, textOn, toHex } from '@/lib/colors';
import { keepLocalColor, toGoogleColorId } from '@/lib/google/mapping';
import { colors, eventColors } from '@/theme';

describe('colour values', () => {
  it('accepts the 6 names and upper-case #RRGGBB only (same rule as the DB check)', () => {
    expect(isAppColor('mint')).toBe(true);
    expect(isAppColor('#C2582F')).toBe(true);
    expect(isAppColor('#c2582f')).toBe(false);
    expect(isAppColor('#ABC')).toBe(false);
    expect(isAppColor('red')).toBe(false);
    expect(isValidHex('#00FF0G')).toBe(false);
  });

  it('toHex maps names to the theme and falls back to mint for a bad value', () => {
    expect(toHex('sky')).toBe(eventColors.sky);
    expect(toHex('#2F6FC2')).toBe('#2F6FC2');
    expect(toHex('nope')).toBe(eventColors.mint);
  });

  it('parseHex reads what the user typed', () => {
    expect(parseHex('c2582f')).toBe('#C2582F');
    expect(parseHex(' #2f6fc2 ')).toBe('#2F6FC2');
    expect(parseHex('C258')).toBeNull();
    expect(parseHex('ZZZZZZ')).toBeNull();
  });
});

describe('textOn', () => {
  it('keeps dark text on the 6 light named colours', () => {
    for (const c of ['mint', 'sky', 'lavender', 'pink', 'peach', 'lemon'] as const) expect(textOn(c)).toBe(colors.text);
  });

  it('switches to white on a dark colour', () => {
    expect(textOn('#C2582F')).toBe(colors.white);
    expect(textOn('#2F6FC2')).toBe(colors.white);
    expect(textOn('#000000')).toBe(colors.white);
  });

  it('picks the colour with more contrast', () => {
    for (const bg of ['#FFFFFF', '#FFEB3B', '#808080', '#1B5E20', '#D50000']) {
      const fg = textOn(bg);
      const other = fg === colors.text ? colors.white : colors.text;
      expect(contrast(bg, fg)).toBeGreaterThanOrEqual(contrast(bg, other));
    }
  });

  it('contrast of black on white is 21:1', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });
});

describe('HSV', () => {
  it('round-trips hex → hsv → hex', () => {
    for (const hex of ['#C2582F', '#2F6FC2', '#7FD1B0', '#000000', '#FFFFFF', '#FF0000', '#808080']) {
      expect(hsvToHex(hexToHsv(hex))).toBe(hex);
    }
  });

  it('reads primary hues', () => {
    expect(hexToHsv('#00FF00')).toEqual({ h: 120, s: 1, v: 1 });
    expect(hsvToHex({ h: 240, s: 1, v: 1 })).toBe('#0000FF');
    expect(hsvToHex({ h: 0, s: 0, v: 0 })).toBe('#000000');
  });
});

describe('Google colours', () => {
  it('keeps the old ids for the 6 names', () => {
    expect(toGoogleColorId('mint')).toBe('2');
    expect(toGoogleColorId('lemon')).toBe('5');
  });

  it('sends a hex colour as the nearest of Google’s 11', () => {
    expect(toGoogleColorId('#D00000')).toBe('11'); // Tomato
    expect(toGoogleColorId('#0A7F40')).toBe('10'); // Basil
    expect(toGoogleColorId('#606060')).toBe('8'); // Graphite
    expect(toGoogleColorId('#F05020')).toBe('6'); // Tangerine
  });

  it('measures by eye, not raw RGB', () => {
    expect(toGoogleColorId('#8B1E3F')).toBe('4'); // dark red → Flamingo, not Graphite grey
    expect(toGoogleColorId('#FFE08A')).toBe('5'); // pale yellow → Banana, not Flamingo
  });

  it('maps each of Google’s 11 colours to itself', () => {
    const google = ['#7986CB', '#33B679', '#8E24AA', '#E67C73', '#F6BF26', '#F4511E', '#039BE5', '#616161', '#3F51B5', '#0B8043', '#D50000'] as const;
    google.forEach((hex, i) => expect(toGoogleColorId(hex)).toBe(String(i + 1)));
  });

  it('keeps a local hex while Google still shows the colour we sent', () => {
    expect(keepLocalColor('#D00000', '11', 'pink')).toBe('#D00000');
  });

  it('takes Google’s colour once it was changed there', () => {
    expect(keepLocalColor('#D00000', '7', 'sky')).toBe('sky');
    expect(keepLocalColor('mint', '7', 'sky')).toBe('sky');
    expect(keepLocalColor(null, '2', 'mint')).toBe('mint');
  });
});
