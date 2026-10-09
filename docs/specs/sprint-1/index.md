# Sprint 1 — Nền móng

Thuộc: [Spec tổng](../index.md) · S1.

## Mục tiêu

- Có app Daynest cài được trên Android, đăng nhập Google, vào khung 5 tab.
- Có DB Supabase tối thiểu + RLS.
- Có 1 keystore release dùng chung mọi máy; cài đè v1 → v2 không mất dữ liệu.

## Phạm vi

| Mã | Chức năng | Chi tiết |
| --- | --- | --- |
| F1 | Khung app + điều hướng | [F1-khung-app.md](F1-khung-app.md) |
| F2 | Đăng nhập Google | [F2-dang-nhap-google.md](F2-dang-nhap-google.md) |
| F3 | DB Supabase tối thiểu | [F3-db-supabase.md](F3-db-supabase.md) |
| F4 | Ký app + version | [F4-ky-app-version.md](F4-ky-app-version.md) |

**Không làm ở S1:** lịch, event, todo, note, diary, Google Calendar, thông báo.

## Luồng tổng

```text
Mở app → kiểm tra phiên
  ├─ chưa đăng nhập → Đăng nhập → Google → Supabase → tạo profile (lần đầu) → Tab Lịch
  └─ đã đăng nhập  → Tab Lịch
Cài đặt → Đăng xuất → Đăng nhập
```

## Thiết kế

- [Màn hình](design/screens.md)
- [DB](design/db.md)
- [Build + ký app](design/build.md)

## Bạn chuẩn bị

1. Project Supabase (free) → gửi `SUPABASE_URL`, `anon key`.
2. Project Google Cloud → OAuth consent ở chế độ Testing, thêm email bạn làm test user.
3. OAuth client **Web** (cho Supabase) + **Android** (package `com.danhbuidcn.daynest` + SHA-1 debug và release — tôi đưa SHA-1 sau khi tạo keystore).
4. Supabase → Auth → Providers → Google: bật, dán Web client ID/secret.

## Xong khi (DoD)

- [ ] Cài APK release lên Android máy thật, đăng nhập Google thành công.
- [ ] Tắt app mở lại → vẫn đăng nhập.
- [ ] Đăng xuất → về màn Đăng nhập.
- [ ] Bảng `profiles`, `user_settings` có dòng của user; test RLS: user A không đọc được dòng user B.
- [ ] Build từ máy thứ 2 (cùng keystore) cài đè được, không mất phiên đăng nhập.
- [ ] Bản `versionCode` 2 cài đè bản 1 thành công.
- [ ] Đổi ngôn ngữ Việt ↔ Anh, chữ đổi ngay; đăng nhập trên máy khác vẫn giữ lựa chọn.
