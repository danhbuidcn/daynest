# 2026-10-15 — S6 bước 7: Rung nhẹ, khung xương — ⏳ chờ bạn duyệt

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §4](../docs/specs/sprint-6/index.md) · bước trước: [bước 6](2026-10-15-s6-step-6-undo-delete.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 6).

## Plan

- [ ] 1. `src/lib/haptics.ts`: `tapLight()` (nhẹ), `lift()` (nhấc kéo), `success()` — bọc `expo-haptics` (đã có trong `package.json`), nuốt lỗi (máy không có động cơ rung thì im lặng). Không có công tắc tắt rung (spec S6 đã loại).
- [ ] 2. Gắn rung: tick / bỏ tick ở `TodoTick` (1 chỗ cho Lịch, tab Todo, chi tiết todo, việc nhỏ) · tick việc trong Ghi chú (`ChecklistBlock`) + `lift()` khi nhấc kéo đổi thứ tự · ngày kinh ở `settings/period` · `success()` khi Lưu xong event, todo, khoản chi (sau khi lưu thành công, trước khi đóng form) · `tapLight()` khi Xoá (1 chỗ: `useUndoableDelete`).
- [ ] 3. `components/Skeleton.tsx`: khối xám bo góc theo token (`@/theme`), nhấp nháy nhẹ bằng `Animated` (opacity 0,5 ↔ 1, ~1,2 s, `useNativeDriver`) · 1 giá trị nhấp nháy dùng chung cho mọi khối trên màn · ẩn với đọc màn hình (`accessibilityElementsHidden`).
- [ ] 4. Gắn khung xương (chỉ khi **chưa có dữ liệu trên máy**; có cache cũ thì vẫn hiện cache như hiện nay): Lịch Tháng — lưới, số ngày, ngày âm giữ nguyên, ô thêm khối xám thay thanh event · Lịch Danh sách — vài dòng xám · Ghi chú (`manage.tsx`) — thẻ xám + dòng Todo xám · Chi tiêu (`expenses.tsx`) — khối tổng + cột xám · thay `ActivityIndicator` ở các chỗ này (chỗ khác — Cài đặt Google, màn Kỳ kinh — giữ vòng quay).
- [ ] 5. `typecheck` + `lint` + `npm test` · thử trên máy ảo: khung xương — mạng giả lập chậm (`adb emu network speed gsm`) + sang tháng / năm chưa từng mở (chưa có cache) → chụp màn · rung — không có động cơ trên máy ảo, kiểm app không lỗi khi tick, lưu, xoá, kéo (xem `dumpsys vibrator_manager` nếu máy ảo ghi) · commit + push · tick lộ trình. **Cảm giác rung bạn thử trên máy thật lúc release** (DoD S6 đã có dòng này).

## Cần bạn quyết

- Không có điểm mới. Lưu ý: tôi không xoá dữ liệu app trên máy ảo để tạo trạng thái "chưa có cache" (lần trước làm vậy đã đăng xuất điện thoại của bạn) — dùng tháng chưa từng mở thay thế.

## Kết quả

