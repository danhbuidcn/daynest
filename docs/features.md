# Danh sách tính năng

App quản lý cá nhân "tất cả trong một", dùng trên web và mobile. Mỗi module bật/tắt được và tùy chỉnh được.

Cột **Ưu tiên**: điền `MVP` (làm trước) hoặc `Sau`. Hiện để trống, chờ chốt.

## Tổng quan module

| # | Module | Mô tả | Ưu tiên |
| --- | --- | --- | --- |
| 1 | Daily note | Nhật ký, ghi chú mỗi ngày | |
| 2 | Thể dục thể thao | Ghi lại buổi tập, theo dõi đều đặn | |
| 3 | Task hằng ngày | Checklist việc cần làm mỗi ngày | |
| 4 | Chi tiêu | Ghi thu/chi, lưu bill, biểu đồ theo tháng | |
| 5 | Học tập | Lộ trình học, bài học, tiến độ | |
| 6 | Nhắc nhở | Thông báo hằng ngày, dùng chung cho mọi module | |
| 7 | Thống kê / Dashboard | Tổng quan hôm nay, biểu đồ tuần/tháng | |
| 8 | Tùy chỉnh | Bật/tắt module, tự thêm danh mục và trường dữ liệu | |

## 1. Daily note

Tham khảo app Cute Calendar: [research/cute-calendar/features.md](research/cute-calendar/features.md).

- Tạo note theo ngày: tiêu đề, nội dung.
- Gắn tag.
- Đính kèm ảnh.
- Tìm kiếm theo từ khóa, tag, ngày.
- Xem note theo lịch.

## 2. Thể dục thể thao

- Ghi buổi tập: môn, thời lượng, cường độ, ghi chú.
- Danh sách môn tự thêm (chạy bộ, gym, bơi...).
- Lịch tập theo tuần.
- Streak: số ngày tập liên tiếp.
- Thống kê thời lượng theo tuần/tháng.

## 3. Task hằng ngày

- Checklist task theo ngày, tick hoàn thành.
- Task lặp lại: hằng ngày, theo thứ trong tuần.
- Task chưa xong tự chuyển sang ngày sau (tùy chọn).
- Tỉ lệ hoàn thành theo ngày/tuần.

## 4. Chi tiêu

- Ghi khoản thu/chi: số tiền, ngày, danh mục, ghi chú.
- Danh mục tự thêm (ăn uống, đi lại, học tập...).
- Chụp ảnh bill/hóa đơn, gắn vào khoản chi.
- Biểu đồ chi tiêu theo tháng, theo danh mục.
- Tổng thu, tổng chi, chênh lệch mỗi tháng.

## 5. Học tập

- Tạo lộ trình học (vd: IELTS 6.5 trong 120 ngày).
- Chia lộ trình thành ngày/bài học, gắn link tài liệu (vd: Study4).
- Checklist học mỗi ngày, tick hoàn thành.
- Học từ vựng: thêm từ mới, ôn lại theo lịch (spaced repetition).
- Phiên học Pomodoro.
- Tiến độ: ngày thứ mấy / tổng số ngày, % hoàn thành.

## 6. Nhắc nhở

- Đặt nhắc theo giờ, lặp lại hằng ngày hoặc theo thứ.
- Gắn nhắc với task, buổi tập, bài học.
- Thông báo trên mobile; web hiển thị trong app.

## 7. Thống kê / Dashboard

- Màn "Hôm nay": task, bài học, buổi tập, chi tiêu trong ngày.
- Biểu đồ tuần/tháng cho từng module.
- Streak và tỉ lệ hoàn thành tổng hợp.

## 8. Tùy chỉnh

- Bật/tắt từng module.
- Tự thêm danh mục, tag, trường dữ liệu riêng.
- Sắp xếp các khối trên dashboard.
- Giao diện sáng/tối.

## Chưa quyết định

- Chọn module nào cho MVP.
- Stack: api, web, app.
- Lưu dữ liệu: server riêng hay cloud; có cần dùng offline không.
- Đồng bộ dữ liệu giữa web và mobile.
