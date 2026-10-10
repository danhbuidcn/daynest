# 2026-10-09 — Quy trình release: đính kèm APK vào GitHub Release — ✅ xong

Tag chỉ có source code → thêm bước tạo GitHub Release kèm APK (không kèm `.aab`). Dùng `gh` CLI.

- [x] 0. **Bạn làm** (cần sudo + đăng nhập trình duyệt): `sudo apt install gh` → `gh auth login` (GitHub.com, SSH).
- [x] 1. `docs/specs/index.md` §4 "Cuối sprint": thêm bước 7 — `gh release create v<version> app/dist/daynest-<version>-<versionCode>.apk --title v<version> --notes "<tóm tắt>"` · chỉ APK, không `.aab`.
- [x] 2. `CLAUDE.md` (project): thêm "→ GitHub Release kèm APK (`gh release create`)" vào cuối dòng quy trình release.
- [x] 3. Bổ sung release v1.0.1: chạy lệnh ở bước 1 với `daynest-1.0.1-2.apk` (bỏ qua nếu bạn đã tạo tay trên web).
- [x] 4. Kiểm tra: `gh release view v1.0.1` có asset `.apk`.
- [x] 5. Commit `docs: attach apk to github release` (chỉ `CLAUDE.md`), push. Phần `docs/specs/index.md` đang có sửa đổi S2 chưa commit → đi chung commit spec S2 (bước 1 todo S2 bên dưới), không tách hunk.
