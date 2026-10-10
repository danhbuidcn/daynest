# 2026-10-09 — S1 bước 1: code giao diện, đăng nhập giả, chạy trên emulator — ✅ xong

## Input

- Spec S1: `docs/specs/sprint-1/` (F1–F4, `design/screens.md`), `docs/specs/design-system.md`, `mockups.html` (10 màn).
- Kiến trúc: `docs/specs/index.md` §3.
- Máy: Node 24, Java 17, Android SDK, emulator `Pixel_5_API_34`.

## Output

- App Expo trong `app/`, chạy trên emulator. Đủ 10 màn giống mockup, đổi được ngôn ngữ EN/VI.
- Đăng nhập và tài khoản dùng dữ liệu giả lưu trên máy. Bước 3 thay bằng Supabase + Google thật.
- `app/README.md`: lệnh cài, chạy, kiểm tra.

## Context

- Chưa có Supabase/Google → bấm "Đăng nhập bằng Google" tạo user giả `Nguyễn An / an.nguyen@gmail.com`, lưu phiên vào AsyncStorage.
- Code auth tách sau 1 interface `authService` (signIn, signOut, getSession, updateProfile) → bước 3 chỉ thay phần cài đặt, không sửa màn hình.
- Chưa cài `google-signin`, `supabase-js`, chưa làm keystore release (bước 3, 4).
- **Đã chốt:** S1 = `1.0.0` (bạn chọn) → sửa `build.md` cho khớp.

## Plan

- [x] 1. Dựng project:
  - `create-expo-app` bản ổn định mới nhất, template TypeScript, vào `app/`;
  - package `com.danhbuidcn.daynest`, `version` + `android.versionCode` trong `app.config.ts`;
  - `.gitignore` thêm `!.env.example`; tạo `.env.example` với 3 key để trống.
- [x] 2. Cài thư viện:
  - `expo-router`, `@react-native-async-storage/async-storage`;
  - `i18next` + `react-i18next`;
  - `@expo-google-fonts/nunito`, `@expo/vector-icons`;
  - `expo-image-picker`, `expo-image-manipulator`.
- [x] 3. Theme: `src/theme/` chứa token đúng `design-system.md` (màu, cỡ chữ, khoảng cách, bo góc). Màn hình chỉ dùng token, không hard-code.
- [x] 4. Thành phần dùng chung (`src/components/`):
  - Button (chính, phụ, nguy hiểm), Card, SettingRow, Toast, ConfirmDialog, ChoiceDialog;
  - TextField, Avatar, Logo, ScreenHeader, EmptyState;
  - TabBar có nút `+` nổi.
- [x] 5. i18n: `src/locales/en.json`, `vi.json`. Ngôn ngữ mặc định `en`, lưu trên máy, đổi xong chữ đổi ngay.
- [x] 6. Màn hình (Expo Router):
  - Splash, `(auth)/login`;
  - `(tabs)`: calendar, manage, stats, settings;
  - `settings/account`;
  - hộp xác nhận đăng xuất, hộp chọn ngôn ngữ;
  - guard: chưa đăng nhập → login;
  - nút `+` → toast "In development" / "Đang phát triển".
- [x] 7. Sửa tài khoản (giả):
  - đổi tên với validate 1–50 ký tự, cắt khoảng trắng;
  - chọn ảnh, cắt vuông, thu nhỏ 512px;
  - lưu trên máy, toast "Đã lưu".
- [x] 8. Kiểm tra code:
  - `tsc --noEmit`, `expo lint`;
  - Jest: test validate tên; test `en.json` và `vi.json` đủ cùng bộ key.
- [x] 9. Chạy trên emulator `Pixel_5_API_34` (`npx expo run:android`).
  - Đi hết luồng: đăng nhập → 4 tab → `+` → đổi ngôn ngữ → sửa tên/ảnh → tắt mở lại vẫn đăng nhập → đăng xuất.
  - Chụp màn bằng `adb`, so với mockup.
- [x] 10. Viết `app/README.md`. Cập nhật `build.md`: chốt build bằng local Gradle qua `expo run:android` / `expo prebuild`.
- [x] 10b. Đổi chữ tab trống "Tính năng này đang được phát triển. Bạn quay lại sau nhé!" → "Tính năng đang được phát triển."
  - Sửa ở `vi.json`, `mockups.html`, `screens.md`.
  - `en.json` đổi tương ứng: "This feature is in development."
- [x] 10c. Xoá chip "Đang phát triển" ở 3 tab trống: app (`EmptyState`, key `empty.badge`), `mockups.html`, `screens.md`. Tiêu đề "<Tab> đang phát triển" và dòng mô tả giữ nguyên.
- [x] 10d. Nút cố định đáy + vuốt để back:
  - Màn Sửa tài khoản: nút Lưu cố định ở đáy màn (trên vùng an toàn), nội dung cuộn phía trên; bàn phím mở thì nút đẩy lên trên bàn phím.
  - Tạo thành phần `FormScreen` (tiêu đề + nội dung cuộn + nút đáy) để các màn form sau dùng chung.
  - `design-system.md`: thêm quy tắc "Màn form: nút hành động chính cố định ở đáy". Mockup màn 10 sửa theo.
  - Vuốt từ mép trái sang phải → về màn trước, cho mọi màn con (không áp dụng cho tab). Bật `gestureEnabled` + `fullScreenGestureEnabled` của Stack. Nếu Android không hỗ trợ vuốt trong native stack → dùng JS stack của expo-router cho các màn con.
- [x] 11. Commit `feat(app): sprint-1 UI with mock auth` rồi push. Báo bạn cách tự chạy để xem.
