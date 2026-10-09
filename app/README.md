# Daynest app

Expo (SDK 57) + Expo Router + TypeScript. Spec: [docs/specs/](../docs/specs/index.md).

## Cần có

- Node 24 (nvm), Java 17, Android SDK (`ANDROID_HOME`), 1 emulator hoặc điện thoại bật USB debugging.

## Chạy

```bash
cd app
npm install
cp .env.example .env        # điền 3 giá trị — xem mục "Làm trên máy khác"
npm run android             # = expo run:android: prebuild + build debug + cài + mở Metro
```

- Lần đầu build Gradle mất vài phút (tải NDK, build-tools).
- Đã cài app rồi, chỉ sửa JS: `npx expo start` rồi mở app trên máy.
- `android/` sinh tự động (`expo prebuild`), không commit, không sửa tay.

## Kiểm tra

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm test            # jest
```

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `src/app/` | Màn hình (Expo Router): `(auth)/login`, `(tabs)/*`, `settings/account` |
| `src/components/` | Thành phần dùng chung theo design system |
| `src/theme/` | Token màu, chữ, khoảng cách — chỉ dùng giá trị ở đây |
| `src/features/auth/` | Đăng nhập Google → Supabase (`authService`), sửa tên/ảnh, validate tên |
| `src/lib/supabase.ts` | Client Supabase (phiên lưu AsyncStorage) |
| `../supabase/` | Migration + test RLS (pgTAP) |
| `src/i18n/`, `src/locales/` | Ngôn ngữ `en` (mặc định), `vi` |

## Supabase

- Project: `xxfsqxuymswnbomxbpfs` (dashboard: https://supabase.com/dashboard/project/xxfsqxuymswnbomxbpfs).
- Migration: `supabase/migrations/`. Đẩy lên project thật: dán file vào SQL Editor, hoặc `npx supabase link --project-ref xxfsqxuymswnbomxbpfs && npx supabase db push` (hỏi mật khẩu DB).
- Test RLS trên máy (cần Docker): `npx supabase start` rồi `npx supabase test db`.

## Làm trên máy khác (laptop)

1. `git pull`, cài Node 24 / Java 17 / Android SDK.
2. Tạo `app/.env` (không commit) với 3 giá trị — lấy lại ở đâu:

   | Biến | Lấy ở |
   | --- | --- |
   | `EXPO_PUBLIC_SUPABASE_URL` | `https://xxfsqxuymswnbomxbpfs.supabase.co` |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → **Publishable key** |
   | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud → Google Auth Platform → Clients → client **Web** → Client ID |

3. `npm install && npm run android`.
4. Không cần làm lại Google Cloud / Supabase. Bản debug dùng keystore Expo sinh sẵn (`android/app/debug.keystore`), SHA-1 giống mọi máy (`5E:8F:16:…:F6:25`) — đã đăng ký trong OAuth client Android.
5. Emulator/điện thoại test phải có tài khoản Google là **test user** (Google Auth Platform → Audience).

## Ghi chú

- Google Sign-In chỉ cấu hình cho Android. iOS cần thêm OAuth client iOS + config plugin `@react-native-google-signin/google-signin` (`iosUrlScheme`) — làm khi test iOS.
- Mất mạng: kiểm tra mạng trước khi gửi (`expo-network`) → toast "Không có kết nối".
