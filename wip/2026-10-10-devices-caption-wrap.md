# 2026-10-10 — Màn 25 (Thiết bị đăng nhập): dòng chú thích hiện đủ, giống mockup — ✅ xong

## Input

- Bạn báo: màn 25 hiện "…" (chú thích "Đăng nhập … · Dùng lần cuối hôm nay 22:…" bị cắt 1 dòng). Mockup màn 25: chú thích xuống dòng, không cắt.

## Plan

- [x] 1. `app/settings/devices.tsx`: bỏ `numberOfLines={1}` ở dòng chú thích (tên máy vẫn cắt 1 dòng như mockup).
- [x] 2. Emulator: chú thích xuống 2 dòng, đủ "hôm nay 22:29".
- [x] 3. Commit `fix(app): devices screen caption wraps like the mockup`, push.

## Kết quả

- Đã sửa và thử trên emulator: khớp mockup màn 25.
