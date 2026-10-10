# F4 — Ký app + version

Thuộc: [Sprint 1](index.md).

## Mục tiêu

- Build ở PC hay laptop đều ra app cùng chữ ký.
- Người dùng cài v1 → cập nhật v2 không mất dữ liệu, không phải gỡ app.

## Logic

- Android chỉ cho cài đè khi: **cùng package** + **cùng chữ ký** + **`versionCode` lớn hơn**.
- Package cố định: `com.danhbuidcn.daynest`.
- Tạo **1 keystore release** duy nhất, đưa bạn file + mật khẩu.
- Keystore **không commit** (repo public) — bạn lưu password manager + 1 bản dự phòng; chép sang máy nào cần build.
- `versionCode` và `version` nằm trong config app, commit vào git → mọi máy cùng số.
- Lên Google Play: bật Play App Signing; keystore của mình là upload key (mất còn xin reset được).
- Dữ liệu nằm trên Supabase, phiên đăng nhập nằm trong bộ nhớ app → cài đè giữ nguyên cả hai.

## Luồng

```text
Sửa code → tăng versionCode (+1) và version → commit → build release (keystore) → cài đè
```

## Mô tả

- Quy tắc version, lệnh build, nơi đặt keystore: [design/build.md](design/build.md).
- SHA-1 keystore debug + release (+ Play App Signing khi lên store) đăng ký vào OAuth client Android, nếu thiếu thì đăng nhập Google lỗi.
