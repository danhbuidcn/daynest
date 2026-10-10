# Màn hình — Sprint 2

Thuộc: [Sprint 2](../index.md). Mockup: [mockups.html](mockups.html) (mở bằng trình duyệt). Màu, chữ, thành phần: [design-system.md](../../design-system.md).

| # | Màn | Route | Mục đích | Thành phần chính | Chức năng |
| --- | --- | --- | --- | --- | --- |
| 1 | Lịch — Tháng | `(tabs)/calendar` | Xem tháng | Header (‹ tháng ›, Hôm nay, chọn chế độ) · hàng thứ · lưới 6×7 | [F1](../F1-calendar.md) |
| 2 | Lịch — Tuần | `(tabs)/calendar` | Xem tuần | Header · 7 hàng ngày + thẻ event · bấm hàng ngày (ngoài thẻ) → form event, Cả ngày bật | [F1](../F1-calendar.md) |
| 3 | Lịch — Ngày | `(tabs)/calendar` | Xem theo giờ | Header · dòng Cả ngày · lưới giờ · vạch giờ hiện tại · bấm giờ trống / dòng Cả ngày → form event điền sẵn (3b, 3c) | [F1](../F1-calendar.md) |
| 4 | Lịch — Danh sách | `(tabs)/calendar` | Xem 1 ngày dạng danh sách | Thanh ngày ngang · danh sách event | [F1](../F1-calendar.md) |
| 5 | Chọn chế độ xem | — | Đổi chế độ | Thanh chọn luôn hiện dưới header: Tháng · Danh sách · Tuần · Ngày | [F1](../F1-calendar.md) |
| 6 | Chọn tháng/năm | — | Nhảy nhanh | Hộp: năm ‹ › + lưới 12 tháng | [F1](../F1-calendar.md) |
| 7 | Pop-up ngày | — | Event của 1 ngày | Hộp giữa màn cỡ lớn (cách mép 12, cao ≤ 85%): ✕ · ngày dương + âm + can chi · tên lễ · danh sách event · nút `+` · mở khi bấm ô có event/lễ, hoặc bấm `+` giữa ô trống đang chọn | [F1](../F1-calendar.md) |
| 8 | Pop-up `+` | — | Tạo nhanh | Hộp giữa màn (như màn 6): 2 nút Sự kiện · Ghi chú | [F2](../F2-event.md), [F5](../F5-notes.md) |
| 9 | Form event | `event/edit` | Tạo/sửa | ✕ · Lưu · tiêu đề · chi tiết · cả ngày · thời gian · nhắc · lặp · màu | [F2](../F2-event.md), [F3](../F3-reminders.md) |
| 10 | Chọn lặp | — | Kiểu lặp | Hộp: Không lặp · Ngày · Tuần · Tháng · Năm · **Năm (âm lịch)** · ô N · ngày kết thúc | [F2](../F2-event.md#lặp) |
| 11 | Chọn mốc nhắc | — | Thêm mốc | Sheet từ đáy: Huỷ bỏ · "Chọn nhắc nhở lúc" · Hoàn tất · Đúng giờ … 1 tuần trước, ✓ mốc đang chọn | [F3](../F3-reminders.md#mô-tả) |
| 11b | Mẹo tối ưu pin | — | Nhắc chạy ổn định | Hộp từ icon `!`: giải thích + nút Loại trừ | [F3](../F3-reminders.md#mô-tả) |
| 12 | Chọn ngày / giờ | — | Nhập thời gian | Picker ngày + giờ của hệ điều hành | [F2](../F2-event.md) |
| 13 | Chi tiết event | `event/[id]` | Xem | Màu + tiêu đề · thời gian + ngày âm · lặp · nhắc · chi tiết · nhãn Google / Chỉ trên Daynest · ⋯ Sửa, Xoá | [F2](../F2-event.md), [F4](../F4-google-calendar.md) |
| 14 | Hỏi lần lặp | — | Sửa/xoá event lặp | Hộp: Chỉ lần này · Tất cả · Huỷ | [F2](../F2-event.md#ngoại-lệ-sửaxoá-1-lần-lặp) |
| 15 | Xung đột | — | Sửa ở máy khác | Hộp: "Đã thay đổi ở thiết bị khác" · Tải bản mới · Ghi đè | [F2](../F2-event.md), [F5](../F5-notes.md) |
| 16 | Quản lý — Notes | `(tabs)/manage` | Danh sách note | Tiêu đề · ô tìm · chip danh mục · lưới 2 cột thẻ note (mỗi thẻ có `⋯`: Xoá, Di chuyển đến) · `⋯` góc trên phải (Danh mục, Thùng rác) | [F5](../F5-notes.md) |
| 17 | Editor note | `note/[id]` | Viết note | ‹ · chip danh mục · ⋯ · tiêu đề · nội dung · checklist | [F5](../F5-notes.md) |
| 18 | Danh mục | `note/categories` | Quản lý danh mục | Danh sách (chấm màu + tên + số ghi chú + icon bút) · `⋯` góc trên phải: Chọn để xoá · nút Thêm danh mục | [F5](../F5-notes.md#danh-mục) |
| 18b | Chọn để xoá | — | Xoá nhiều | Thanh trên: ✕ · "Đã chọn n" · ô tick tròn mỗi dòng · nút đáy Xoá (n) màu `error` | [F5](../F5-notes.md#danh-mục) |
| 18c | Xác nhận xoá danh mục | — | Tránh bấm nhầm | Hộp: "Xoá n danh mục?" · "m ghi chú bên trong cũng sẽ bị xoá." · Huỷ / Xoá | [F5](../F5-notes.md#danh-mục) |
| 19 | Sửa danh mục | — | Tên + màu | Hộp: ô tên · 6 chấm màu · Huỷ / Lưu (không có nút xoá) | [F5](../F5-notes.md#danh-mục) |
| 20 | Thùng rác | `note/trash` | Note đã xoá | Danh sách · Khôi phục · Xoá vĩnh viễn · nút Xoá tất cả (góc trên phải) |
| 20b | Xác nhận xoá tất cả | — | Tránh bấm nhầm | Hộp: "Xoá vĩnh viễn tất cả?" (không có dòng mô tả) · Huỷ / Xoá tất cả | [F5](../F5-notes.md#thùng-rác) |
| 21 | Cài đặt (thêm nhóm) | `(tabs)/settings` | Cài đặt mới | Tài khoản (+ Thiết bị đăng nhập) · Thông báo · Lịch (+ Múi giờ: hộp chọn có tìm kiếm) · Google Calendar | [F6](../F6-settings.md) |
| 22 | Đồng bộ Google | — | Tiến độ lần đầu | Hộp: "Đang đồng bộ 120/300" + thanh tiến độ | [F4](../F4-google-calendar.md) |
| 23 | Bị đăng xuất (máy cũ) | — | Báo máy bị đá | Hộp trên màn Đăng nhập: icon thiết bị · "Bạn đã bị đăng xuất" · lý do tối đa 2 thiết bị · Đã hiểu | [F7](../F7-device-limit.md) |
| 24 | Đã đăng xuất máy cũ (máy mới) | — | Báo máy mới | Hộp trên Tab Lịch: "Đã đăng xuất thiết bị cũ" · "<Tên máy> đã bị đăng xuất." · Đã hiểu | [F7](../F7-device-limit.md) |
| 25 | Thiết bị đăng nhập | `settings/devices` | Xem máy đang đăng nhập | Danh sách ≤ 2 máy (tên, ngày đăng nhập, dùng lần cuối, nhãn Thiết bị đang dùng) · chú thích | [F7](../F7-device-limit.md) |

- Màn có route (9, 13, 17, 18, 20, 25): màn con, vuốt mép trái để quay lại.
- Hộp chọn / hộp xác nhận: theo design-system (đã có ở S1).
- Thành phần mới: [design-system § Thành phần thêm ở S2](../../design-system.md#thành-phần-thêm-ở-s2).
- Tab Thống kê: vẫn màn trống (S4).

## Giới hạn ký tự và hiển thị chữ dài

Quy tắc chung: [design-system § Chữ dài](../../design-system.md#chữ-dài).

| Field | Giới hạn (nhập trong app) |
| --- | --- |
| Tiêu đề event | 1–100 |
| Chi tiết event | ≤ 2000 |
| Tiêu đề note | ≤ 200 |
| Nội dung note | ≤ 20.000 |
| Mục checklist | ≤ 200 / mục, ≤ 100 mục / note |
| Tên danh mục | 1–30 |
| Ô tìm kiếm note | ≤ 100 |
| Số N lặp | 1–99 |

- Event kéo từ Google có thể dài hơn: giới hạn DB riêng ([F4](../F4-google-calendar.md#map-trường)).

| Chỗ hiện | Cách hiện |
| --- | --- |
| Thanh lễ, thẻ lễ (tháng, tuần, ngày, danh sách) | Dùng tên rút gọn (vd "Phụ nữ"); bấm vào mở pop-up ngày xem tên đầy đủ |
| Thanh event (ô tháng) | 1 dòng, cắt thẳng ở mép (không `…`) |
| Thẻ event (tuần, danh sách, pop-up ngày) | Tiêu đề 1 dòng · chi tiết 1 dòng, cắt thẳng ở mép (không `…`) |
| Khối event (xem ngày) | Tiêu đề xuống dòng vừa chiều cao khối, dư thì cắt thẳng (không `…`) |
| Chi tiết event, editor note, mục checklist trong editor | Hiện hết, xuống dòng, cuộn màn |
| Ô tiêu đề (form event, editor note) | Tự giãn tối đa 3 dòng, quá thì cuộn trong ô |
| Ô chi tiết event | Tự giãn tối đa 6 dòng, quá thì cuộn trong ô |
| Thẻ note | Tiêu đề 1 dòng `…` · nội dung 3 dòng `…` |
| Chip danh mục, tên danh mục trong dòng | 1 dòng `…` · chip rộng tối đa 140 |
| Tên trong hộp xác nhận (vd "Xoá danh mục …?") | Tối đa 2 dòng `…` |
| Tên + email ở thẻ tài khoản, tên máy (thiết bị đăng nhập) | 1 dòng `…` |
| Thông báo nhắc (hệ điều hành) | Hệ điều hành tự cắt |
| Toast | Tối đa 2 dòng `…` |
