# Sprint 2 — Lịch, Event, Notes

Thuộc: [Spec tổng](../index.md) · S2.

## Mục tiêu

- Xem lịch dương + âm + ngày lễ ở 4 chế độ: tháng, tuần, ngày, danh sách.
- Tạo/sửa/xoá event, lặp dương + âm, nhắc bằng thông báo.
- Bật đồng bộ → event Daynest ↔ lịch chính Google Calendar 2 chiều; tắt → 2 bên độc lập.
- Quản lý Notes: checklist, danh mục, ghim, tìm kiếm, thùng rác.
- Chạy đúng khi 100 user dùng cùng lúc, tổng ~10.000 user ([Spec tổng §3](../index.md#mục-tiêu-tải)).

Nguyên tắc: tính năng nào làm ở S2 thì làm trọn phạm vi GĐ1 của tính năng đó.

## Phạm vi

| Mã | Chức năng | Chi tiết |
| --- | --- | --- |
| F1 | Lịch: 4 chế độ xem, lịch âm, ngày lễ | [F1-calendar.md](F1-calendar.md) |
| F2 | Event: form, lặp dương + âm, ngoại lệ | [F2-event.md](F2-event.md) |
| F3 | Nhắc nhở + công tắc Cho phép thông báo | [F3-reminders.md](F3-reminders.md) |
| F4 | Đồng bộ Google Calendar 2 chiều (khi bật) | [F4-google-calendar.md](F4-google-calendar.md) |
| F5 | Notes | [F5-notes.md](F5-notes.md) |
| F6 | Cài đặt mới | [F6-settings.md](F6-settings.md) |
| F7 | Giới hạn 2 thiết bị / tài khoản | [F7-device-limit.md](F7-device-limit.md) |

**Không làm ở S2:** Todo (S3), Diary + Thống kê (S4). Các mục "Không làm" riêng ghi trong từng file F.

## Luồng tổng

```text
Tab Lịch ─ đổi chế độ: Tháng · Tuần · Ngày · Danh sách
  ├─ bấm ngày có event (Tháng) → pop-up ngày → bấm event → Chi tiết → Sửa / Xoá
  │  bấm ngày trống → hiện `+` giữa ô → bấm `+` → pop-up ngày
  │                               └─ `+` → Tạo event (ngày đã chọn)
  └─ kéo xuống → đồng bộ Google (khi bật)
Nút `+` → pop-up: Sự kiện · Ghi chú
Tab Quản lý → Notes → bấm note → Editor (Back = tự lưu)
Cài đặt → Thông báo · Lịch · Google Calendar
Thông báo nhắc → bấm → Chi tiết event
Đăng nhập máy thứ 3 → máy đăng nhập sớm nhất bị đăng xuất (cả 2 máy thấy hộp báo)
```

## Thiết kế

- [Màn hình](design/screens.md)
- [DB](design/db.md)
- [Mockup](design/mockups.html)

## Bạn chuẩn bị

1. Google Cloud (project đang dùng đăng nhập) → bật **Google Calendar API**.
2. OAuth consent screen → thêm scope `https://www.googleapis.com/auth/calendar.events` (vẫn chế độ Testing, email bạn là test user).
3. Nên test bằng 1 tài khoản Google phụ (đồng bộ 2 chiều sẽ đẩy event test lên lịch chính). Trên lịch đó: vài event thường, 1 event lặp, 1 event cả ngày.

## Xong khi (DoD)

- [ ] Lịch tháng hiện đúng ngày âm + ngày lễ; test tự động Tết 2020–2030, năm có tháng nhuận 2020/2023/2025 đều qua.
- [ ] Đổi được 4 chế độ xem; vuốt đổi tháng/tuần/ngày; nút Hôm nay về đúng ngày.
- [ ] Tạo/sửa/xoá event (cả ngày + có giờ); xoá hỏi xác nhận.
- [ ] Event lặp dương (ngày/tuần/tháng/năm, mỗi N, đến ngày) và lặp hằng năm âm lịch (ngày giỗ) hiện đúng; test tự động các trường hợp biên ([F2](F2-event.md#trường-hợp-biên)).
- [ ] Sửa/xoá "Chỉ lần này" / "Tất cả" đúng.
- [ ] Nhận thông báo nhắc trên máy thật (app đóng); bấm thông báo mở đúng event.
- [ ] Tắt "Cho phép thông báo" → không còn thông báo; bật lại → nhắc được đặt lại.
- [ ] Bật đồng bộ → event năm nay của lịch chính Google hiện trong app, event Daynest có sẵn lên Google (trừ lặp âm).
- [ ] Đang bật: tạo/sửa/xoá ở 1 bên → bên kia thấy sau khi đồng bộ; 2 máy cùng đồng bộ không tạo event trùng.
- [ ] Tắt đồng bộ → event giữ nguyên 2 bên, sửa 1 bên không ảnh hưởng bên kia; bật lại không tạo trùng.
- [ ] Notes: tạo, Back tự lưu, checklist, danh mục, ghim, tìm kiếm, thùng rác (khôi phục / xoá vĩnh viễn).
- [ ] Sửa cùng 1 event/note trên 2 máy → máy lưu sau thấy hộp "Đã thay đổi ở thiết bị khác", không mất dữ liệu im lặng.
- [ ] Đăng nhập máy thứ 3 → máy đăng nhập sớm nhất bị đăng xuất, mở app thấy hộp "Bạn đã bị đăng xuất"; máy mới thấy hộp "Đã đăng xuất thiết bị cũ"; Cài đặt → Thiết bị đăng nhập hiện đúng 2 máy.
- [ ] Test RLS mọi bảng mới: user A không đọc/sửa/xoá được dữ liệu user B.
- [ ] Test tải: 100 user giả đồng thời (đọc lịch tháng, ghi event, đọc notes) trên DB local có 10.000 user giả → 0 lỗi, p95 < 1 s.
- [ ] Cuối sprint: release `1.1.0` theo [Spec tổng §4](../index.md#cuối-sprint-mọi-sprint).
