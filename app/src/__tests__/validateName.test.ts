import { describe, expect, it } from '@jest/globals';
import { NAME_MAX, validateName } from '@/features/auth/validateName';

describe('validateName', () => {
  it('cắt khoảng trắng 2 đầu', () => {
    expect(validateName('  An  ')).toEqual({ value: 'An', error: null });
  });

  it('báo thiếu khi rỗng hoặc chỉ có khoảng trắng', () => {
    expect(validateName('').error).toBe('required');
    expect(validateName('   ').error).toBe('required');
  });

  it('nhận đúng 50 ký tự, chặn 51', () => {
    expect(validateName('a'.repeat(NAME_MAX)).error).toBeNull();
    expect(validateName('a'.repeat(NAME_MAX + 1)).error).toBe('tooLong');
  });

  it('đếm ký tự tiếng Việt và emoji theo ký tự, không theo byte', () => {
    expect(validateName('Ễ'.repeat(NAME_MAX)).error).toBeNull();
    expect(validateName('😀'.repeat(NAME_MAX)).error).toBeNull();
  });
});
