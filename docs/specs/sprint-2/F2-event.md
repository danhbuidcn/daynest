# F2 — Event: form, lặp dương + âm, ngoại lệ

Thuộc: [Sprint 2](index.md).

## Mục tiêu

- Tạo/sửa/xoá event; lặp theo lịch dương và âm; sửa/xoá riêng 1 lần lặp.

## Logic

### Trường

| Trường | Quy tắc |
| --- | --- |
| Tiêu đề | Bắt buộc, 1–100 ký tự, cắt khoảng trắng 2 đầu |
| Chi tiết | Không bắt buộc, ≤ 2000 ký tự |
| Cả ngày | Bật → chọn ngày bắt đầu–kết thúc · tắt → chọn ngày + giờ bắt đầu–kết thúc |
| Thời gian | Kết thúc ≥ bắt đầu, nếu không: báo lỗi dưới ô, khoá Lưu |
| Màu | 1 trong 6 màu event ([design-system](../design-system.md#màu)), mặc định `mint` |
| Lặp | Xem [Lặp](#lặp) |
| Nhắc | Xem [F3](F3-nhac-nho.md) |

- Tạo mới: ngày = ngày đang chọn trên lịch; giờ bắt đầu = giờ tròn kế tiếp, kéo dài 1 giờ; nhắc mặc định 15 phút trước.
- Event có giờ lưu `timestamptz`; cả ngày lưu `date` (không lệch ngày khi đổi múi giờ).

### Lặp

| Kiểu | Lịch | Quy tắc |
| --- | --- | --- |
| Không lặp | — | Mặc định |
| Hằng ngày | Dương | Mỗi N ngày |
| Hằng tuần | Dương | Mỗi N tuần, cùng thứ với ngày bắt đầu |
| Hằng tháng | Dương | Mỗi N tháng, cùng ngày · tháng không có ngày đó → bỏ lần đó |
| Hằng năm | Dương | Mỗi N năm, cùng ngày/tháng · 29/2 chỉ năm nhuận |
| **Hằng năm âm lịch** (ngày giỗ) | Âm | Mỗi năm, cùng ngày/tháng âm · chỉ tháng thường, không lấy tháng nhuận · ngày 30 gặp tháng thiếu → 29 |

- N: 1–99. Kết thúc lặp: "Không bao giờ" hoặc "Đến ngày" (chọn ngày ≥ ngày bắt đầu).
- Chọn "Hằng năm âm lịch": app lấy ngày/tháng âm từ ngày bắt đầu, lưu `lunar_day`, `lunar_month`.
- DB lưu **1 dòng quy tắc**, không lưu từng lần. `lib/recurrence/` (hàm thuần) trải ra các lần trong khoảng ngày cần xem, rồi áp ngoại lệ.
- Hộp chọn lặp giống [Cute 13](../../research/cute-calendar/screenshots/13-event-repeat.png): tab kiểu · ô số N · ô "Chọn ngày kết thúc lặp" · thêm 1 lựa chọn riêng **"Hằng năm (âm lịch)"** — hiện luôn ngày âm sẽ lặp, vd "Lặp mỗi năm vào 18/8 âm lịch".

### Ngoại lệ (sửa/xoá 1 lần lặp)

- Sửa/xoá event lặp → hỏi "Chỉ lần này" / "Tất cả".
- Chỉ lần này:
  - Sửa → lưu ngoại lệ `override` cho ngày gốc của lần đó (tiêu đề, chi tiết, màu, thời gian, nhắc).
  - Xoá → lưu ngoại lệ `skip`.
- Tất cả:
  - Sửa → sửa dòng quy tắc; giữ các ngoại lệ đã có. Đổi kiểu lặp hoặc ngày bắt đầu → xoá ngoại lệ (ngày gốc không còn khớp), báo trước trong hộp xác nhận.
  - Xoá → xoá dòng quy tắc + mọi ngoại lệ.

### Lưu an toàn (nhiều máy, nhiều user)

- App tự sinh `id` (uuid) lúc mở form tạo → bấm Lưu 2 lần / gửi lại khi mạng chập chờn không tạo trùng (upsert theo `id`).
- Sửa: gửi kèm `updated_at` đã đọc; DB chỉ cập nhật khi `updated_at` khớp. Không khớp → hộp "Đã thay đổi ở thiết bị khác": **Tải bản mới** (bỏ thay đổi của mình) / **Ghi đè** (lưu bản của mình).
- Lưu lỗi → toast, giữ form ([Spec tổng §5](../index.md#5-xử-lý-lỗi-chung)).
- Đồng bộ Google bật → sau khi lưu DB, đẩy lên Google ([F4](F4-google-calendar.md)).

## Luồng

```text
`+` → Event / sheet ngày → `+` → Form tạo → Lưu → đóng form, lịch cập nhật, toast "Đã lưu"
Bấm event → Chi tiết → ⋯ → Sửa → Form sửa → Lưu
                         └ Xoá → (lặp: Chỉ lần này / Tất cả) → xác nhận → xoá
Đóng form khi đã nhập → hỏi "Bỏ thay đổi?"
```

## Mô tả

- Form (sheet toàn màn, giống [Cute 12](../../research/cute-calendar/screenshots/12-create-event-more.png)): ✕ · tiêu đề "Event" · nút Lưu · ô Tiêu đề · ô Chi tiết · Cả ngày + 2 dòng bắt đầu/kết thúc · Nhắc nhở (công tắc "Cài đặt nhắc nhở" + danh sách mốc + "Thêm nhắc nhở", [F3](F3-nhac-nho.md#mô-tả)) · Lặp lại · Màu (6 chấm).
- Chi tiết ([Cute 18b](../../research/cute-calendar/screenshots/18b-event-detail.png)): chấm màu + tiêu đề · thời gian (+ ngày âm) · lặp · nhắc · chi tiết · nhãn "Google" nếu đã đồng bộ · menu ⋯: Sửa, Xoá.
- Giờ hiện theo cài đặt 24 giờ.

## Không làm

- Vị trí, URL, đếm ngược, nhắc dạng báo thức, sticker, "Sao chép đến", màu tự chọn, chọn nhiều thứ trong tuần, lặp hằng tháng âm lịch, lặp theo thứ (vd "thứ Hai đầu tiên").

## Trường hợp biên

Test tự động `lib/recurrence/`:

- Hằng tháng từ 31/1 → bỏ 28/2, 30/4…; có 31/3.
- Hằng năm từ 29/2/2024 → 2028, 2032 (bỏ 2025–2027).
- Mỗi 2 tuần, đến ngày → lần cuối đúng ngày kết thúc.
- Hằng năm âm 30/12 → năm tháng Chạp thiếu ra 29/12.
- Hằng năm âm 15/4 năm 2020 (có tháng 4 nhuận) → chỉ 1 lần, tháng 4 thường.
- Event cả ngày nhiều ngày + lặp; ngoại lệ `skip` và `override` đúng lần.
