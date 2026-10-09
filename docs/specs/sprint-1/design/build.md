# Build + ký app — Sprint 1

Thuộc: [F4](../F4-ky-app-version.md).

## Keystore

- Tạo 1 lần bằng `keytool`, thuật toán RSA 2048, hạn 10000 ngày, alias `daynest`.
- Tôi đưa bạn: file `daynest-release.jks`, mật khẩu store, alias, mật khẩu key, SHA-1.
- Bạn lưu: password manager + 1 bản dự phòng ngoài máy.
- Mỗi máy build đặt keystore ngoài repo, vd `~/.daynest/daynest-release.jks`.
- Mật khẩu truyền qua biến môi trường / file local bị `.gitignore` — không nằm trong git.
- Debug keystore: mỗi máy có 1 cái khác nhau → đăng ký SHA-1 debug của cả PC và laptop vào OAuth client Android (hoặc chỉ test bằng bản release).

## Version

| Trường | Ý nghĩa | Quy tắc |
| --- | --- | --- |
| `version` | Số hiện cho người dùng | `MAJOR.MINOR.PATCH`, S1 = `0.1.0`, mỗi sprint +MINOR |
| `android.versionCode` | Số Android so sánh khi cài đè | Số nguyên, bắt đầu `1`, **+1 mỗi bản build phát hành**, không bao giờ giảm |

- Cả 2 nằm trong config app (`app.config.ts`), commit vào git.
- Build bản mới mà quên tăng `versionCode` → Android từ chối cài đè.

## Build

- Cách build (local Gradle hay EAS) chốt ở bước code S1; yêu cầu bắt buộc: dùng keystore trên, đọc version từ config.
- Có script/lệnh duy nhất ghi trong `app/README.md`, chạy giống nhau trên PC và laptop.
- Ra: APK để cài thử, AAB để lên Google Play.

## Kiểm tra

- `keytool -printcert -jarfile app.apk` trên bản build của PC và laptop → SHA-1 giống nhau.
- Cài v1 (`versionCode 1`) → đăng nhập → cài đè v2 (`versionCode 2`) → vẫn đăng nhập, không mất dữ liệu.
