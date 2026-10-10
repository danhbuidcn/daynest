# 2026-10-10 — Xoá research + tên app tham khảo, thêm cài đặt Múi giờ — ✅ xong

**Bạn chốt:** xoá `docs/research/` khỏi mọi commit (xoá luôn trên máy) · xoá mọi chữ "Cute Calendar", "Memrise" · Cài đặt có chỗ đổi múi giờ, mặc định Việt Nam +7.

- [x] 1. `git filter-repo --path docs/research --invert-paths` (backup mirror ở scratchpad) → force push `main` + tag `v1.0.1`.
- [x] 2. Bỏ link `research/` + chữ Cute Calendar / Memrise trong `docs/`, `README.md`, todo này (xoá 2 mục khảo sát 2026-10-08).
- [x] 3. Spec Múi giờ: `F6` (dòng + mục "Múi giờ"), `db.md` (`user_settings.time_zone` mặc định `Asia/Ho_Chi_Minh`), `F1`, Spec tổng §3, `screens.md` màn 21, `mockups.html` (dòng Múi giờ). Lịch âm vẫn luôn +7.
- Làm code: cột ở bước 4 (migration S2), màn chọn múi giờ ở bước 8; bước 3 đọc `time_zone` để tính "Hôm nay".
