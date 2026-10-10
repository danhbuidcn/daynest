# F4 — Đồng bộ Google Calendar (2 chiều, khi bật)

Thuộc: [Sprint 2](index.md).

## Mục tiêu

- Bật đồng bộ → event Daynest và event trên **lịch chính** Google khớp nhau 2 chiều.
- Tắt đồng bộ → 2 bên độc lập, không ảnh hưởng nhau.

## Quyết định (bạn chốt)

| Câu hỏi | Chốt |
| --- | --- |
| Đồng bộ khi nào | Chỉ khi bật trong Cài đặt; mặc định tắt |
| Lịch Google | Lịch chính (primary) của tài khoản Google đăng nhập |
| Phạm vi đồng bộ (2 chiều) | Event của **năm hiện tại** + event **lặp lại** còn lần diễn ra trong năm hiện tại (dù bắt đầu từ năm trước) — xem [Phạm vi](#phạm-vi) |
| Lúc bật | Đẩy event Daynest **trong phạm vi** lên Google |
| Lúc tắt | Event lấy từ Google **giữ lại** thành event thường của Daynest |
| Event lặp âm (ngày giỗ) | **Không đẩy** lên Google, chỉ ở Daynest |

## Logic

### Phạm vi

Event thuộc phạm vi khi có ít nhất 1 lần diễn ra trong năm hiện tại (1/1 → 31/12):

| Loại | Thuộc phạm vi khi |
| --- | --- |
| Không lặp | Có ngày nằm trong năm hiện tại (event nhiều ngày: chỉ cần chạm năm) |
| Lặp dương | Bắt đầu ≤ 31/12 năm nay **và** (không có ngày kết thúc **hoặc** kết thúc ≥ 1/1 năm nay) → đồng bộ **cả chuỗi** (1 quy tắc lặp), kể cả các lần ở năm khác |
| Lặp âm | Không đồng bộ (chỉ ở Daynest) |

- Kéo về: `events.list` với `timeMin`/`timeMax` của năm và `singleEvents=false` → Google tự trả cả event lặp bắt đầu từ năm trước nhưng còn lần trong năm nay.
- Event đã liên kết (có `google_event_id`) vẫn đồng bộ khi sửa/xoá, dù sửa ra ngoài phạm vi.
- Event mới ngoài phạm vi (vd tạo cho năm sau) → chưa đẩy; sang năm đó thì đẩy.

### Quyền + token

- Scope `https://www.googleapis.com/auth/calendar.events` (đọc + ghi event), xin thêm lúc bật đồng bộ: `GoogleSignin.addScopes`.
- Access token: `GoogleSignin.getTokens()` trên máy; SDK tự làm mới. Không lưu token Google vào DB.
- Gọi Google Calendar REST API thẳng từ app (`lib/google/`), không qua server.

### Bật đồng bộ (lần đầu hoặc bật lại)

1. Xin scope. Từ chối → công tắc về tắt, toast "Cần cho phép truy cập Google Calendar".
2. **Kéo** event lịch chính trong [phạm vi](#phạm-vi) (`timeMin` 1/1, `timeMax` 1/1 năm sau, `singleEvents=false`) → upsert vào Daynest theo `google_event_id`.
3. **Đẩy** event Daynest trong phạm vi, chưa có `google_event_id` (trừ lặp âm) lên Google.
4. Lưu `syncToken` + năm đã kéo vào `google_sync_state`.

- Hiện tiến độ: hộp "Đang đồng bộ Google Calendar" · "Gồm sự kiện năm 2026 và các sự kiện lặp lại." · thanh tiến độ "120 / 300". Gián đoạn (mất mạng, đóng app) → lần đồng bộ sau làm tiếp phần còn `pending`.
- Bật lại sau khi đã tắt: event đã có `google_event_id` được ghép lại, không tạo bản trùng.

### Đang bật

| Chiều | Khi nào | Cách làm |
| --- | --- | --- |
| Daynest → Google | Ngay sau khi lưu/xoá event vào DB (event trong phạm vi hoặc đã liên kết) | `insert` / `patch` / `delete` trên Google. Lỗi → đánh dấu `pending`, đẩy lại ở lần đồng bộ sau |
| Google → Daynest | Mở app / về foreground (nếu lần kéo trước > 5 phút) · kéo xuống ở Lịch · "Đồng bộ ngay" | `events.list` với `syncToken` → chỉ lấy phần thay đổi. `cancelled` → xoá ở Daynest. Event ngoài phạm vi → bỏ qua |

- `410 Gone` (token hết hạn) → kéo lại toàn bộ năm, ghép theo `google_event_id`.
- Sang năm mới → kéo toàn bộ phạm vi năm mới + đẩy event Daynest mới vào phạm vi.
- Mỗi lần kéo xong → đặt lại thông báo ([F3](F3-reminders.md)), làm mới lịch.

### Không trùng, không mất (nhiều máy)

- Đẩy event mới: dùng luôn `id` Daynest (uuid bỏ dấu `-`, hợp lệ với quy tắc id Google) làm `id` event Google → gửi lại hoặc 2 máy cùng đẩy chỉ tạo 1 event (`409` = đã có, coi như xong).
- Kéo về: upsert theo khoá duy nhất `(user_id, google_event_id)` → 2 máy cùng kéo không tạo trùng.
- Sửa ở cả 2 bên giữa 2 lần đồng bộ → **bản sửa sau cùng thắng** (so `updated` của Google với `updated_at` Daynest).
- Đẩy `patch` kèm `etag` (`If-Match`); `412` → kéo bản mới rồi áp luật "sửa sau cùng thắng".

### Map trường

| Daynest | Google |
| --- | --- |
| Tiêu đề / Chi tiết | `summary` / `description` |
| Cả ngày `start_date`–`end_date` (tính cả ngày cuối) | `start.date`–`end.date` (ngày cuối **không** tính → +1 ngày) |
| Có giờ `starts_at`–`ends_at` | `start.dateTime`–`end.dateTime` |
| Màu mint · sky · lavender · pink · peach · lemon | `colorId` 2 · 7 · 1 · 4 · 6 · 5 |
| — | `colorId` khác → màu gần nhất: 10→mint, 9→sky, 3→lavender, 11→pink, 8→sky · không có → mint |
| Mốc nhắc (phút) | `reminders.overrides` kiểu `popup` · `useDefault` → lấy `defaultReminders` trong kết quả `events.list` |
| Nhắc event cả ngày (tính từ 9:00) | Google tính từ 0:00 → phút Google = phút Daynest − 540 · ra số âm (vd "Đúng giờ" = 9:00 cùng ngày) → không đẩy mốc đó, chỉ nhắc ở Daynest |
| Lặp dương ngày/tuần/tháng/năm, mỗi N, đến ngày | `RRULE:FREQ=…;INTERVAL=N;UNTIL=…` |
| Ngoại lệ `override` / `skip` | Sửa / xoá instance (`recurringEventId` + `originalStartTime`) |
| Lặp năm âm lịch | Không đẩy · nhãn "Chỉ trên Daynest" |

- Chữ dài: tiêu đề > 1000 hoặc chi tiết > 8000 ký tự (giới hạn DB) → cắt lúc kéo về, đánh dấu chỉ xem (`google_readonly`), không đẩy bản cắt ngược lên Google. Tiêu đề 101–1000 ký tự: xem bình thường; sửa trong app phải rút gọn ≤ 100 mới lưu được (báo lỗi dưới ô).
- `RRULE` Google ngoài kiểu Daynest (vd `BYDAY` nhiều thứ, `BYSETPOS`) → lấy các lần trong năm bằng `events.instances`, lưu từng lần, **chỉ xem** trong app (nhãn "Sửa trên Google Calendar"). `COUNT` → đổi thành ngày kết thúc.
- Event Google không thuộc user (lời mời từ người khác): sửa/xoá trong app theo quyền Google; Google từ chối → toast lỗi, kéo lại bản gốc.

### Tắt đồng bộ

- Ngừng đẩy/kéo; xoá `syncToken`. Không xoá gì trên Google lẫn Daynest.
- Event lấy từ Google ở lại Daynest như event thường; giữ `google_event_id` để lần bật sau ghép lại.
- Không thu hồi scope (bật lại không phải xin lại).

### Xoá

- Đồng bộ bật, xoá event → hộp xác nhận ghi thêm "Cũng xoá trên Google Calendar".

### Lỗi

- Token lỗi → thử lại 1 lần, rồi báo "Cần kết nối lại Google" + nút kết nối lại ([Spec tổng §5](../index.md#5-xử-lý-lỗi-chung)).
- `429` / `403 rateLimitExceeded` → chờ tăng dần rồi thử lại (lúc đẩy hàng loạt).

## Luồng

```text
Cài đặt → Google Calendar → bật "Đồng bộ" → xin quyền → kéo + đẩy event năm nay và event lặp → "Đã đồng bộ lúc 10:20"
Lưu event (đang bật) → DB → Google
Mở app / kéo xuống / Đồng bộ ngay → kéo thay đổi từ Google → lịch + thông báo cập nhật
Tắt "Đồng bộ" → 2 bên độc lập
```

## Mô tả

- Cài đặt: xem [F6](F6-settings.md#google-calendar).
- Event đã đồng bộ: icon Google nhỏ ở pop-up ngày + Chi tiết. Event `pending`: icon đồng hồ nhỏ.

## Không làm

- Lịch Google khác ngoài lịch chính, nhiều tài khoản Google, đẩy event lặp âm, đồng bộ event không lặp ngoài năm hiện tại, sửa event có `RRULE` phức tạp, đồng bộ nền khi app đóng, push từ Google (webhook).

## Test

- Hàm map 2 chiều (`lib/google/`): cả ngày (ngày cuối +1), có giờ, màu, nhắc cả ngày, `RRULE` đơn giản + phức tạp + `COUNT`, instance ngoại lệ.
- Hàm phạm vi: không lặp trong/ngoài năm, nhiều ngày vắt qua 31/12, lặp bắt đầu năm trước còn/hết lần trong năm nay, lặp âm.
- Luật "sửa sau cùng thắng"; ghép lại khi bật lại; `id` đẩy trùng → `409` coi như xong.
- Máy thật: tạo/sửa/xoá ở Daynest → thấy trên Google; tạo/sửa/xoá trên Google → kéo về thấy; tắt → sửa 1 bên, bên kia không đổi.
