export const NAME_MAX = 50;

export type NameError = 'required' | 'tooLong';

/** Cắt khoảng trắng 2 đầu, kiểm tra 1–50 ký tự. */
export function validateName(raw: string): { value: string; error: NameError | null } {
  const value = raw.trim();
  if (value.length === 0) return { value, error: 'required' };
  if ([...value].length > NAME_MAX) return { value, error: 'tooLong' };
  return { value, error: null };
}
