# Danh sách tính năng

**Daynest** — app cá nhân, mobile (Android + iOS) trước, web sau. Có 2 phần: **Ghi chú** và **Lịch**.

Cập nhật 2026-10-09: đổi tên từ personal-hub, thu hẹp phạm vi. Bỏ các module Học tập, Thể dục, Dashboard, Tùy chỉnh; Task hằng ngày gộp vào Todo.

Thứ tự làm: **Giai đoạn 1** ([spec](specs/2026-10-09-giai-doan-1-design.md)) → Chi tiêu, Chu kỳ kinh nguyệt → web. Chia sprint: [backlog.md](backlog.md).

Tham khảo thiết kế: [Cute Calendar](research/cute-calendar/features.md), Memrise (`research/memrise/`).

## Tổng quan

| Phần | Tính năng | Giai đoạn |
| --- | --- | --- |
| Ghi chú | Note | GĐ1 |
| Ghi chú | Diary | GĐ1 |
| Ghi chú | Todo | GĐ1 |
| Ghi chú | Thống kê (todo, mood) | GĐ1 |
| Ghi chú | Chi tiêu + thống kê chi tiêu | Sau GĐ1 |
| Lịch | Lịch dương + âm, ngày lễ | GĐ1 |
| Lịch | Event, lặp dương + âm (ngày giỗ) | GĐ1 |
| Lịch | Nhắc nhở | GĐ1 |
| Lịch | Kéo Google Calendar (1 chiều) | GĐ1 |
| Lịch | Chu kỳ kinh nguyệt | Sau GĐ1 |

## 1. Ghi chú

### Note

- Tiêu đề, nội dung, checklist, danh mục tự tạo (màu), ghim, tìm kiếm, thùng rác.
- **Sau:** định dạng chữ, vẽ tay, ghi âm, khoá note, xuất PDF, nền note, sticker.

### Diary

- Mỗi ngày 1 diary: nội dung, mood (5 mức), ảnh, ghim. Mood hiện trên lịch.

### Todo

- Tiêu đề, hạn, ghim, subtask, % hoàn thành tự tính.
- Lọc: quá hạn / hôm nay / tuần / tháng.
- **Sau:** todo lặp lại (hằng ngày, theo thứ), tự chuyển todo chưa xong sang ngày sau.

### Chi tiêu — sau GĐ1

- Ghi khoản thu/chi: số tiền, ngày, danh mục, ghi chú.
- Danh mục tự tạo, có icon và màu.
- Chụp ảnh bill/hóa đơn, gắn vào khoản chi.
- **Đọc bill bằng AI:** gửi ảnh → Go API gọi Claude API → trả số tiền, ngày, cửa hàng, gợi ý danh mục. Người dùng sửa lại trước khi lưu.
- Biểu đồ theo tháng: tổng thu, tổng chi, chia theo danh mục.
- **Sau nữa:** ngân sách tháng + cảnh báo, nhiều ví/tài khoản.

### Thống kê

- GĐ1: todo theo tháng (xong / chưa xong), mood theo tháng.
- Sau: chi tiêu theo tháng và danh mục.

## 2. Lịch

### Lịch dương + âm

- Xem tháng / tuần / ngày / danh sách.
- Mỗi ngày hiện ngày âm và ngày lễ Việt Nam (dương + âm).

### Event

- Tiêu đề, ghi chú, cả ngày hoặc giờ bắt đầu–kết thúc, màu.
- Lặp: ngày / tuần / tháng / năm dương / **năm âm** (ngày giỗ).
- Sửa/xoá event lặp: "chỉ lần này" hoặc "tất cả".

### Nhắc nhở

- Thông báo trên mobile: nhắc event (nhiều mốc), nhắc viết diary hằng ngày.
- Web: chỉ hiển thị trong app, không push. **Sau:** web push.

### Google Calendar

- Đăng nhập Google, kéo event từ các lịch Google đã chọn về app (1 chiều).
- Event Google chỉ đọc trong app.

### Chu kỳ kinh nguyệt — sau GĐ1

Chỉ ghi ý chính; chi tiết brainstorm riêng khi làm.

- Chỉ bật khi giới tính trong hồ sơ là nữ.
- Ghi ngày bắt đầu và kết thúc kỳ.
- Dự đoán kỳ tiếp theo và ngày rụng trứng từ độ dài trung bình các kỳ trước.
- Hiện trên lịch, nhắc trước kỳ.

## Quyết định

| Chủ đề | Chốt | Lý do |
| --- | --- | --- |
| Tên | **Daynest**. Repo `daynest`, package `com.danhbuidcn.daynest` | Tên tiếng Anh, chưa thấy app trùng; package không đổi được sau khi lên store |
| Phạm vi | Chỉ 2 phần: Ghi chú + Lịch | Tập trung, đổi 2026-10-09 |
| Nền tảng | Mobile trước (GĐ1), web làm sau | Giảm khối lượng GĐ1; nhắc nhở cần mobile |
| Mobile | Android + iOS | Không khoá vào 1 hệ điều hành; dự định lên Google Play + App Store |
| Quy trình | Scrum, sprint nhỏ; mỗi sprint docs → thiết kế → code | Có bản chạy được sau mỗi sprint |
| Người dùng | Thiết kế nhiều user, GĐ1 chỉ 1 user | Thêm cột user từ đầu rẻ hơn sửa sau |
| Offline | Không — online-only | Đồng bộ offline tốn công, dễ lỗi |
| `app/` | React Native + Expo (TypeScript) | Có sẵn notification/camera/OTA |
| `web/` | Nuxt 3 + Nuxt UI | Quen từ dự án khác |
| `api/` | Go, chạy trên nền Supabase. GĐ1 chưa dùng Go | App gọi thẳng Supabase (RLS) là đủ cho GĐ1; Go cho việc cần server sau này |
| Đọc bill | Claude API, gọi từ Go | Bill tiếng Việt nhiều định dạng; trả dữ liệu có cấu trúc; API key nằm ở server |
| Google Calendar | Đồng bộ 1 chiều: app kéo về, event Google chỉ đọc | Mọi thao tác làm trong app; tránh xung đột |
| Dữ liệu sức khoẻ | Chu kỳ kinh nguyệt cần chính sách quyền riêng tư + khai báo dữ liệu sức khoẻ trên Google Play và App Store | Bắt buộc khi publish |
