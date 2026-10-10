# 2026-10-10 — Màn 2 (Lịch — Tuần): bấm event → form sửa luôn — ✅ xong

## Input

- Bạn: "2. Lịch — Tuần => click 1 event thì hiện pop up edit luôn thay vì detail".

## Plan

- [x] 1. `calendar.tsx`: riêng xem Tuần, bấm thẻ event → `event/edit?eventId&occurrenceDate` (màn 9). Ngày, Danh sách, pop-up ngày vẫn mở Chi tiết.
- [x] 2. Spec: `F1-calendar.md` (luồng, bảng chế độ xem), `screens.md` màn 2.
- [x] 3. typecheck + lint + test · emulator.
- [x] 4. Commit + push.

## Kết quả

- Emulator: bấm thẻ "Kham rang" (lặp năm âm lịch) → form sửa đúng event, 15:00–16:00. Event lặp: lưu vẫn hỏi "Chỉ lần này / Tất cả" như cũ.
- Xoá event giờ chỉ còn ở Chi tiết (mở từ xem Ngày, Danh sách, pop-up ngày) — form không có nút xoá.
- Kiểm tra: typecheck ok · lint 0 lỗi · test 122/122.
