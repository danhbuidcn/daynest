# 2026-10-12 — S3 bước 3: chế độ Ngày — chữ event không bị cắt — ✅ đã duyệt, chưa làm

Thuộc: [S3 lộ trình](2026-10-12-s3-plan.md) · spec [S3 mục 1](../docs/specs/sprint-3/index.md).

## Input

- Event ngắn (vd "Vào học Duolingo" 20:00) chỉ hiện nửa trên dòng chữ (đã chụp trên máy thật).
- Nguyên nhân: [DayTimeline.tsx](../app/src/features/calendar/DayTimeline.tsx) — khối cao tối thiểu 20 dp, tiêu đề cỡ `body` cần 22 dp + đệm 8 dp = 30 dp.

## Plan

- [ ] 1. Khối thấp hơn 30 dp → tiêu đề cỡ `caption` (16 dp) + đệm dọc 2 dp → vừa 20 dp. Khối ≥ 30 dp giữ nguyên.
- [ ] 1b. Khối ≤ 1 giờ: chữ căn giữa theo chiều dọc (trên dưới đều nhau — bạn thấy "Họp nhóm" lệch: trên 4 dp, dưới 10 dp) · khối dài hơn: căn trên như cũ. Theo [mockup 3b](../docs/specs/sprint-3/design/mockups.html).
- [ ] 2. `npm run typecheck && npm run lint && npm test`.
- [ ] 3. Chạy app trên máy thật (`npm run android`), chụp chế độ Ngày: event 15, 30, 45 phút + event chồng giờ hiện đủ chữ.
- [ ] 4. Commit `fix(app): day view short event title no longer clipped` + push.

## Kết quả

_(chưa làm)_
