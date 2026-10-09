# F1 — Khung app + điều hướng

Thuộc: [Sprint 1](index.md).

## Mục tiêu

- Dựng project Expo làm nền cho mọi sprint sau.

## Logic

- Expo SDK ổn định mới nhất, TypeScript, Expo Router.
- Development build (`expo-dev-client`) — Google Sign-In không chạy trong Expo Go.
- Cấu trúc thư mục theo [Spec tổng §3](../index.md#3-kiến-trúc); S1 chỉ tạo phần cần dùng.
- Route:
  - `(auth)/login` — màn Đăng nhập.
  - `(tabs)/calendar`, `(tabs)/manage`, `(tabs)/stats`, `(tabs)/settings`.
- Guard: chưa có phiên → chuyển về `(auth)/login`; có phiên → `(tabs)`.
- Nút `+` giữa thanh tab: chưa có chức năng, bấm hiện "Sắp có".
- Biến môi trường: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` trong `.env` (không commit), có `.env.example`.

## Luồng

- Mở app → splash (kiểm tra phiên) → Đăng nhập hoặc Tab Lịch.

## Mô tả

- 5 vị trí trên thanh dưới: Lịch · Quản lý · `+` · Thống kê · Cài đặt.
- Tab Lịch, Quản lý, Thống kê: màn trống có tiêu đề.
- Tab Cài đặt: tài khoản + Đăng xuất (xem [F2](F2-dang-nhap-google.md)).
- Màn hình: [design/screens.md](design/screens.md).
