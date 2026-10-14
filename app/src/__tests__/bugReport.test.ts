import { describe, expect, it } from '@jest/globals';

import { fitWithin, imagePath, isBodyValid } from '@/lib/bugReport';

describe('isBodyValid', () => {
  it('needs 10–2000 characters after trimming', () => {
    expect(isBodyValid('   123456789   ')).toBe(false);
    expect(isBodyValid('1234567890')).toBe(true);
    expect(isBodyValid('a'.repeat(2000))).toBe(true);
    expect(isBodyValid('a'.repeat(2001))).toBe(false);
  });
});

describe('fitWithin', () => {
  it('keeps small images', () => expect(fitWithin(1600, 900)).toBeNull());
  it('shrinks the long side to 1600, landscape and portrait', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(1080, 2340)).toEqual({ width: 738, height: 1600 });
  });
});

describe('imagePath', () => {
  it('puts images under the user folder, numbered from 1', () => {
    expect(imagePath('u1', 'r1', 0)).toBe('u1/r1/1.jpg');
  });
});
