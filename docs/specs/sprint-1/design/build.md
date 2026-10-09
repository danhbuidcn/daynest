# Build + ký app — Sprint 1

Thuộc: [F4](../F4-ky-app-version.md).

## Keystore

- 1 keystore release dùng chung mọi máy: RSA 2048, hạn 10000 ngày, alias `daynest_alias`.
- Nằm trong `app/.env` (không commit): `ANDROID_KEYSTORE_BASE64` (file `.jks` dạng base64), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`. Không có tiền tố `EXPO_PUBLIC_` → không bị nhúng vào app.
- Lưu cả file `app/.env` vào password manager + 1 bản dự phòng. Máy mới: chép `app/.env` sang là build được.
- Mất `app/.env` = không cập nhật được app đã cài; lộ = người khác ký giả được app.

| Keystore | SHA-1 | OAuth client Android |
| --- | --- | --- |
| Debug (Expo sinh sẵn, giống mọi máy) | `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` | Daynest Android (debug) |
| Release | `47:FA:14:1E:96:20:68:4B:AC:C8:32:C2:6C:AE:3D:DD:17:9B:A5:93` | Daynest Android (release) — Client ID đã thêm vào Supabase → Google → Client IDs |

## Version

| Trường | Ý nghĩa | Quy tắc |
| --- | --- | --- |
| `version` | Số hiện cho người dùng | `MAJOR.MINOR.PATCH`: mỗi sprint +MINOR (S2 = `1.1.0`), sửa lỗi giữa sprint +PATCH. S1 phát hành `1.0.1` |
| `android.versionCode` | Số Android so sánh khi cài đè | Số nguyên, bắt đầu `1`, **+1 mỗi bản build phát hành**, không bao giờ giảm |

- Cả 2 nằm trong config app (`app.config.ts`), commit vào git.
- Build bản mới mà quên tăng `versionCode` → Android từ chối cài đè.

## Build

- `cd app && npm run release` (script `app/scripts/release.sh`):
  - đọc `app/.env`, giải keystore ra file tạm, kiểm tra SHA-1 release, xoá file tạm khi xong;
  - `expo prebuild --clean` → Gradle `assembleRelease` + `bundleRelease` (plugin `app/plugins/withReleaseSigning.js` gắn chữ ký);
  - ra `app/dist/daynest-<version>-<versionCode>.apk` (cài thử) và `.aab` (Google Play). `dist/` không commit.
- Cài lên máy thật: `adb install -r app/dist/daynest-<version>-<versionCode>.apk`.
- Build debug để code hằng ngày: `npm run android` (không cần keystore release).

## Kiểm tra

- `apksigner verify --print-certs app/dist/<file>.apk` → SHA-1 release ở bảng trên.
- Cài v1 (`versionCode 1`) → đăng nhập → cài đè v2 (`versionCode 2`) → vẫn đăng nhập, không mất dữ liệu.
