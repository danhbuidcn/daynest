# Todo

## 2026-10-08 — Khởi tạo repo + liệt kê tính năng — ✅ xong

App quản lý cá nhân "tất cả trong một", tùy chỉnh cao. Monorepo gồm 4 thư mục: `api/`, `web/`, `app/`, `docs/`.
Git setup giống `password-vault-android`: remote SSH `github-personal`, user `danhbuidcn`, branch `main`.

### A. Khung repo

- [x] Tạo thư mục `api/`, `web/`, `app/` (mỗi thư mục có `.gitkeep` vì chưa chọn stack).
- [x] `README.md` ngắn: mục tiêu app, cấu trúc 4 thư mục, link `docs/features.md`.
- [x] `.gitignore` tối thiểu: `node_modules/`, `.env*`, `build/`, `dist/`, `.DS_Store`, `.idea/`. Bổ sung khi chọn stack.

### B. `docs/features.md` — danh sách tính năng theo module

| Module | Tính năng |
| --- | --- |
| Daily note | Nhật ký/ghi chú mỗi ngày, tag, tìm kiếm, đính kèm ảnh |
| Thể dục thể thao | Ghi buổi tập (môn, thời lượng, ghi chú), lịch tập, streak |
| Task hằng ngày | Checklist ngày, task lặp lại, tick hoàn thành |
| Chi tiêu | Ghi thu/chi, danh mục, chụp ảnh bill/hóa đơn, biểu đồ theo tháng |
| Học tập | Lộ trình (vd: IELTS 6.5 / 120 ngày), bài học, link tài liệu, tiến độ |
| Nhắc nhở | Thông báo hằng ngày, đặt giờ, lặp lại — dùng chung cho mọi module |
| Thống kê / Dashboard | Màn tổng quan hôm nay, biểu đồ tuần/tháng cho từng module |
| Tùy chỉnh | Bật/tắt module, tự thêm danh mục/trường dữ liệu, sắp xếp dashboard |

- Mỗi module ghi: mô tả ngắn + danh sách tính năng.
- Cột "Ưu tiên" (MVP / Sau) để trống — bạn chọn sau khi đọc file.
- Chưa ghi stack, kiến trúc, data model (bước sau).

### C. Git + push GitHub

- [x] Bạn đã tạo repo `danhbuidcn/personal-hub` (public). Remote đã có 1 commit `Initial commit` với `README.md` (`# personal-hub`).
- [x] `git init -b main`, set local `user.name=danhbuidcn`, `user.email=danhbuidcn@gmail.com`.
- [x] `git remote add origin git@github-personal:danhbuidcn/personal-hub.git` (alias SSH key cá nhân, giống `password-vault-android`; `git@github.com:` trên máy này dùng key công ty).
- [x] `git fetch origin` + `git checkout main` để nối tiếp commit có sẵn (không force push).
- [x] Ghi đè `README.md` bằng nội dung ở mục A.
- [x] Commit `docs: init repo structure and feature list` (có dòng Co-Authored-By), push `main`.
- [x] Kiểm tra: `git log`, `git status` sạch, `git ls-remote origin` thấy `main`.
