# Danh sách tính năng

App quản lý cá nhân "tất cả trong một", dùng trên web và mobile. Mỗi module bật/tắt được và tùy chỉnh được.

Cột **Ưu tiên**: `MVP` (làm trước) hoặc `Sau`. Chốt ngày 2026-10-08.

## Tổng quan module

| # | Module | Mô tả | Ưu tiên |
| --- | --- | --- | --- |
| 1 | Daily note | Diary, ghi chú, event trên lịch | MVP — đợt 1 |
| 2 | Thể dục thể thao | Ghi lại buổi tập, theo dõi đều đặn | Sau |
| 3 | Task hằng ngày | Checklist việc cần làm mỗi ngày | Sau |
| 4 | Chi tiêu | Ghi thu/chi, lưu bill, biểu đồ theo tháng | MVP — đợt 2 |
| 5 | Học tập | Lộ trình học, bài học, tiến độ | MVP — đợt 1 |
| 6 | Nhắc nhở | Thông báo hằng ngày, dùng chung cho mọi module | MVP — đi kèm module dùng nó |
| 7 | Thống kê / Dashboard | Tổng quan hôm nay, biểu đồ tuần/tháng | MVP — đợt 2 |
| 8 | Tùy chỉnh | Bật/tắt module, tự thêm danh mục và trường dữ liệu | Sau |

**Thứ tự làm** (cập nhật 2026-10-09): **Giai đoạn 1** = app lịch kiểu Cute Calendar (Lịch, Event, Todo, Notes, Diary, lịch âm, Google Calendar) trên mobile — spec: [specs/2026-10-09-giai-doan-1-design.md](specs/2026-10-09-giai-doan-1-design.md). Sau đó: Học tập → Chi tiêu + Dashboard → web.

## 1. Daily note

Tham khảo app Cute Calendar: [research/cute-calendar/features.md](research/cute-calendar/features.md).

**MVP:**

- **Diary:** mỗi ngày viết nhật ký, chọn mood (5 mức), đính kèm ảnh, ghim.
- **Notes:** ghi chú tự do không gắn ngày — tiêu đề, nội dung, checklist, danh mục tự tạo, ghim, tìm kiếm.
- **Event trên lịch:** tiêu đề, giờ bắt đầu/kết thúc hoặc cả ngày, lặp lại (ngày/tuần/tháng/năm), nhắc nhở, màu.
- **Lịch:** xem tháng/tuần/ngày; mỗi ngày hiện event + mood diary.

**Sau:** vẽ tay, ghi âm, khoá note, xuất PDF, nền note, sticker.

## 2. Thể dục thể thao — Sau

- Ghi buổi tập: môn, thời lượng, cường độ, ghi chú.
- Danh sách môn tự thêm (chạy bộ, gym, bơi...).
- Lịch tập theo tuần.
- Streak: số ngày tập liên tiếp.
- Thống kê thời lượng theo tuần/tháng.

## 3. Task hằng ngày — Sau

- Checklist task theo ngày, tick hoàn thành.
- Task lặp lại: hằng ngày, theo thứ trong tuần.
- Task chưa xong tự chuyển sang ngày sau (tùy chọn).
- Tỉ lệ hoàn thành theo ngày/tuần.

## 4. Chi tiêu

**MVP:**

- Ghi khoản thu/chi: số tiền, ngày, danh mục, ghi chú.
- Danh mục tự tạo, có icon và màu.
- Chụp ảnh bill/hóa đơn, gắn vào khoản chi.
- **Đọc bill bằng AI:** gửi ảnh → Go API gọi Claude API → trả số tiền, ngày, cửa hàng, gợi ý danh mục. Người dùng sửa lại trước khi lưu. Dùng được trên cả web và mobile.
- Biểu đồ theo tháng: tổng thu, tổng chi, chia theo danh mục.

**Sau:** ngân sách tháng + cảnh báo, nhiều ví/tài khoản.

## 5. Học tập

**MVP:**

- **Lộ trình:** tạo khoá học (vd: IELTS 6.5 trong 120 ngày), chia thành ngày/bài học.
- **Checklist bài học hằng ngày:** mỗi bài có link tài liệu (vd: Study4), tick khi xong, % hoàn thành tự tính.
- **Nhập lộ trình từ file** (CSV/Markdown) thay vì gõ tay.
- **Streak + thống kê:** số ngày học liên tiếp, % hoàn thành theo tuần/tháng.

**Sau:** từ vựng ôn theo lịch (spaced repetition), phiên học Pomodoro.

## 6. Nhắc nhở

**MVP:**

- Thông báo trên mobile: nhắc event, nhắc học hằng ngày, nhắc viết diary.
- Đặt giờ, lặp lại.
- Web: chỉ hiển thị trong app, không push.

**Sau:** web push.

## 7. Thống kê / Dashboard

**MVP:**

- Màn "Hôm nay": event, bài học cần làm, diary hôm nay (đã viết chưa), chi tiêu trong ngày.
- Thống kê học tập: streak, % lộ trình, biểu đồ tuần/tháng.
- Thống kê chi tiêu: tổng tháng, biểu đồ theo danh mục.

**Sau:** thống kê mood, bật/tắt và sắp xếp các khối.

## 8. Tùy chỉnh — Sau

- Bật/tắt từng module.
- Tự thêm danh mục, tag, trường dữ liệu riêng.
- Sắp xếp các khối trên dashboard.
- Giao diện sáng/tối, theme.

## Quyết định

| Chủ đề | Chốt | Lý do |
| --- | --- | --- |
| Nền tảng | Mobile trước (GĐ1), web làm sau | Đổi 2026-10-09: giảm khối lượng GĐ1; nhắc nhở cần mobile |
| Mobile | Android + iOS | Không khoá vào 1 hệ điều hành |
| Người dùng | Thiết kế nhiều user, MVP chỉ 1 user | Thêm cột user từ đầu rẻ hơn sửa sau |
| Offline | Không — online-only | Đồng bộ offline tốn công, dễ lỗi |
| `app/` | React Native + Expo (TypeScript) | Cùng TypeScript với web, có sẵn notification/camera/OTA |
| `web/` | Nuxt 3 + Nuxt UI | Quen từ dự án khác |
| `api/` | Go, chạy trên nền Supabase. GĐ1 chưa dùng Go | App gọi thẳng Supabase (RLS) là đủ cho GĐ1; Go cho việc cần server sau này |
| Đọc bill | Claude API, gọi từ Go | Bill tiếng Việt nhiều định dạng; trả dữ liệu có cấu trúc; API key nằm ở server |
| Google Calendar | Đồng bộ 1 chiều: app kéo về, event Google chỉ đọc | Mọi thao tác làm trong app; tránh xung đột |
