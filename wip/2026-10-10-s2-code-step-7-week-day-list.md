# 2026-10-10 — S2 code bước 7: xem Tuần / Ngày / Danh sách (F1) — ✅ xong

## Input

- Lộ trình: [bước 7](2026-10-09-s2-code-roadmap-step-3-lunar-month.md) · spec [F1](../docs/specs/sprint-2/F1-calendar.md) (bảng Mô tả, Tải event, chế độ lần cuối) · mockup màn 2, 3, 4.
- App hiện: chỉ Tháng chạy; Tuần/Ngày/Danh sách → toast "Đang phát triển". Event (bước 6) đã có: `useEventsInRange`, `occurrencesOnDay`, `EventListRow`, chi tiết event.
- Chạy thử trên emulator `pwvault-test` (Metro dev, không dùng điện thoại).

## Output

- Đổi được 4 chế độ; vuốt / `‹ ›` đổi kỳ theo chế độ; Hôm nay về đúng ngày; mở lại app vào chế độ lần cuối.

## Plan

- [x] 1. `lib/calendar/week.ts` (thuần): `addDays`, `startOfWeek(date, weekStart)`, `weekDates` · test.
- [x] 2. `lib/calendar/dayLayout.ts` (thuần): event có giờ trong 1 ngày → `top/height` (phút) + cột khi trùng giờ (xếp cạnh nhau), cắt phần tràn qua ngày khác · test.
- [x] 3. `features/calendar/useCalendarNav.ts`: chế độ + ngày đang xem (`cursor`) + kỳ trước/sau theo chế độ (tháng ±1 tháng · tuần/danh sách ±7 ngày · ngày ±1 ngày) + tiêu đề + khoảng tải event (tháng: lưới 42 ngày · tuần/ngày/danh sách: tuần chứa `cursor`) · lưu chế độ lần cuối (AsyncStorage).
- [x] 4. Tuần (màn 2): `WeekChips` (thanh chọn tuần cuộn ngang) · 7 hàng: thứ + ngày dương/âm + thẻ event cuộn ngang trong hàng (lễ = thẻ `error`, không bấm) · hôm nay chữ `primaryDark` · bấm thẻ → Chi tiết.
- [x] 5. Ngày (màn 3): dòng âm lịch · dòng "Cả ngày" (lễ + event cả ngày) · lưới giờ 0–23 cuộn dọc, mở ra cuộn tới giờ hiện tại · khối event theo giờ, trùng giờ xếp cạnh nhau · vạch giờ hiện tại (hôm nay).
- [x] 6. Danh sách (màn 4): thanh 7 ngày (thứ, ngày, âm, chấm khi có event) · danh sách event ngày đã chọn theo giờ (cột giờ + thẻ) · trống → "Chưa có sự kiện".
- [x] 7. `EventCard` dùng chung (sọc màu, tiêu đề, giờ, icon lặp/nhắc) · tách file, màn `calendar.tsx` chỉ ghép.
- [x] 8. i18n EN + VI (tiêu đề tuần, thứ dài, Cả ngày…).
- [x] 9. `npm run typecheck && npm run lint && npm test` · emulator: 4 chế độ, vuốt, Hôm nay, đóng/mở lại app giữ chế độ, so mockup.
- [x] 10. Commit `feat(app): week, day and list calendar views`, push. Không release.

## Kết quả

- Làm xong 4 chế độ: Tháng · Danh sách · Tuần · Ngày. Code: `lib/calendar/week.ts`, `lib/calendar/dayLayout.ts` (thuần, có test), `features/calendar/` (`calendarNav.ts`, `useCalendarNav.ts`, `WeekView`, `WeekChips`, `DayView`, `DayTimeline`, `ListView`, `DayStrip`, `EventCard`). `(tabs)/calendar.tsx` chỉ ghép.
- Kiểm tra trực tiếp trên emulator `pwvault-test` (build debug ký bằng khoá release, cài đè bản release, Metro): tuần (hôm nay xanh, CN đỏ, thẻ cuộn ngang), ngày (vạch giờ hiện tại, khối event), danh sách (thanh ngày, thẻ lễ "Phụ nữ Việt Nam" 20/10), vuốt đổi tuần, bấm event mở Chi tiết, tắt/mở app vẫn giữ chế độ đã chọn. Theo yêu cầu: không viết thêm test mới cho phần giao diện (test đã viết cho logic thuần vẫn giữ).
- Sửa theo yêu cầu: nút `+` ô trống ở xem Tháng nay nằm chính giữa ô (trước lệch lên trên). Đã cập nhật `mockups.html` + `F1-calendar.md` (cùng mục chế độ xem lần cuối).
- Chưa làm (để bước sau): kéo xuống đồng bộ Google (bước 10); tắt ngày âm/lễ theo Cài đặt (bước 8).
- Kiểm tra: typecheck ok · lint 0 lỗi (3 cảnh báo i18n có từ trước) · test 122/122.

## Việc tiếp

- Bước 8: Nhắc nhở + Cài đặt Thông báo + Lịch (F3, F6) — xem [lộ trình](2026-10-09-s2-code-roadmap-step-3-lunar-month.md). `/clear` rồi mở `wip/index.md` để tiếp.
