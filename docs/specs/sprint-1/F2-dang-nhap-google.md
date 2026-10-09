# F2 — Đăng nhập Google

Thuộc: [Sprint 1](index.md).

## Mục tiêu

- Đăng nhập bằng tài khoản Google, giữ phiên, đăng xuất.

## Logic

- `@react-native-google-signin/google-signin` (native) → lấy `idToken`.
- `supabase.auth.signInWithIdToken({ provider: 'google', token: idToken })`.
- Scope S1: `openid email profile`. Scope `calendar.readonly` xin thêm ở S6.
- Phiên Supabase lưu trên máy (AsyncStorage), tự làm mới token.
- Lần đầu đăng nhập: trigger DB tạo `profiles` + `user_settings` ([F3](F3-db-supabase.md)).
- Đăng xuất: `supabase.auth.signOut()` + `GoogleSignin.signOut()`.

## Luồng

```text
Đăng nhập → bấm "Đăng nhập bằng Google" → chọn tài khoản
  ├─ thành công → Tab Lịch
  ├─ huỷ chọn   → ở lại, không báo lỗi
  └─ lỗi        → toast lỗi, ở lại
Cài đặt → Đăng xuất → xác nhận → Đăng nhập
```

## Mô tả

- Màn Đăng nhập: logo, tên app, 1 nút "Đăng nhập bằng Google".
- Cài đặt → thẻ tài khoản: ảnh, tên, email (lấy từ `profiles`), icon bút. Nút Đăng xuất ở cuối màn Cài đặt.
- Mất mạng khi đăng nhập / lưu / đổi ngôn ngữ → toast "Không có kết nối" (kiểm tra mạng trước khi gửi).

## Sửa tài khoản

- Bấm thẻ tài khoản → màn Sửa tài khoản (route `settings/account`).
- Sửa được: tên hiển thị, ảnh đại diện. Email lấy từ Google, chỉ xem.
- Tên: bắt buộc, 1–50 ký tự, cắt khoảng trắng 2 đầu.
- Ảnh: chọn từ thư viện (`expo-image-picker`), cắt vuông → thu nhỏ 512px JPEG (`expo-image-manipulator`) → tải lên Storage `avatars/{user_id}/avatar.jpg` ([db.md](design/db.md#storage-avatars)).
- Bấm Lưu → cập nhật `profiles.display_name`, `profiles.avatar_url` → toast "Đã lưu" → quay lại Cài đặt.
- Lỗi mạng → toast lỗi, ở lại màn, giữ dữ liệu đang nhập.
- Đăng nhập lại không ghi đè tên/ảnh đã sửa: trigger chỉ chạy khi tạo user lần đầu.
