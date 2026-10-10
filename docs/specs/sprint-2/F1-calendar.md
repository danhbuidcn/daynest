# F1 — Lịch: 4 chế độ xem, lịch âm, ngày lễ

Thuộc: [Sprint 2](index.md).

## Mục tiêu

- Xem lịch dương + âm + ngày lễ VN, kèm event, ở 4 chế độ: tháng, tuần, ngày, danh sách.

## Logic

### Lịch âm

- Tự viết theo thuật toán Hồ Ngọc Đức, múi giờ +7, ở `lib/lunar/` (hàm thuần, không gọi mạng).
- Hỗ trợ năm 1900–2100.
- Hàm chính:
  - `toLunar(date) → { day, month, year, leap }`.
  - `toSolar(lunarDay, lunarMonth, lunarYear, leap) → date`.
  - `lunarMonthLength(month, year, leap) → 29 | 30`.
  - `canChiYear(year)` → vd "Bính Ngọ".
- Ngày âm tính theo ngày dương trên máy, không đổi theo múi giờ máy (lịch âm VN luôn +7).

### Ngày lễ

- Cố định trong code, `lib/holidays/`, có tên EN + VI.
- Dương: 1/1 Tết Dương lịch · 3/2 Thành lập Đảng · 14/2 Valentine · 8/3 Quốc tế Phụ nữ · 30/4 Giải phóng miền Nam · 1/5 Quốc tế Lao động · 1/6 Quốc tế Thiếu nhi · 2/9 Quốc khánh · 20/10 Phụ nữ Việt Nam · 20/11 Nhà giáo Việt Nam · 24/12 Đêm Giáng sinh · 25/12 Giáng sinh.
- Âm: Giao thừa (ngày cuối tháng Chạp) · mùng 1–3 tháng Giêng Tết Nguyên Đán · 15/1 Rằm tháng Giêng · 10/3 Giỗ Tổ Hùng Vương · 15/4 Phật Đản · 5/5 Tết Đoan Ngọ · 15/7 Vu Lan · 15/8 Trung thu · 23/12 Ông Công Ông Táo.
- Ngày lễ âm chỉ tính tháng thường, không tính tháng nhuận.

### Tải event

- Mỗi chế độ xem tính khoảng ngày đang hiện, rồi tải event trong khoảng đó (+ khoảng liền trước/sau để vuốt mượt). Không tải toàn bộ event.
- Event lặp: DB trả quy tắc; app tự trải ra các lần trong khoảng ([F2](F2-event.md#lặp)).
- Cache bằng TanStack Query theo khoá `['events', from, to]`; lưu/xoá event → làm mới các khoá liên quan.
- Online-only: mất mạng vẫn xem được dữ liệu đã cache, có banner ([Spec tổng §5](../index.md#5-xử-lý-lỗi-chung)).

### Tuỳ chọn hiển thị

- Tuần bắt đầu từ, múi giờ (cho "Hôm nay" + giờ event), 24 giờ, hiện ngày âm, hiện ngày lễ: lấy từ `user_settings` ([F6](F6-settings.md)).
- Chế độ xem lần cuối: lưu trên máy (AsyncStorage). Mở app → mở lại chế độ đó.

## Luồng

```text
Tab Lịch → chế độ lần cuối (mặc định Tháng)
  Header: [‹] Tháng 10, 2026 [›] · Hôm nay · thanh chọn chế độ ngay dưới
  Vuốt trái/phải → kỳ sau/trước · bấm tiêu đề → chọn tháng/năm
  Tháng: bấm ô có event/lễ → pop-up ngày · bấm ô trống → chọn ô, hiện nút `+` giữa ô → bấm `+` → pop-up ngày
  Tuần/Ngày/Danh sách: bấm event → Chi tiết event
  Kéo xuống → đồng bộ Google (khi bật, [F4](F4-google-calendar.md))
```

## Mô tả

| Chế độ | Bố cục |
| --- | --- |
| Tháng | Lưới 6 tuần × 7 · ô: số dương, ngày âm nhỏ · ngày lễ hiện thành 1 thanh như thanh event (nền `error`, chữ trắng, không bấm được) xếp đầu · tối đa 3 thanh (kể cả thanh lễ) + "+N" · hôm nay khoanh `primary` · ngày tháng khác mờ · CN và ngày lễ chữ `error` |
| Tuần | Thanh chọn tuần · mỗi ngày 1 hàng: thứ + ngày dương/âm + thẻ event, nhiều event quá 1 hàng thì cuộn ngang trong hàng đó |
| Ngày | Dòng "Cả ngày" + lưới giờ 0–23 · event là khối theo giờ, trùng giờ xếp cạnh nhau · vạch giờ hiện tại |
| Danh sách | Thanh chọn ngày ngang (1 tuần) · danh sách event ngày đã chọn theo giờ |

- Ngày âm trong ô: mùng 1 và rằm kèm tháng âm (`1/8`, `15/8`), ngày khác chỉ hiện số ngày. Tháng nhuận thêm "N" (vd `1/6N`).
- Event nhiều ngày: hiện ở mọi ô nó phủ.
- Chọn ô trống (giống app lịch cài sẵn trên máy): lần bấm đầu chỉ chọn ô và hiện nút `+` tròn `primary` đặt chính giữa ô (cả chiều ngang lẫn dọc); bấm `+` mới mở pop-up ngày. Ô có event hoặc ngày lễ: bấm là mở pop-up ngay.
- Pop-up ngày (hộp giữa màn, cỡ lớn: cách mép 12, cao tối đa 85% màn, danh sách cuộn): "Thứ Sáu, 9/10/2026" · "29/8 năm Bính Ngọ" · danh sách event — ngày lễ xếp đầu (chấm `error`, không bấm được), rồi event (giờ, chấm màu, tiêu đề, icon lặp/nhắc/Google) · nút `+` tạo event ngày đó. Không có event/lễ → "Chưa có sự kiện".
- Chế độ xem lần cuối được nhớ trên máy: mở lại app vào đúng chế độ đó. Vuốt trái/phải đổi 1 tuần (Tuần, Danh sách) hoặc 1 ngày (Ngày); bấm event mở Chi tiết.
- Tắt ngày âm / ngày lễ trong Cài đặt → ẩn khỏi mọi chế độ xem.

## Không làm

- Thời tiết, sticker, theme/font, tìm kiếm event, số tuần, widget.

## Test

- `lunar`: Tết 2020–2030 đúng ngày dương; năm có tháng nhuận 2020 (4 nhuận), 2023 (2 nhuận), 2025 (6 nhuận); đổi qua lại dương ↔ âm 1900–2100 khớp nhau.
- `holidays`: lễ âm rơi đúng ngày dương các năm 2024–2027; Giao thừa năm tháng Chạp thiếu (29) và đủ (30).
- Lưới tháng: tuần bắt đầu Thứ 2 / CN; tháng 2 năm nhuận.
