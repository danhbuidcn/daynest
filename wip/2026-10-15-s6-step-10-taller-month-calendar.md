# 2026-10-15 — S6 bước 10: Lịch Tháng rộng hơn — ⏳ chờ bạn duyệt

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §9](../docs/specs/sprint-6/index.md) · mockup S6 (Lịch Tháng ô cao + đã cuộn) · bước trước: [bước 9](2026-10-15-s6-step-9-recurring-expenses.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 9).

## Hiện trạng (đã xem code)

- `MonthView` chia đều 6 hàng theo chiều cao màn (`flex: 1`), mỗi ô tối đa 3 thanh (`MAX_BARS = 3` ở `lib/calendar/eventBars.ts`), `WeekdayRow` nằm ngoài, `calendar.tsx` bọc `GestureDetector` (vuốt ngang đổi tháng, `failOffsetY` 15).
- `MonthView` chỉ dùng ở Lịch (`settings/period` chỉ dùng `WeekdayRow`).

## Plan

- [ ] 1. `MAX_BARS` 3 → 5 (`dayBars` giữ "+N") · test `dayBars` hiện có cập nhật (số thanh, "+N").
- [ ] 2. `MonthView`: bỏ `flex: 1`, mỗi hàng cao cố định (số dương + ngày âm ~30 + 5 thanh × 18 + dòng "+N" ≈ 130 dp, tính từ token, không số lẻ rải rác) · khung xương giữ khớp · bỏ `WeekdayRow` khỏi `MonthView` (đã tách).
- [ ] 3. `calendar.tsx` chế độ Tháng: lưới nằm trong `ScrollView` dọc, hàng thứ (`WeekdayRow`) dính đầu (`stickyHeaderIndices`) · các chế độ khác giữ nguyên · vuốt ngang vẫn đổi tháng (thử lại `failOffsetY` trong ScrollView).
- [ ] 4. Thu gọn đầu: hook `useCollapsingHeader` (hàm thuần quyết định theo hướng + ngưỡng, có test: cuộn xuống quá ~60 dp → thu gọn; cuộn lên ≥ ~12 dp hoặc ở đỉnh → hiện) · `CalendarHeader` có dạng thu gọn 1 dòng (`‹ Tháng 10, 2026 ›` chữ `heading` + "Hôm nay") · `ViewModeBar` ẩn khi thu gọn · chuyển bằng `LayoutAnimation` · đổi tháng → cuộn về đầu lưới, đầu đầy đủ.
- [ ] 5. Mở Lịch, chọn "Hôm nay", mở từ nhắc kỳ kinh → cuộn tới hàng có ngày đó (`scrollTo` theo chỉ số hàng × chiều cao hàng) · tháng khác tháng hiện tại → về đầu lưới.
- [ ] 6. Cập nhật `design-system.md`: ô lịch tháng ghi 5 thanh (bỏ "từ S6").
- [ ] 7. `typecheck` + `lint` + `npm test` · thử trên máy ảo: ô nhiều event (thấy 5 thanh + "+N") · cuộn dọc mượt, hàng thứ dính · cuộn xuống thu gọn, cuộn lên hiện · vuốt ngang đổi tháng · bấm ô → hộp ngày · "Hôm nay" cuộn tới tuần hôm nay · khung xương · chế độ Danh sách, Tuần, Ngày không đổi · commit + push · tick lộ trình. **Độ mượt trên máy thật bạn thử lúc release** (DoD S6).

## Cần bạn quyết

- Không có điểm mới. Rủi ro đã biết: đổi chiều cao đầu lịch lúc đang cuộn có thể làm lưới giật 1 nhịp. Nếu giật rõ trên máy ảo, tôi đổi sang cách khác (đầu lịch nằm trong nội dung cuộn, dòng thu gọn dính đầu) và ghi lại ở đây.

## Kết quả
