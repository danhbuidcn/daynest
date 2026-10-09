# Màn hình — Sprint 1

Thuộc: [Sprint 1](../index.md). Mockup: [mockups.html](mockups.html) (mở bằng trình duyệt). Màu, chữ, thành phần: [design-system.md](../../design-system.md).

| # | Màn | Route | Mục đích | Thành phần chính | Chức năng |
| --- | --- | --- | --- | --- | --- |
| 1 | Splash | — | Kiểm tra phiên | Logo, loading | [F1](../F1-khung-app.md) |
| 2 | Đăng nhập | `(auth)/login` | Đăng nhập Google | Logo, tên app, nút "Đăng nhập bằng Google", toast lỗi | [F2](../F2-dang-nhap-google.md) |
| 3 | Thanh tab | `(tabs)` | Điều hướng | Lịch · Quản lý · `+` · Thống kê · Cài đặt | [F1](../F1-khung-app.md) |
| 4 | Lịch (trống) | `(tabs)/calendar` | Chỗ cho S2 | Tiêu đề "Lịch" | [F1](../F1-khung-app.md) |
| 5 | Quản lý (trống) | `(tabs)/manage` | Chỗ cho S7–S9 | Tiêu đề "Quản lý" | [F1](../F1-khung-app.md) |
| 6 | Thống kê (trống) | `(tabs)/stats` | Chỗ cho S9 | Tiêu đề "Thống kê" | [F1](../F1-khung-app.md) |
| 7 | Cài đặt | `(tabs)/settings` | Tài khoản | Ảnh, tên, email, nút Đăng xuất, dòng Ngôn ngữ, version app | [F1](../F1-khung-app.md), [F2](../F2-dang-nhap-google.md), [F4](../F4-ky-app-version.md) |
| 8 | Hộp xác nhận đăng xuất | — | Tránh bấm nhầm | "Đăng xuất?" · Huỷ / Đăng xuất | [F2](../F2-dang-nhap-google.md) |
| 9 | Chọn ngôn ngữ | — | Đổi ngôn ngữ | Bảng trượt từ dưới lên: English · Tiếng Việt, dấu ✓ ở mục đang chọn | [F1](../F1-khung-app.md) |

- Nút `+` (S1): toast "Đang phát triển".
- Tab trống: chip "Đang phát triển" + "Tính năng này đang được phát triển. Bạn quay lại sau nhé!" — không nhắc số sprint.
- Cài đặt hiện `version (versionCode)` để kiểm tra bản đang cài.
- Tham khảo bố cục thanh tab: [Cute Calendar 01](../../../research/cute-calendar/screenshots/01-home.png), [Cài đặt 70](../../../research/cute-calendar/screenshots/70-settings.png).
