# 2026-10-09 — S1 bước 4: keystore release, APK cài máy thật — ✅ xong (release v1.0.1)

## Input

- Spec: `F4-signing-and-version.md`, `design/build.md` (keystore RSA 2048, 10000 ngày, alias `daynest`).
- **Đã chốt (bạn):** keystore nằm trong `app/.env` → máy khác chỉ cần chép `app/.env`.
- Hiện bản release Gradle đang ký bằng keystore **debug** (template Expo) → chưa dùng được để phát hành.
- DoD S1 còn 3 mục: cài APK release lên máy thật + đăng nhập Google; build từ máy thứ 2 cài đè được; `versionCode` 2 cài đè bản 1.

## Output

- 1 keystore release dùng chung mọi máy, ngoài repo.
- 1 lệnh build ra APK (cài thử) + AAB (Google Play sau này), ký bằng keystore release.
- App release cài trên điện thoại thật của bạn, đăng nhập Google được.

## Context

- Keystore trong `app/.env` (không commit, `.gitignore` đã chặn `.env*`), 3 biến **không** có tiền tố `EXPO_PUBLIC_` → không bị nhúng vào app:
  - `ANDROID_KEYSTORE_BASE64` = file `.jks` mã hoá base64;
  - `ANDROID_KEYSTORE_PASSWORD` (dùng chung cho store + key);
  - `ANDROID_KEY_ALIAS=daynest`.
- Lúc build, script giải base64 ra file tạm (xoá sau khi build) → Gradle ký bằng file đó. `android/` sinh tự động nên gắn chữ ký bằng 1 config plugin nhỏ `app/plugins/withReleaseSigning.js` (đọc biến môi trường, thiếu thì báo lỗi rõ).
- **Hệ quả:** `app/.env` giờ là **bí mật quan trọng nhất** — mất = không cập nhật được app đã cài; lộ = người khác ký giả app. Lưu `app/.env` vào password manager + 1 bản dự phòng; gửi sang máy khác qua kênh riêng (không chat, không email thường).
- Mật khẩu keystore: tôi sinh ngẫu nhiên bằng `openssl`, ghi thẳng vào `app/.env`, không in ra chat.
- Mỗi keystore có 1 SHA-1 riêng → cần thêm **OAuth client Android thứ 2** (release) trên Google Cloud, rồi thêm Client ID đó vào ô Client IDs của Supabase. Việc này làm trên web: bạn nhờ Claude extension, tôi đưa prompt.
- Build release nhúng sẵn JS, không cần Metro; giá trị `app/.env` được nhúng lúc build.

## Bạn chuẩn bị

1. Điện thoại Android: bật **Tuỳ chọn nhà phát triển** → **Gỡ lỗi USB**, cắm cáp vào máy, bấm "Cho phép" khi máy hỏi.
2. Sau bước 2 dưới đây: gửi prompt tôi đưa cho Claude extension để đăng ký SHA-1 release.

## Plan

- [x] 1. Tạo keystore:
  - alias `daynest_alias` (bạn chọn), RSA 2048, 10000 ngày, mật khẩu ngẫu nhiên. Đã tạo lại 1 lần vì mật khẩu bản đầu lỡ in ra log khi debug. SHA-1 release: `47:FA:14:1E:96:20:68:4B:AC:C8:32:C2:6C:AE:3D:DD:17:9B:A5:93`;
  - ghi 3 biến vào `app/.env`, xoá file `.jks` tạm;
  - `app/.env.example` thêm 3 biến (để trống, có comment);
  - in SHA-1 release.
- [x] 2. Đưa bạn prompt cho Claude extension: tạo OAuth client Android "Daynest Android (release)" với SHA-1 release; thêm Client ID mới vào Supabase → Google → Client IDs (Web vẫn đứng đầu).
- [x] 3. Config plugin `app/plugins/withReleaseSigning.js`: bản release ký bằng keystore từ biến môi trường; thiếu biến thì build dừng, báo lỗi rõ.
- [x] 4. Script `app/scripts/release.sh` (= `npm run release`):
  - đọc `app/.env`, giải keystore ra file tạm, kiểm tra SHA-1 đúng (ghi SHA-1 mong đợi trong script), xoá file tạm khi xong;
  - `prebuild` → `assembleRelease` + `bundleRelease`;
  - in đường dẫn APK, AAB, version, versionCode.
- [x] 5. Build `1.0.0 (versionCode 1)`, kiểm tra chữ ký bằng `apksigner verify --print-certs` → SHA-1 release.
- [x] 6. Cài lên điện thoại thật (`adb install`) → đăng nhập Google OK, ngôn ngữ lấy từ DB. Phát hiện chữ bị cắt trên Samsung → todo riêng.
- [x] 7. Test cài đè:
  - tạm đổi `versionCode` 2 (`1.0.1`), build → `adb install -r` đè lên bản 1 → vẫn đăng nhập, dữ liệu còn;
  - sau đó đặt lại `versionCode` 1? **Không** — giữ 2 vì máy đã có bản 2 (Android không cho hạ `versionCode`) → commit version `1.0.1 (2)`.
- [x] 8. Test "máy thứ 2" ngay trên máy này:
  - `git clone` repo sạch vào thư mục tạm → build bằng cùng keystore → `adb install -r` đè lên → vẫn đăng nhập. ✅ Gộp với mục 7: bản 1.0.1 (2) build từ clone (chỉ chép `app/.env`) cài đè 1.0.0 (1) trên Samsung SM-A556E, giữ phiên + ngôn ngữ.
  - Laptop thật: chép `app/.env` sang rồi `npm run release`.
- [x] 9. Cập nhật `design/build.md` (keystore nằm trong `app/.env`, lệnh `npm run release`, SHA-1 release). Tick DoD S1.
- [x] 10. Commit `feat(app): release signing and build script` rồi push.

**Thêm (bạn yêu cầu): ghi quy trình release cuối sprint để lần sau tự làm đúng format — chờ duyệt**

- [x] 11. `docs/specs/index.md` §4: thêm mục ngắn "Cuối sprint" (áp dụng mọi sprint), từng bước:
  1. Tick DoD sprint;
  2. tăng version: `version` +MINOR (S2 = `1.1.0`…), `versionCode` +1 trong `app.config.ts`;
  3. `supabase/db migrate` nếu sprint có migration mới;
  4. `npm run release` → `app/dist/daynest-<version>-<versionCode>.apk|.aab`;
  5. cài đè lên máy thật (`adb install -r`), test nhanh luồng chính + luồng của sprint;
  6. commit `chore(release): v<version>` + tag `v<version>`, push.
- [x] 12. `design/build.md`:
  - keystore trong `app/.env` (alias `daynest_alias`);
  - SHA-1 debug + release;
  - lệnh `npm run release`;
  - máy mới chỉ cần chép `app/.env`.
- [x] 13. CLAUDE.md của project (tài liệu governance → theo Rule 7): nội dung dự định ghi ở `wip/claude-md-todo.md`. Bạn ok file đó thì tôi mới tạo `CLAUDE.md`.
