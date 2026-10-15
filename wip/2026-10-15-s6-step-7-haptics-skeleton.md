# 2026-10-15 — S6 bước 7: Rung nhẹ, khung xương — ✅ xong (thử trên máy ảo)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §4](../docs/specs/sprint-6/index.md) · bước trước: [bước 6](2026-10-15-s6-step-6-undo-delete.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 6).

## Plan

- [x] 1. `src/lib/haptics.ts`: `tapLight()` (nhẹ), `lift()` (nhấc kéo), `success()` — bọc `expo-haptics` (đã có trong `package.json`), nuốt lỗi (máy không có động cơ rung thì im lặng). Không có công tắc tắt rung (spec S6 đã loại).
- [x] 2. Gắn rung: tick / bỏ tick ở `TodoTick` (1 chỗ cho Lịch, tab Todo, chi tiết todo, việc nhỏ) · tick việc trong Ghi chú (`ChecklistBlock`) + `lift()` khi nhấc kéo đổi thứ tự · ngày kinh ở `settings/period` · `success()` khi Lưu xong event, todo, khoản chi (sau khi lưu thành công, trước khi đóng form) · `tapLight()` khi Xoá (1 chỗ: `useUndoableDelete`).
- [x] 3. `components/Skeleton.tsx`: khối xám bo góc theo token (`@/theme`), nhấp nháy nhẹ bằng `Animated` (opacity 0,5 ↔ 1, ~1,2 s, `useNativeDriver`) · 1 giá trị nhấp nháy dùng chung cho mọi khối trên màn · ẩn với đọc màn hình (`accessibilityElementsHidden`).
- [x] 4. Gắn khung xương (chỉ khi **chưa có dữ liệu trên máy**; có cache cũ thì vẫn hiện cache như hiện nay): Lịch Tháng — lưới, số ngày, ngày âm giữ nguyên, ô thêm khối xám thay thanh event · Lịch Danh sách — vài dòng xám · Ghi chú (`manage.tsx`) — thẻ xám + dòng Todo xám · Chi tiêu (`expenses.tsx`) — khối tổng + cột xám · thay `ActivityIndicator` ở các chỗ này (chỗ khác — Cài đặt Google, màn Kỳ kinh — giữ vòng quay).
- [x] 5. `typecheck` + `lint` + `npm test` · thử trên máy ảo: khung xương — mạng giả lập chậm (`adb emu network speed gsm`) + sang tháng / năm chưa từng mở (chưa có cache) → chụp màn · rung — không có động cơ trên máy ảo, kiểm app không lỗi khi tick, lưu, xoá, kéo (xem `dumpsys vibrator_manager` nếu máy ảo ghi) · commit + push · tick lộ trình. **Cảm giác rung bạn thử trên máy thật lúc release** (DoD S6 đã có dòng này).

## Cần bạn quyết

- Không có điểm mới. Lưu ý: tôi không xoá dữ liệu app trên máy ảo để tạo trạng thái "chưa có cache" (lần trước làm vậy đã đăng xuất điện thoại của bạn) — dùng tháng chưa từng mở thay thế.

## Kết quả

- **Rung:** máy ảo có động cơ giả lập và ghi lại lệnh rung của app (`dumpsys vibrator_manager`): Lưu todo → rung "thành công" (2 nhịp) · tick → rung nhẹ. Chưa đo trực tiếp: rung khi xoá, nhấc kéo checklist, ngày kinh (cùng hàm `tapLight` / `lift`). Cảm giác rung bạn thử trên máy thật lúc release.
- **Khung xương:** mạng giả lập chậm khó chụp đúng lúc (tải quá nhanh) nên tôi ép trạng thái tải bằng sửa tạm (đã gỡ, không commit) rồi chụp: Lịch Tháng (lưới + số ngày + ngày âm giữ nguyên, thanh event xám), Lịch Danh sách, Ghi chú (thẻ xám), Chi tiêu (khối tổng + cột xám); Todo dùng cùng thành phần dòng xám (chưa chụp riêng). Sửa sau khi chụp: lề hai bên cho Ghi chú, Chi tiêu · hàng xám Danh sách đặt lại cho khớp vị trí danh sách thật · xám đậm hơn một chút (nhấp nháy 0,6 ↔ 1).
- Chưa thấy khung xương bằng đường tải thật (không có tháng nào chưa cache mà tải đủ chậm).
- Thử trên máy ảo có tạo todo `hap1` (đã xoá). Cũng lỡ mở chi tiết 1 todo thật ("Viết 5 dòng…") vì app đang ở tháng 3/2028 sau lúc thử mạng chậm — không bấm gì thêm, dữ liệu không đổi.

