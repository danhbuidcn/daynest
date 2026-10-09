export type Profile = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

export type ProfileRow = {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
};

export const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  displayName: row.display_name,
  email: row.email,
  avatarUrl: row.avatar_url,
});

export const avatarPath = (userId: string) => `${userId}/avatar.jpg`;

export const withVersion = (publicUrl: string, version: number) => `${publicUrl}?v=${version}`;

export const isLocalUri = (uri: string | null): uri is string => !!uri && /^(file|content):/.test(uri);
