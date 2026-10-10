# 2026-10-09 — S1 bước 3: nối Supabase + đăng nhập Google thật — ✅ xong

## Input

- Supabase project `xxfsqxuymswnbomxbpfs`: URL + publishable key (bạn đã gửi).
- Spec: `F2`, `F3`, `design/db.md` (2 bảng, RLS, trigger, bucket `avatars`).
- Code bước 1: `authService` (đang là bản giả), `i18n` (ngôn ngữ lưu trên máy).

## Output

- Đăng nhập Google thật → Supabase. Profile, ngôn ngữ, tên và ảnh lưu trên DB/Storage.
- Migration + test RLS trong `supabase/`.
- Chạy được trên emulator với tài khoản Google thật của bạn.

## Context

- **SHA-1 debug** để tạo OAuth client Android: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
  - Đây là keystore debug Expo sinh sẵn trong `android/app/`. Mọi máy chạy `prebuild` đều có cùng SHA-1 này, nên PC và laptop dùng chung được.
  - SHA-1 release làm ở bước 4.
- **Emulator** `Pixel_5_API_34` là image `google_apis`, có Google Play Services. Cần thêm 1 tài khoản Google vào emulator để test.
- **Key trong app:** chỉ dùng URL + publishable key, ghi vào `app/.env` (không commit). Mật khẩu DB không nằm trong app hay repo.
- **Migration:**
  - Test trước trên Supabase local (Docker, `supabase start`).
  - Đẩy lên project thật bằng `npx supabase db push`. Lệnh này cần mật khẩu DB → **bạn tự chạy** bằng `! <lệnh>`, tôi không giữ mật khẩu.

## Bạn chuẩn bị (làm song song)

1. Google Cloud → tạo project → OAuth consent screen: chế độ Testing, thêm email của bạn làm test user.
2. Tạo OAuth client **Web** → gửi tôi **Client ID**. Client secret bạn tự dán vào Supabase, không gửi qua chat.
3. Tạo OAuth client **Android**: package `com.danhbuidcn.daynest`, SHA-1 ở trên.
4. Supabase → Authentication → Sign In / Providers → Google: bật, dán Web Client ID + secret.
5. Nên làm: đổi mật khẩu DB (Database → Settings → Reset password), vì mật khẩu cũ đã nằm trong chat.

## Plan

- [x] 1. `supabase/`: `npx supabase init`; migration `<timestamp>_init.sql` gồm:
  - bảng `profiles` + `user_settings` (có cột `language`);
  - RLS: chỉ đọc/sửa dòng của mình; `profiles` chỉ cho sửa `display_name` + `avatar_url`;
  - trigger tạo 2 dòng khi có user mới (lấy tên, email, ảnh từ Google); trigger `updated_at`;
  - bucket `avatars` (public read) + policy chỉ ghi vào folder `{user_id}`.
- [x] 2. `supabase/tests/rls_s1.sql` (pgTAP), giả 2 user A, B, kiểm tra:
  - A không đọc/sửa được dòng của B;
  - A không sửa được `email`;
  - A không ghi được ảnh vào folder của B.
  - Chạy `supabase start` + `supabase test db` trên Docker local.
- [x] 3. App: cài `@supabase/supabase-js`, `@react-native-google-signin/google-signin` (config plugin); tạo `src/lib/supabase.ts` (lưu phiên bằng AsyncStorage, tự làm mới token).
- [x] 4. `supabaseAuthService` thay `mockAuthService`, giữ nguyên interface `AuthService`:
  - `signIn`: Google → `idToken` → `signInWithIdToken` → đọc `profiles`;
  - huỷ chọn tài khoản → không báo lỗi;
  - mất mạng → toast "Không có kết nối";
  - `signOut`: Supabase + Google;
  - `updateProfile`: tải ảnh lên `avatars/{uid}/avatar.jpg` (ghi đè, URL kèm `?v=`), cập nhật `profiles`.
  - Xoá `mockAuthService`.
- [x] 5. Ngôn ngữ: sau đăng nhập, đọc `user_settings.language` → áp dụng + ghi về máy. Đổi trong Cài đặt → ghi cả DB.
- [x] 6. Kiểm tra code: `tsc`, lint, Jest (thêm test hàm chuyển dữ liệu DB → `Profile`).
- [x] 7. Đẩy migration: bạn (qua Claude extension) chạy SQL trong SQL Editor; tôi kiểm tra bảng/bucket đã có trên project thật.
- [x] 8. Build lại, chạy emulator với tài khoản Google thật, đi các luồng:
  - đăng nhập → profile tạo đúng;
  - đổi tên + ảnh, mở lại app vẫn đúng;
  - đổi ngôn ngữ → DB lưu;
  - đăng xuất → đăng nhập lại vẫn giữ tên/ảnh/ngôn ngữ;
  - tắt mạng → toast lỗi.
- [x] 9. Cập nhật `app/README.md` (Supabase, `.env`), `F2`/`F3` nếu khác spec. Tick DoD S1 các mục đã đạt.
- [x] 10. Commit `feat: supabase auth with google sign-in` rồi push.
