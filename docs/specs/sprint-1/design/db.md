# DB — Sprint 1

Thuộc: [F3](../F3-db-supabase.md).

## `profiles`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id` | `uuid` PK | = `auth.users.id`, xoá theo user |
| `display_name` | `text` | Lúc đầu từ Google; user sửa được (1–50 ký tự) |
| `email` | `text` | Từ Google |
| `avatar_url` | `text null` | Lúc đầu từ Google; sau khi sửa = URL ảnh trong Storage |
| `created_at`, `updated_at` | `timestamptz` | |

## `user_settings`

| Cột | Kiểu | Mặc định | Dùng từ |
| --- | --- | --- | --- |
| `user_id` | `uuid` PK | = `auth.users.id` | S1 |
| `week_start` | `smallint` | `1` (Thứ 2; `0` = CN) | S2 |
| `use_24h` | `boolean` | `true` | S3 |
| `language` | `text` · check `in ('en','vi')` | `'en'` | S1 |
| `created_at`, `updated_at` | `timestamptz` | `now()` | |

- Cột khác (ngày âm, ngày lễ, nhắc diary…) thêm ở sprint dùng nó.

## RLS

- Bật RLS cả 2 bảng.
- `profiles`: select/update khi `id = auth.uid()`. Update chỉ cho cột `display_name`, `avatar_url`.
- `user_settings`: select/update khi `user_id = auth.uid()`.
- Không cho insert/delete từ app — trigger tạo, xoá theo `auth.users`.

## Storage `avatars`

- Bucket `avatars`, public read (ảnh hiện ở app không cần token).
- File: `avatars/{user_id}/avatar.jpg` — ghi đè khi đổi ảnh; URL kèm `?v=<timestamp>` để app không dùng ảnh cache cũ.
- RLS `storage.objects`: insert/update/delete khi `bucket_id = 'avatars'` và folder đầu = `auth.uid()`.

## Trigger

- `on auth.users insert` → insert `profiles` (lấy `raw_user_meta_data`: `full_name`, `email`, `avatar_url`) + `user_settings` mặc định.
- `updated_at` tự cập nhật khi sửa.

## Migration

- `supabase/migrations/<timestamp>_init.sql`: 2 bảng + RLS + trigger + bucket `avatars` và policy.
- Test RLS: `supabase/tests/rls_s1.sql` — giả 2 user, kiểm tra A không đọc/sửa được B, không ghi được ảnh vào folder của B.
