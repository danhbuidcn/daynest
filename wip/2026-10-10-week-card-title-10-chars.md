# 2026-10-10 — Màn 2 (Lịch — Tuần): thẻ event hiện 10 ký tự tiêu đề + giờ bắt đầu – kết thúc — ✅ xong (chờ bạn thử trên máy)

## Input

- Bạn: "2. Lịch — Tuần => tôi thấy title hiển thị không đúng. đã thống nhất là show 10 kí tự, và có hiện thời bắt đầu và kết thúc cho đồng bộ rồi".
- Hiện tại: thẻ rộng cố định 132 → "Kham rang" thành "Kham", giờ "15:00 –" mất giờ kết thúc. Quy tắc 10 ký tự chưa ghi trong spec → ghi lại lần này.

## Plan

- [x] 1. `EventCard`: thêm `titleMaxChars` (cắt theo ký tự, không `…`). `WeekView`: truyền 10, bỏ rộng cố định → thẻ rộng vừa nội dung, luôn hiện đủ "bắt đầu – kết thúc".
- [x] 2. Spec: `screens.md` (bảng chữ dài), `F1-calendar.md` (Tuần). Mockup màn 2: thẻ rộng theo nội dung, thêm 1 event tiêu đề dài bị cắt 10 ký tự.
- [x] 3. typecheck + lint + test · [ ] emulator (chỉ khi bạn không đang dùng).
- [x] 4. Commit + push.

## Kết quả

- `EventCard` thêm `titleMaxChars` (cắt theo ký tự Unicode, không `…`); khi có thì thân thẻ `flex: 0` → thẻ rộng vừa chữ. `HolidayCard` thêm `autoWidth`. `WeekView`: truyền 10, bỏ rộng cố định 132. Danh sách, pop-up ngày giữ như cũ.
- Spec: `screens.md` tách dòng "Thẻ event (xem tuần)", `F1-calendar.md` (Tuần). Mockup màn 2: thẻ rộng theo nội dung + event "Họp tổng kết dự án quý 4" → hiện "Họp tổng k · 13:00 – 14:30".
- Kiểm tra: typecheck ok · lint 0 lỗi · test 122/122. Chưa thử trên emulator: bạn đang dùng máy, mình không bấm vào.
