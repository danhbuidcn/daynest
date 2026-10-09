import { describe, expect, it } from '@jest/globals';

import { toProfile } from '@/features/auth/profile';

describe('profile', () => {
  it('maps a DB row to Profile', () => {
    expect(
      toProfile({ id: 'u1', display_name: 'An', email: 'an@x.dev', avatar_url: null }),
    ).toEqual({ id: 'u1', displayName: 'An', email: 'an@x.dev', avatarUrl: null });
  });
});
