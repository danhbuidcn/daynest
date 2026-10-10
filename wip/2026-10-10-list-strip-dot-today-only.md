# 2026-10-10 — Màn 4 (Lịch — Danh sách): chấm chỉ ở ngày hôm nay — ✅ xong

## Input

- Thanh 7 ngày đang hiện chấm dưới mọi ngày có event / ngày lễ. Bạn muốn chỉ ngày hôm nay có chấm.

## Plan

- [x] 1. `DayStrip`: chấm theo `isToday` (bỏ prop `hasItems`); `ListView` bỏ truyền `hasItems`.
- [x] 2. Mockup màn 4: chấm chuyển từ ngày 6 sang hôm nay 9/10 (chấm trắng khi đang chọn); `screens.md` ghi rõ.
- [x] 3. `npm run typecheck && npm run lint`; thử trên emulator.
- [x] 4. Commit + push.

## Kết quả

- Typecheck ok · lint 0 lỗi (3 cảnh báo có từ trước).
- Emulator: CN 11/10 có event nhưng không có chấm; chỉ hôm nay (T7 10/10) có chấm.
