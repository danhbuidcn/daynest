# 2026-10-09 — Đổi tên thành Daynest + thu hẹp phạm vi — ✅ xong

**Đã chốt:**
- Tên: **Daynest**. Repo `daynest`, package `com.danhbuidcn.daynest`.
- Sản phẩm chỉ còn 2 phần:
  - **Ghi chú:** note, diary, todo, chi tiêu.
  - **Lịch:** âm lịch, dương lịch, event, nhắc nhở, **chu kỳ kinh nguyệt** (cho user nữ).
- Bỏ các module Học tập, Thể dục, Task hằng ngày (đã gộp vào todo), Dashboard, Tùy chỉnh.

**Giả định:**
- Phạm vi GĐ1 theo spec giữ nguyên.
- Chi tiêu (gồm đọc bill bằng AI) và chu kỳ kinh nguyệt làm sau GĐ1.

- [x] **Bạn làm:** đổi tên repo trên GitHub: Settings → Repository name → `daynest`. Máy chưa có `gh` nên tôi không tự đổi được. GitHub tự chuyển hướng URL cũ.
- [x] Đổi remote sang `git@github-personal:danhbuidcn/daynest.git`, rồi chạy `git fetch` để kiểm tra.
- [x] `README.md`:
  - đổi tiêu đề thành `# Daynest`;
  - viết lại mô tả theo 2 phần Ghi chú và Lịch.
- [x] `docs/features.md`, viết lại theo 2 phần:
  - **Ghi chú:**
    - Note, Diary, Todo: lấy nội dung từ Daily note và Task hằng ngày.
    - Chi tiêu: giữ nội dung cũ.
    - Thống kê: thống kê todo, mood, chi tiêu.
  - **Lịch:**
    - Event, lịch âm, lặp âm lịch, Google Calendar.
    - Nhắc nhở: lấy từ module Nhắc nhở cũ.
    - **Chu kỳ kinh nguyệt** (mục mới, chỉ ghi ý chính, chi tiết sẽ brainstorm riêng):
      - ghi ngày bắt đầu và kết thúc kỳ;
      - dự đoán kỳ tiếp theo và ngày rụng trứng từ độ dài trung bình các kỳ trước;
      - hiện trên lịch;
      - nhắc trước kỳ;
      - chỉ bật khi giới tính trong hồ sơ là nữ.
  - Xoá các mục Học tập, Thể dục, Task hằng ngày, Dashboard, Tùy chỉnh.
  - Bảng Quyết định thêm 2 dòng:
    - Tên / package;
    - Dữ liệu sức khoẻ: Google Play và App Store bắt buộc có chính sách quyền riêng tư và khai báo dữ liệu sức khoẻ.
  - Thứ tự làm: GĐ1 → Chi tiêu, Chu kỳ → web.
- [x] Spec `docs/specs/2026-10-09-giai-doan-1-design.md`:
  - thêm tên app và package vào mục Quyết định;
  - sửa mục "Ngoài GĐ1": bỏ Học tập và Dashboard, thêm Chu kỳ kinh nguyệt.
- [x] Tạo `docs/backlog.md`, cách làm theo Scrum:
  - Mỗi sprint đi đủ vòng docs → thiết kế → code.
  - Cuối mỗi sprint phải có bản chạy được trên Android.
  - Thứ tự sprint:

    | Sprint | Nội dung |
    | --- | --- |
    | S1 | Nền móng: khung Expo + dev build, điều hướng 5 tab (màn trống), đăng nhập Google qua Supabase (giữ phiên, đăng xuất), DB tối thiểu `profiles` + `user_settings` + RLS |
    | S2 | Lịch tháng: dương, âm, ngày lễ |
    | S3 | Event đơn giản |
    | S4 | Lặp dương lịch + nhắc nhở + xem tuần/ngày |
    | S5 | Lặp âm lịch + ngoại lệ |
    | S6 | Kéo Google Calendar |
    | S7 | Todo |
    | S8 | Notes |
    | S9 | Diary + Thống kê + Cài đặt (xong GĐ1) |
    | Sau GĐ1 | Chi tiêu, Chu kỳ kinh nguyệt, web |

  - Mỗi sprint thêm bảng DB của riêng nó qua migration.
- [x] Spec: thay mục 9 "Mốc M1–M6" bằng link tới `docs/backlog.md`.
- [x] Không sửa các mục cũ trong todo, vì đó là lịch sử.
- [x] Commit `docs: rename project to Daynest and narrow scope` kèm Co-Authored-By, push.
  - Chỉ add các file trên (gồm `docs/backlog.md`) và `wip/` (`todo.md` đã đổi tên thành `todo_list.md`).
  -
- [ ] Kiểm tra:
  - [x] `grep -ri personal-hub` chỉ còn trong các mục cũ của todo;
  - [x] `git fetch` qua remote mới chạy được.
- [x] **Bạn làm sau khi đóng phiên (không bắt buộc):** đổi tên thư mục local (bạn đã đổi 2026-10-09) thành `~/Documents/daynest`. Memory của Claude Code gắn với đường dẫn thư mục, nên đổi thư mục thì phải chép thư mục memory sang tên mới.

**Quy trình đã chốt:** docs → thiết kế → code.
- Sau khi xong đợt đổi tên, bước tiếp theo là **Sprint 1: docs → thiết kế → code**.
- Todo của bước thiết kế viết riêng, bạn duyệt rồi mới làm.
- Implementation plan chỉ viết sau khi thiết kế xong.
