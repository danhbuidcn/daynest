import { describe, expect, it } from '@jest/globals';

import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('locales', () => {
  it('en and vi have the same keys', () => {
    expect(keys(vi).sort()).toEqual(keys(en).sort());
  });
});
