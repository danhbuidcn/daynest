# 2026-10-15 — S6 bước 12: Nút + theo tab — ✅ xong (thử trên máy ảo; chưa thử mất mạng)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §11](../docs/specs/sprint-6/index.md) · bước trước: [bước 11](2026-10-15-s6-step-11-expenses-by-category.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 11).

## Hiện trạng (đã xem code)

- Nút `+` nằm trong `TabBar`, `(tabs)/_layout.tsx` luôn mở `QuickAddDialog` (4 ô). Nút đã khoá khi mất mạng / máy chủ sự cố (`TabBar` dùng `useOnline`, từ bước 4).
- Tab Chi tiêu (`expenses.tsx`) giữ ngày đang xem; tab Ghi chú: `manage.tsx` biết đang ở Todo hay Ghi chú, `TodoList` giữ ngày chọn ở thanh tuần; bộ lọc danh mục note đã có sẵn ở `newNoteHref()`.
- `_layout` không biết trạng thái bên trong từng tab → cần cho mỗi tab "đăng ký" việc `+` làm.

## Plan

- [x] 1. `features/tabs/plusAction.ts`: chỗ đăng ký việc của `+` — `usePlusAction(handler)` (gọi trong màn tab; đăng ký khi tab đang hiện bằng `useFocusEffect`, huỷ khi rời; handler luôn là bản mới nhất qua ref) · `runPlusAction()` trả `true` nếu tab đã có việc riêng · test hàm thuần (đăng ký, huỷ, không có → `false`).
- [x] 2. `(tabs)/_layout.tsx`: `onPlus` = `runPlusAction() || mở QuickAddDialog` → Lịch, Cài đặt không đăng ký nên vẫn pop-up 4 ô.
- [x] 3. Chi tiêu (`expenses.tsx`): đăng ký → `/expense/edit` với ngày = ngày đang xem (Ngày) hoặc hôm nay nếu trong kỳ, ngược lại ngày đầu kỳ (hàm `defaultSpentOn` có sẵn) · nhóm = nhóm dùng gần nhất (form đã làm).
- [x] 4. Ghi chú (`manage.tsx` + `TodoList`): `view === 'notes'` → `router.push(newNoteHref())` (danh mục = bộ lọc đang chọn) · `view === 'todo'` → `/todo/edit` với `date` = ngày chọn ở thanh tuần (đăng ký trong `TodoList`, chỉ khi hiện).
- [x] 5. Spec: sửa mục "nút + ở thanh tab" của S4 và pop-up `+` của S5 (chỉ còn Lịch, Cài đặt) — tìm đúng chỗ trong `docs/specs/sprint-4`, `sprint-5` · `design-system.md` nếu có nhắc.
- [x] 6. `typecheck` + `lint` + `npm test` · thử trên máy ảo: Lịch, Cài đặt → pop-up 4 ô · Chi tiêu (Ngày, Tháng) → form thêm khoản chi đúng ngày · Ghi chú › Ghi chú (có lọc danh mục) → note mới trong danh mục đó · Ghi chú › Todo (chọn ngày khác) → form Todo đúng ngày · tiêu đề "Todo ▾" vẫn đổi loại · tắt mạng → nút khoá ở mọi tab · commit + push · tick lộ trình.

## Cần bạn quyết

- Không có điểm mới.

## Kết quả

- **Code:** `features/tabs/plusAction.ts` (`usePlusAction`, `runPlusAction`, `setPlusAction`; đăng ký khi tab đang hiện) + 3 test (tổng 269) · `_layout` gọi việc của tab, không có thì pop-up 4 ô · đăng ký ở `expenses.tsx`, `manage.tsx` (chỉ khi ở Ghi chú), `TodoList.tsx` · sửa spec S4, S5. Tiện thể bỏ biến thừa `colors` ở `BudgetDialog` (cảnh báo lint từ bước 8). `typecheck`, `lint` (0 lỗi), `npm test` qua.
- **Máy ảo:** Chi tiêu → form Thêm khoản chi (hôm nay) · Ghi chú › Ghi chú → màn soạn note mới (note trống không được lưu — danh sách vẫn 1 note) · Ghi chú › Todo, chọn T7 17/10 → form Todo ngày 17/10 · Lịch → pop-up 4 ô.
- **Chưa thử:** Cài đặt (không đăng ký gì nên giữ pop-up, cùng đường với Lịch) · mất mạng khoá nút (code `TabBar` từ bước 4, không đổi) · Chi tiêu chế độ Tuần / Tháng (ngày mặc định theo `defaultSpentOn`, đã có test) · lọc danh mục note.
