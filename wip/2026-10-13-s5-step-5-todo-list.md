# 2026-10-13 — S5 bước 5: Danh sách todo (tab Ghi chú) — ✅ xong

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · spec [§ Danh sách todo](../docs/specs/sprint-5/index.md#danh-sách-todo) · [mockup](../docs/specs/sprint-5/design/mockups.html) màn 7, 7b.

## Input

- Tab "Ghi chú" (`app/(tabs)/manage.tsx`) có nút chuyển **Todo | Ghi chú** ở đầu màn; mặc định Ghi chú, nhớ lựa chọn trên máy (AsyncStorage). Phần Ghi chú giữ nguyên.
- Phần Todo: thanh tuần chọn ngày (dùng lại `features/calendar/DayStrip.tsx`, ‹ › đổi tuần, nút "Hôm nay", chỉ chấm dưới hôm nay) · mở lại tab → về hôm nay.
- 3 nhóm theo ngày chọn `x`, theo múi giờ trong Cài đặt:
  - Quá hạn: chưa xong, ngày trong 30 ngày trước `x`, mới nhất ở trên.
  - Hôm nay / "Thứ Hai, 12/10": mọi todo ngày `x`, đã xong xếp cuối.
  - Sắp tới: chưa xong, 7 ngày sau `x`, theo ngày.
- Dòng: ô tick (lạc quan, như bước 4) · tiêu đề · "2/5" · ngày (Quá hạn chữ màu error, Sắp tới) · chấm màu · bấm → chi tiết. Todo lặp: mỗi lần 1 dòng. Trống cả 3 → "Chưa có việc cần làm" + "Thêm todo".

## Plan

- [x] 1. Hàm thuần `groupTodoList` trong `lib/todos/` (vào: các lần todo đã bung trong `x − 30 … x + 7`, `x`, múi giờ → Quá hạn / ngày chọn / Sắp tới, đúng thứ tự) + test `__tests__/todoList.test.ts` (biên 30 / 7 ngày, đã xong, lặp, múi giờ, todo nhiều ngày).
- [x] 2. `features/todos/TodoList.tsx` (thanh tuần + 3 nhóm + dòng + trống), lấy dữ liệu bằng `useTodosInRange` · `manage.tsx`: nút chuyển Todo | Ghi chú (nhớ trên máy) · i18n VI + EN.
- [x] 3. `npm run typecheck && npm run lint && npm test` → `npm run release` → máy ảo: chuyển Todo/Ghi chú (tắt mở app vẫn nhớ), đổi ngày / tuần, Hôm nay, tick ở danh sách, todo lặp, trống → Thêm todo · dọn dữ liệu thử · commit `feat(app): todo list in the notes tab` + push.

## Kết quả
- 2026-10-13 — Bạn `ok`. Việc 1 xong: `lib/todos/list.ts` (`groupTodoList`) + `todoListSpan` trong `features/calendar/dayOccurrences.ts` (ngày theo múi giờ) · 7 test qua. Todo nhiều ngày: còn phủ ngày chọn → ở nhóm ngày chọn; ngày cuối đã qua → Quá hạn.
- 2026-10-13 — Việc 2 xong: `features/todos/TodoList.tsx` (đầu tháng ‹ › đổi tuần + Hôm nay, `DayStrip`, 3 nhóm trong thẻ, dòng tick, trống, tải lỗi → Thử lại, kéo để tải lại; tải 1 lần cho cả tuần: đầu tuần − 30 → cuối tuần + 7) · `manage.tsx`: `SegmentedBar` Todo | Ghi chú (`manage.view` trên máy), nút ⋯ chỉ ở Ghi chú · i18n `todos.list.*` VI + EN. Nhóm trống thì ẩn. typecheck ✓ · lint 0 lỗi · test 198/198 ✓.
- 2026-10-13 17:26 — Việc 3: `npm run release` (8 phút 5 giây) → cài lên máy ảo, thử:
  - Mặc định Ghi chú ✓ · chuyển Todo → trống "Chưa có việc cần làm" + "Thêm todo" → mở form Todo ngày 13/10 ✓
  - Todo "Thu hom nay" (2 việc phụ) + todo lặp hằng ngày từ 10/10 → Quá hạn 12, 11, 10 (mới nhất trên, chữ đỏ) · Hôm nay 2 dòng, "0/2" · Sắp tới 14–20, mỗi lần 1 dòng ✓
  - Tick lần 13/10 → xuống cuối, gạch ngang, "1/2 xong" · tick lần 10/10 → ra khỏi Quá hạn ✓
  - Chọn 12 → nhóm "Thứ Hai, 12/10", Sắp tới tính từ 12 · › sang tuần 19–25: Quá hạn tính theo 19/10 · "Hôm nay" về 13 ✓
  - Chọn 12 → sang tab Lịch → quay lại: về 13 ✓ · tắt app mở lại: vẫn ở Todo, về 13 ✓ · bấm dòng → chi tiết đúng lần 12/10 ✓
  - Đã dọn: xoá 2 todo thử trên app.
  - Ghi nhận nhỏ: ở Todo không có nút ⋯ nên tiêu đề "Ghi chú" lệch lên vài px so với Ghi chú.
