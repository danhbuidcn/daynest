import { describe, expect, it } from '@jest/globals';
import { NAME_MAX, validateName } from '@/features/auth/validateName';

describe('validateName', () => {
  it('trims surrounding whitespace', () => {
    expect(validateName('  An  ')).toEqual({ value: 'An', error: null });
  });

  it('rejects empty or whitespace-only names', () => {
    expect(validateName('').error).toBe('required');
    expect(validateName('   ').error).toBe('required');
  });

  it('accepts 50 characters, rejects 51', () => {
    expect(validateName('a'.repeat(NAME_MAX)).error).toBeNull();
    expect(validateName('a'.repeat(NAME_MAX + 1)).error).toBe('tooLong');
  });

  it('counts Vietnamese and emoji by character, not by byte', () => {
    expect(validateName('Ễ'.repeat(NAME_MAX)).error).toBeNull();
    expect(validateName('😀'.repeat(NAME_MAX)).error).toBeNull();
  });
});
