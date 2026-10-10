# 2026-10-10 — Màn 2 (Lịch — Tuần): bấm ngày → form event cả ngày — ✅ xong

## Input

- Bạn: "màn 2. Lịch — Tuần => click vào ngày thì cũng hiển thị pop up Form event, thời gian là cả ngày".
- Giống màn 3 (Ngày): bấm dòng "Cả ngày" → `event/edit?date&allDay=1` (bước 8).

## Plan

- [x] 1. `WeekView`: bấm hàng ngày (cột ngày + chỗ trống, ngoài thẻ event/lễ) → form event (màn 9) điền sẵn ngày đó, bật Cả ngày. Bấm thẻ vẫn mở Chi tiết / pop-up ngày.
- [x] 2. Spec + mockup: `F1-calendar.md`, `screens.md` màn 2.
- [x] 3. typecheck + lint + test · emulator: bấm ngày ở xem Tuần → form cả ngày đúng ngày.
- [x] 4. Commit + push.

## Kết quả

- `WeekView`: cả hàng ngày là nút bấm (nhấn thì nền `primarySoft`) → `onAddAt(d, null)` → `event/edit?date&allDay=1`, giống dòng "Cả ngày" ở màn Ngày. Thẻ event / lễ vẫn mở Chi tiết / pop-up ngày.
- Spec: `F1-calendar.md` (bảng chế độ xem), `screens.md` màn 2. Mockup không đổi (chỉ là hành vi bấm).
- Kiểm tra: typecheck ok · lint 0 lỗi · test 122/122. Emulator: bấm hàng T3 06/10 → form, Cả ngày bật, 06/10/2026.
