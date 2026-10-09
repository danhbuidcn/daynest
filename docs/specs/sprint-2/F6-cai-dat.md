# F6 — Cài đặt mới

Thuộc: [Sprint 2](index.md).

## Mục tiêu

- Thêm vào Cài đặt các mục cho Lịch, Thông báo, Google Calendar.

## Logic

| Nhóm | Mục | Kiểu | Mặc định | Lưu ở | Chi tiết |
| --- | --- | --- | --- | --- | --- |
| Thông báo | Cho phép thông báo | Công tắc | Bật | `user_settings.notifications_enabled` | [F3](F3-nhac-nho.md#công-tắc-cho-phép-thông-báo) |
| Lịch | Tuần bắt đầu từ | Hộp chọn: Thứ Hai / Chủ nhật | Thứ Hai | `user_settings.week_start` (có từ S1) | [F1](F1-lich.md) |
| Lịch | Định dạng 24 giờ | Công tắc | Bật | `user_settings.use_24h` (có từ S1) | Tắt → "4:54 CH" / "4:54 PM" |
| Lịch | Hiện ngày âm | Công tắc | Bật | `user_settings.show_lunar` | [F1](F1-lich.md) |
| Lịch | Hiện ngày lễ | Công tắc | Bật | `user_settings.show_holidays` | [F1](F1-lich.md) |
| Google Calendar | Đồng bộ với Google Calendar | Công tắc | Tắt | `google_sync_state.enabled` | [F4](F4-google-calendar.md) |

- Đổi → áp dụng ngay trên màn, lưu DB. Lưu lỗi → trả về giá trị cũ, toast lỗi (cùng cách đổi ngôn ngữ ở S1).
- Cài đặt nằm trên DB → đăng nhập máy khác vẫn giữ.

### Google Calendar

- Tắt: dòng công tắc + chú thích "Đồng bộ 2 chiều với lịch chính của <email Google>".
- Bật: thêm 2 dòng:
  - "Đồng bộ ngay" — bấm → đồng bộ, hiện vòng xoay.
  - "Lần đồng bộ cuối" — vd "Hôm nay 10:20" · có event `pending` → "Còn 3 sự kiện chưa đồng bộ".
- Lỗi token → dòng cảnh báo "Cần kết nối lại Google" + bấm để kết nối lại.
- Tắt công tắc → hộp xác nhận "Tắt đồng bộ? Sự kiện đã có vẫn còn ở cả Daynest và Google. Từ giờ, sửa ở bên này sẽ không đổi bên kia."

## Mô tả

Thứ tự trên màn Cài đặt (thêm vào giữa nhóm Tài khoản và nhóm Ứng dụng của S1):

```text
Thẻ tài khoản
Tài khoản: Đăng nhập bằng
Thông báo: Cho phép thông báo · (cảnh báo bị chặn + Mở cài đặt máy) · chú thích 30 ngày
Lịch: Tuần bắt đầu từ · Định dạng 24 giờ · Hiện ngày âm · Hiện ngày lễ
Google Calendar: Đồng bộ · Đồng bộ ngay · Lần đồng bộ cuối
Ứng dụng: Ngôn ngữ · Phiên bản
Đăng xuất
```

- Dòng công tắc: dùng `SettingRow` + công tắc bên phải ([design-system](../design-system.md#thành-phần-thêm-ở-s2)).
- Tham khảo: [Cute 70](../../research/cute-calendar/screenshots/70-settings.png), [75](../../research/cute-calendar/screenshots/75-settings-notification.png).

## Không làm

- Định dạng ngày, số tuần, chế độ xem mặc định (dùng chế độ lần cuối), giờ nhắc tổng, sáng/tối, màu chính.
