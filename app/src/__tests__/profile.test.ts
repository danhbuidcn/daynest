import { describe, expect, it } from '@jest/globals';

import { avatarPath, isLocalUri, toProfile, withVersion } from '@/features/auth/profile';

describe('profile', () => {
  it('chuyển dòng DB sang Profile', () => {
    expect(
      toProfile({ id: 'u1', display_name: 'An', email: 'an@x.dev', avatar_url: null }),
    ).toEqual({ id: 'u1', displayName: 'An', email: 'an@x.dev', avatarUrl: null });
  });

  it('ảnh nằm trong folder của user', () => {
    expect(avatarPath('u1')).toBe('u1/avatar.jpg');
  });

  it('URL ảnh kèm version để không dùng cache cũ', () => {
    expect(withVersion('https://x/avatars/u1/avatar.jpg', 42)).toBe('https://x/avatars/u1/avatar.jpg?v=42');
  });

  it('chỉ ảnh trên máy mới cần tải lên', () => {
    expect(isLocalUri('file:///data/a.jpg')).toBe(true);
    expect(isLocalUri('content://media/1')).toBe(true);
    expect(isLocalUri('https://x/avatars/u1/avatar.jpg?v=1')).toBe(false);
    expect(isLocalUri(null)).toBe(false);
  });
});
