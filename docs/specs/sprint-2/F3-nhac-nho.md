# F3 — Nhắc nhở + công tắc Cho phép thông báo

Thuộc: [Sprint 2](index.md).

## Mục tiêu

- Event nhắc bằng thông báo trên máy, kể cả khi app đóng.
- User bật/tắt toàn bộ thông báo trong Cài đặt; event chỉ được nhắc khi công tắc bật.

## Logic

### Mốc nhắc

- Mỗi event 0–5 mốc, không trùng. Lựa chọn: Đúng giờ · 5 phút · 10 phút · 30 phút · 1 giờ · 2 giờ · 1 ngày · 2 ngày · 1 tuần trước. Event có giờ và cả ngày dùng cùng danh sách.
- Công tắc **"Cài đặt nhắc nhở"** trong form: bật = event có nhắc (theo các mốc); tắt = không nhắc, ẩn danh sách mốc. Tắt rồi bật lại trong cùng lần sửa → hiện lại các mốc cũ.
- Event có giờ: mốc tính từ giờ bắt đầu.
- Event cả ngày: mốc tính từ **9:00** ngày bắt đầu (vd "1 ngày trước" = 9:00 hôm trước).
- Event lặp: mỗi lần lặp nhắc theo cùng mốc; ngoại lệ `override` có mốc riêng.
- Event mới: công tắc bật, 1 mốc "15 phút trước" (mốc 15 phút chỉ có ở mặc định, không có trong danh sách chọn). Bật công tắc khi chưa có mốc nào → thêm "15 phút trước".
- Event Google (khi đồng bộ bật): mốc lấy từ nhắc `popup` của Google ([F4](F4-google-calendar.md#map-trường)).

### Đặt thông báo

- Local notification bằng `expo-notifications`, code ở `lib/notifications/`.
- Mỗi máy tự đặt thông báo cho máy đó, từ dữ liệu DB (2 máy cùng tài khoản → cả 2 máy cùng nhắc).
- Chỉ đặt cho **30 ngày tới**, tối đa **60 thông báo** chờ (giới hạn hệ điều hành; iOS ≤ 64). Quá 60 → lấy 60 mốc gần nhất.
- Đặt lại toàn bộ (huỷ hết → đặt mới) khi: mở app / về foreground, lưu/xoá event, đồng bộ Google xong, đổi công tắc, đăng nhập. Đăng xuất → huỷ hết.
- Hàm chọn mốc (`event + khoảng ngày → danh sách {thời điểm, eventId, ngày lần lặp}`) là hàm thuần, có test.
- Hạn chế: không mở app quá 30 ngày → hết thông báo đã đặt (không hiện chú thích trong app).
- Nội dung thông báo: tiêu đề event · "10:00 – 11:00" hoặc "Cả ngày". Bấm → mở Chi tiết event đúng lần lặp.
- Android: kênh thông báo "Nhắc sự kiện", mức cao (có tiếng). Dùng exact alarm nếu máy cho; không cho → thông báo có thể trễ vài phút (chấp nhận).

### Công tắc Cho phép thông báo

- Lưu `user_settings.notifications_enabled` (mặc định bật) → giữ khi đổi máy.
- Bật:
  - Chưa có quyền hệ điều hành → xin quyền (Android 13+ `POST_NOTIFICATIONS`).
  - Từ chối → công tắc vẫn bật trong DB, hiện dòng cảnh báo "Thông báo đang bị chặn" + nút "Mở cài đặt máy". Vẫn lưu nhắc cho event ([Spec tổng §5](../index.md#5-xử-lý-lỗi-chung)).
  - Có quyền → đặt lại toàn bộ thông báo.
- Tắt → huỷ toàn bộ thông báo đã đặt trên máy; mốc nhắc trong event vẫn giữ.
- Công tắc tắt: form event vẫn sửa được mốc nhắc, hiện chú thích "Thông báo đang tắt trong Cài đặt".

## Luồng

```text
Lưu event → đặt lại thông báo → đến giờ → thông báo → bấm → Chi tiết event
Cài đặt → Cho phép thông báo: tắt → huỷ hết | bật → (xin quyền) → đặt lại
Lần đầu tạo event có nhắc, chưa có quyền → xin quyền
```

## Mô tả

- Form event, mục Nhắc nhở:
  - Dòng "Cài đặt nhắc nhở": icon lịch-chuông · nhãn · icon `!` · công tắc.
  - Mỗi mốc 1 dòng: icon đồng hồ · "15 phút trước" · ✕ xoá.
  - "+ Thêm nhắc nhở" → sheet từ đáy: **Huỷ bỏ** · "Chọn nhắc nhở lúc" · **Hoàn tất** · danh sách mốc cuộn được, mốc đang chọn có ✓ · chọn 1 mốc / lần. Mốc đã có trong event không hiện lại. Đủ 5 mốc → ẩn "+ Thêm nhắc nhở".
  - Bấm `!` → hộp: "Trên một số máy, nhắc nhở có thể không chạy nếu bật tối ưu hoá pin. Hãy tắt tối ưu hoá pin cho Daynest." + nút **Loại trừ** → mở màn tối ưu pin của Android cho app.
- Cài đặt: xem [F6](F6-cai-dat.md).

## Không làm

- Nhắc dạng báo thức, âm thanh/rung tuỳ chỉnh, giờ nhắc tổng hằng ngày, push từ server.

## Test

- Chọn mốc: event có giờ, cả ngày, lặp, ngoại lệ `skip`/`override`; giới hạn 30 ngày / 60 mốc; mốc đã qua không đặt.
- Máy thật: nhắc khi app đóng; tắt công tắc → không nhắc; từ chối quyền → cảnh báo hiện.
