# 2026-10-08 — Ghi kết quả làm rõ MVP vào docs — ✅ xong

- [x] `docs/features.md`:
  - Điền cột Ưu tiên: **MVP** = Daily note, Học tập, Chi tiêu, Nhắc nhở, Dashboard. **Sau** = Thể dục, Task hằng ngày, Tùy chỉnh.
  - Thêm thứ tự làm: Daily note + Học tập trước → Chi tiêu + Dashboard sau.
  - Viết lại từng module MVP theo tính năng đã chốt; đánh dấu phần "Sau" trong module:
    - Daily note: Diary (mood, ảnh) + Notes (danh mục, checklist, ghim, tìm kiếm) + Event trên lịch (lặp, nhắc, màu). Sau: vẽ tay, ghi âm, khoá note, PDF.
    - Học tập: lộ trình, checklist bài học có link + %, nhập lộ trình từ file (CSV/Markdown), streak + thống kê. Sau: từ vựng spaced repetition, Pomodoro.
    - Chi tiêu: thu/chi, danh mục tự tạo, chụp bill, biểu đồ tháng, đọc bill bằng AI (Claude API qua Go). Sau: ngân sách, nhiều ví.
    - Dashboard: màn Hôm nay, thống kê học tập, thống kê chi tiêu. Sau: mood, tuỳ chỉnh khối.
    - Nhắc nhở: thông báo mobile (event, nhắc học, nhắc viết diary); web chỉ hiện trong app.
  - Thay mục "Chưa quyết định" bằng **"Quyết định"** (bảng: chủ đề → chốt → lý do ngắn):
    - Nền tảng: web + mobile cùng lúc; mobile Android + iOS.
    - Người dùng: thiết kế nhiều user, MVP 1 user.
    - Dữ liệu: online-only, không offline.
    - Stack: app Expo (React Native, TS) · web Nuxt 3 + Nuxt UI · api Go trên nền Supabase (Postgres, Auth, Storage) · OCR Claude API gọi từ Go.
- [x] `README.md`: thêm cột Công nghệ vào bảng cấu trúc.
- [x] Commit `docs: define MVP scope and tech stack` + Co-Authored-By, push `main`.
