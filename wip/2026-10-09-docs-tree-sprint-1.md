# 2026-10-09 — Tổ chức lại docs dạng cây + viết docs Sprint 1 — ✅ xong

**Cây mới:**

```text
docs/
  index.md                    # mô tả từng file/folder trong docs/
  specs/
    index.md                  # sản phẩm, quyết định chung, kiến trúc, danh sách sprint + chức năng sơ bộ
    sprint-1/                 # S1 nền móng
      index.md                # mục tiêu, phạm vi, luồng tổng, DoD, link chức năng + màn hình
      F1-app-shell.md         # mỗi file: mục tiêu, logic, luồng, mô tả
      F2-google-sign-in.md
      F3-supabase-db.md
      F4-signing-and-version.md
      design/
        screens.md            # danh sách màn: Đăng nhập, 5 tab trống, Cài đặt (tài khoản + đăng xuất)
        db.md                 # bảng profiles, user_settings: cột, RLS
        build.md              # keystore, versionCode, cách build trên PC/laptop
```

**Cách viết:** gạch đầu dòng ngắn, bám mục tiêu chính, không lan man.

- [x] Viết `docs/specs/index.md`, gộp từ 3 file cũ:
  - từ `features.md`: sản phẩm và quyết định;
  - từ `backlog.md`: quy tắc sprint và danh sách sprint;
  - từ spec GĐ1: kiến trúc chung, danh sách bảng dự kiến, các quy tắc đã chốt cho S2–S9 (âm lịch, lặp, sync Google, nhắc nhở). Mỗi quy tắc ghi 1–2 dòng dưới sprint tương ứng.
- [x] Tạo `docs/specs/sprint-1/`, gồm `index.md`, F1–F4 và `design/` (`screens.md`, `db.md`, `build.md`).
  - `screens.md` chỉ ghi danh sách màn, mục đích và thành phần chính của từng màn.
  - Mockup giao diện để sang bước thiết kế, có todo riêng.
- [x] Xoá 3 file cũ: `docs/features.md`, `docs/backlog.md`, `docs/specs/2026-10-09-giai-doan-1-design.md`.
- [x] Viết `docs/index.md` mô tả cây tài liệu.
- [x] Sửa link:
  - `README.md` trỏ sang `docs/index.md` và `docs/specs/index.md`;
- [x] Kiểm tra: không còn link hỏng (grep các đường dẫn `.md`), không còn nội dung trùng giữa các file.
- [x] Commit `docs: restructure specs as tree, add sprint-1 docs` kèm Co-Authored-By, push.
