# 2026-10-12 — S3 bước 3: chế độ Ngày — chữ event không bị cắt — ✅ xong

Thuộc: [S3 lộ trình](2026-10-12-s3-plan.md) · spec [S3 mục 1](../docs/specs/sprint-3/index.md).

## Input

- Event ngắn (vd "Vào học Duolingo" 20:00) chỉ hiện nửa trên dòng chữ (đã chụp trên máy thật).
- Nguyên nhân: [DayTimeline.tsx](../app/src/features/calendar/DayTimeline.tsx) — khối cao tối thiểu 20 dp, tiêu đề cỡ `body` cần 22 dp + đệm 8 dp = 30 dp.

## Plan

- [x] 1. Khối thấp hơn 30 dp → tiêu đề cỡ `caption` (16 dp) + đệm dọc 2 dp → vừa 20 dp. Khối ≥ 30 dp giữ nguyên.
- [x] 1b. Khối ≤ 1 giờ: chữ căn giữa theo chiều dọc (trên dưới đều nhau — bạn thấy "Họp nhóm" lệch: trên 4 dp, dưới 10 dp) · khối dài hơn: căn trên như cũ. Theo [mockup 3b](../docs/specs/sprint-3/design/mockups.html).
- [x] 2. `npm run typecheck && npm run lint && npm test`.
- [x] 3. Chạy app trên máy thật (`npm run android`), chụp chế độ Ngày: event 15, 30, 45 phút + event chồng giờ hiện đủ chữ.
- [x] 4. Commit `fix(app): day view short event title no longer clipped` + push.

## Kết quả

- 2026-10-12 10:35 — Sửa [DayTimeline.tsx](../app/src/features/calendar/DayTimeline.tsx): khối < 30 dp → chữ `caption` + đệm 2 dp · khối ≤ 1 giờ căn giữa dọc.
- Thêm (ngoài plan, cùng lỗi): dòng giờ chỉ hiện khi khối ≥ 46 dp. Trước đây hiện từ 45 phút (khối 38 dp) → dòng giờ bị cắt nửa.
- Check qua: typecheck · lint (0 lỗi, 3 cảnh báo cũ) · test 122/122. Trước đó phải `npm ci` (thiếu gói) + chạy `expo start` để sinh lại kiểu route.
- 2026-10-12 10:50 — Máy thật (Galaxy A55): cài bản release build từ code này đè lên app (`adb install -r`, giữ dữ liệu; không dùng bản debug vì khác khoá ký → phải gỡ app). Tạo event 15, 30, 45 phút + 2 event chồng giờ 16:00 → tất cả hiện đủ chữ · 15/30 phút chữ nhỏ · 45 phút và 1 giờ căn giữa · 1 giờ hiện thêm dòng giờ đủ. Đã xoá 5 event thử (cả trên Google Calendar).
