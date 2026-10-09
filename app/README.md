# Daynest app

Expo (SDK 57) + Expo Router + TypeScript. Spec: [docs/specs/](../docs/specs/index.md).

## Cần có

- Node 24 (nvm), Java 17, Android SDK (`ANDROID_HOME`), 1 emulator hoặc điện thoại bật USB debugging.

## Chạy

```bash
cd app
npm install
cp .env.example .env        # bước 1 (đăng nhập giả) chưa cần điền
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
| `src/features/auth/` | Đăng nhập (`authService` — hiện là bản giả), validate tên |
| `src/i18n/`, `src/locales/` | Ngôn ngữ `en` (mặc định), `vi` |

## Ghi chú

- Đăng nhập hiện là **giả** (`mockAuthService`): lưu user mẫu trên máy. Đăng xuất xoá luôn tên/ảnh đã sửa. Bước 3 thay bằng Supabase + Google.
