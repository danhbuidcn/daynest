# Màn hình — Sprint 2

Thuộc: [Sprint 2](../index.md). Mockup: bước 2 (chưa làm). Màu, chữ, thành phần: [design-system.md](../../design-system.md).

| # | Màn | Route | Mục đích | Thành phần chính | Chức năng |
| --- | --- | --- | --- | --- | --- |
| 1 | Lịch — Tháng | `(tabs)/calendar` | Xem tháng | Header (‹ tháng ›, Hôm nay, chọn chế độ) · hàng thứ · lưới 6×7 | [F1](../F1-lich.md) |
| 2 | Lịch — Tuần | `(tabs)/calendar` | Xem tuần | Header · 7 hàng ngày + thẻ event | [F1](../F1-lich.md) |
| 3 | Lịch — Ngày | `(tabs)/calendar` | Xem theo giờ | Header · dòng Cả ngày · lưới giờ · vạch giờ hiện tại | [F1](../F1-lich.md) |
| 4 | Lịch — Danh sách | `(tabs)/calendar` | Xem 1 ngày dạng danh sách | Thanh ngày ngang · danh sách event | [F1](../F1-lich.md) |
| 5 | Chọn chế độ xem | — | Đổi chế độ | Hộp chọn: Tháng · Tuần · Ngày · Danh sách | [F1](../F1-lich.md) |
| 6 | Chọn tháng/năm | — | Nhảy nhanh | Hộp: năm ‹ › + lưới 12 tháng | [F1](../F1-lich.md) |
| 7 | Sheet ngày | — | Event của 1 ngày | Ngày dương + âm + can chi · tên lễ · danh sách event · nút `+` | [F1](../F1-lich.md) |
| 8 | Sheet `+` | — | Tạo nhanh | 2 nút: Event · Note | [F2](../F2-event.md), [F5](../F5-notes.md) |
| 9 | Form event | `event/edit` | Tạo/sửa | ✕ · Lưu · tiêu đề · chi tiết · cả ngày · thời gian · nhắc · lặp · màu | [F2](../F2-event.md), [F3](../F3-nhac-nho.md) |
| 10 | Chọn lặp | — | Kiểu lặp | Hộp: Không lặp · Ngày · Tuần · Tháng · Năm · **Năm (âm lịch)** · ô N · ngày kết thúc | [F2](../F2-event.md#lặp) |
| 11 | Chọn mốc nhắc | — | Thêm mốc | Sheet từ đáy: Huỷ bỏ · "Chọn nhắc nhở lúc" · Hoàn tất · Đúng giờ … 1 tuần trước, ✓ mốc đang chọn | [F3](../F3-nhac-nho.md#mô-tả) |
| 11b | Mẹo tối ưu pin | — | Nhắc chạy ổn định | Hộp từ icon `!`: giải thích + nút Loại trừ | [F3](../F3-nhac-nho.md#mô-tả) |
| 12 | Chọn ngày / giờ | — | Nhập thời gian | Picker ngày + giờ của hệ điều hành | [F2](../F2-event.md) |
| 13 | Chi tiết event | `event/[id]` | Xem | Màu + tiêu đề · thời gian + ngày âm · lặp · nhắc · chi tiết · nhãn Google / Chỉ trên Daynest · ⋯ Sửa, Xoá | [F2](../F2-event.md), [F4](../F4-google-calendar.md) |
| 14 | Hỏi lần lặp | — | Sửa/xoá event lặp | Hộp: Chỉ lần này · Tất cả · Huỷ | [F2](../F2-event.md#ngoại-lệ-sửaxoá-1-lần-lặp) |
| 15 | Xung đột | — | Sửa ở máy khác | Hộp: "Đã thay đổi ở thiết bị khác" · Tải bản mới · Ghi đè | [F2](../F2-event.md), [F5](../F5-notes.md) |
| 16 | Quản lý — Notes | `(tabs)/manage` | Danh sách note | Tiêu đề · ô tìm · chip danh mục · lưới 2 cột thẻ note · ⋯ | [F5](../F5-notes.md) |
| 17 | Editor note | `note/[id]` | Viết note | ‹ · chip danh mục · ⋯ · tiêu đề · nội dung · checklist | [F5](../F5-notes.md) |
| 18 | Danh mục | `note/categories` | Quản lý danh mục | Danh sách (chấm màu + tên) · thêm · sửa · xoá | [F5](../F5-notes.md#danh-mục) |
| 19 | Sửa danh mục | — | Tên + màu | Hộp: ô tên · 6 chấm màu · Huỷ / Lưu | [F5](../F5-notes.md#danh-mục) |
| 20 | Thùng rác | `note/trash` | Note đã xoá | Danh sách · Khôi phục · Xoá vĩnh viễn · Dọn thùng rác | [F5](../F5-notes.md#thùng-rác) |
| 21 | Cài đặt (thêm nhóm) | `(tabs)/settings` | Cài đặt mới | Thông báo · Lịch · Google Calendar | [F6](../F6-cai-dat.md) |
| 22 | Đồng bộ Google | — | Tiến độ lần đầu | Hộp: "Đang đồng bộ 120/300" + thanh tiến độ | [F4](../F4-google-calendar.md) |

- Màn có route (9, 13, 17, 18, 20): màn con, vuốt mép trái để quay lại.
- Hộp chọn / hộp xác nhận: theo design-system (đã có ở S1).
- Thành phần mới (vẽ ở bước 2, thêm vào design-system): ô lịch tháng, thanh event, thẻ event, sheet từ đáy, công tắc, chip danh mục, thẻ note, dòng checklist.
- Tab Thống kê: vẫn màn trống (S4).
