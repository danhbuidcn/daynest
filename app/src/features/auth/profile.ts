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

/** Đường dẫn ảnh trong bucket `avatars`: mỗi user 1 file, ghi đè khi đổi. */
export const avatarPath = (userId: string) => `${userId}/avatar.jpg`;

/** URL kèm `?v=` để app không dùng ảnh cache cũ sau khi đổi. */
export const withVersion = (publicUrl: string, version: number) => `${publicUrl}?v=${version}`;

/** Ảnh trên máy (vừa chọn, chưa tải lên) → cần upload. */
export const isLocalUri = (uri: string | null): uri is string => !!uri && /^(file|content):/.test(uri);
