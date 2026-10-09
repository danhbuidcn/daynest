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
- Cài đặt → mục Tài khoản: ảnh, tên, email (lấy từ `profiles`), nút Đăng xuất.
- Mất mạng khi đăng nhập → toast "Không có kết nối".
