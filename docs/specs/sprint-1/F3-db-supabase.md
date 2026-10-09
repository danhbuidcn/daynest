# F3 — DB Supabase tối thiểu

Thuộc: [Sprint 1](index.md).

## Mục tiêu

- Có DB + RLS làm nền; sprint sau chỉ thêm bảng mới qua migration.

## Logic

- Chỉ 2 bảng: `profiles`, `user_settings` + 1 Storage bucket `avatars` (ảnh đại diện). Chi tiết: [design/db.md](design/db.md).
- Migration SQL trong `supabase/migrations/`, chạy bằng Supabase CLI.
- RLS bật cho mọi bảng: user chỉ đọc/sửa dòng của mình.
- Trigger khi có user mới trong `auth.users` → tạo dòng `profiles` + `user_settings`.

## Luồng

- Đăng nhập lần đầu → Supabase tạo `auth.users` → trigger tạo 2 dòng → app đọc `profiles` để hiện ở Cài đặt.

## Mô tả

- S1 đọc `profiles` (hiện tài khoản) và sửa tên + ảnh ([F2](F2-dang-nhap-google.md#sửa-tài-khoản)). `user_settings` tạo sẵn với giá trị mặc định, S2 bắt đầu dùng.
- Test RLS: script SQL đăng nhập giả user A, B → A không đọc/sửa được dòng của B.
