# F6 — Cài đặt mới

Thuộc: [Sprint 2](index.md).

## Mục tiêu

- Thêm vào Cài đặt các mục cho Lịch, Thông báo, Google Calendar.

## Logic

| Nhóm | Mục | Kiểu | Mặc định | Lưu ở | Chi tiết |
| --- | --- | --- | --- | --- | --- |
| Thông báo | Cho phép thông báo | Công tắc | Bật | `user_settings.notifications_enabled` | [F3](F3-reminders.md#công-tắc-cho-phép-thông-báo) |
| Lịch | Tuần bắt đầu từ | Hộp chọn: Thứ Hai / Chủ nhật | Thứ Hai | `user_settings.week_start` (có từ S1) | [F1](F1-calendar.md) |
| Lịch | Múi giờ | Hộp chọn có ô tìm kiếm | Việt Nam (GMT+7) | `user_settings.time_zone` | [Múi giờ](#múi-giờ) |
| Lịch | Định dạng 24 giờ | Công tắc | Bật | `user_settings.use_24h` (có từ S1) | Tắt → "4:54 CH" / "4:54 PM" |
| Lịch | Hiện ngày âm lịch | Công tắc | Bật | `user_settings.show_lunar` | [F1](F1-calendar.md) |
| Lịch | Hiện ngày lễ | Công tắc | Bật | `user_settings.show_holidays` | [F1](F1-calendar.md) |
| Google Calendar | Đồng bộ với Google Calendar | Công tắc | Tắt | `google_sync_state.enabled` | [F4](F4-google-calendar.md) |

- Đổi → áp dụng ngay trên màn, lưu DB. Lưu lỗi → trả về giá trị cũ, toast lỗi (cùng cách đổi ngôn ngữ ở S1).
- Cài đặt nằm trên DB → đăng nhập máy khác vẫn giữ.

### Múi giờ

- Mặc định `Asia/Ho_Chi_Minh` (Việt Nam, GMT+7) cho mọi user mới, **không** lấy theo máy.
- Hộp chọn: ô tìm kiếm + danh sách múi giờ IANA cố định trong code (`lib/timezones/`), mỗi dòng "Tên (GMT±h)", dòng đang chọn có ✓. Tên hiện theo ngôn ngữ app.
- App tính theo múi giờ đã chọn, không theo múi giờ máy:
  - "Hôm nay", vạch giờ hiện tại, giờ event có giờ (DB lưu `timestamptz`, hiện đổi theo múi giờ);
  - event cả ngày (`date`) không đổi ngày khi đổi múi giờ;
  - nhắc nhở đặt theo thời điểm tuyệt đối → đổi múi giờ thì giờ hiện đổi, thời điểm báo không đổi;
  - event tạo mới / đẩy lên Google gửi kèm `timeZone` này ([F4](F4-google-calendar.md)).
- Lịch âm **luôn** tính theo +7 dù chọn múi giờ nào (định nghĩa lịch âm Việt Nam, [F1](F1-calendar.md#lịch-âm)).

### Google Calendar

- Tắt: chỉ dòng công tắc.
- Bật: thêm 2 dòng:
  - "Đồng bộ ngay" — bấm → đồng bộ, hiện vòng xoay.
  - "Lần đồng bộ cuối" — vd "Hôm nay 10:20".
- Lỗi token → dòng cảnh báo "Cần kết nối lại Google" + bấm để kết nối lại.
- Tắt công tắc → hộp xác nhận "Tắt đồng bộ? Sự kiện vẫn được giữ ở Daynest và Google, nhưng sẽ không còn được đồng bộ."

## Mô tả

Thứ tự trên màn Cài đặt (thêm vào giữa nhóm Tài khoản và nhóm Ứng dụng của S1):

```text
Thẻ tài khoản
Tài khoản: Đăng nhập bằng · Thiết bị đăng nhập (2/2 ›)
Thông báo: Cho phép thông báo · (cảnh báo bị chặn + Mở cài đặt máy)
Lịch: Tuần bắt đầu từ · Múi giờ · Định dạng 24 giờ · Hiện ngày âm lịch · Hiện ngày lễ
Google Calendar: Đồng bộ · Đồng bộ ngay · Lần đồng bộ cuối
Ứng dụng: Ngôn ngữ · Phiên bản
Đăng xuất
```

- Dòng công tắc: dùng `SettingRow` + công tắc bên phải ([design-system](../design-system.md#thành-phần-thêm-ở-s2)).

- Thiết bị đăng nhập: xem [F7](F7-device-limit.md).

## Không làm

- Định dạng ngày, số tuần, chế độ xem mặc định (dùng chế độ lần cuối), giờ nhắc tổng, sáng/tối, màu chính.
