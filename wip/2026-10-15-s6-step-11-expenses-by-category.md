# 2026-10-15 — S6 bước 11: Chi tiêu theo nhóm — ⏳ chờ bạn duyệt

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §10](../docs/specs/sprint-6/index.md) · mockup S6 (Chi tiêu theo nhóm + pop-up nhóm) · bước trước: [bước 10](2026-10-15-s6-step-10-taller-month-calendar.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 10).

## Hiện trạng (đã xem code)

- Đã đủ từ S4–S6: danh sách nhóm ở cả 3 chế độ (`CategoryTotalsCard`), danh sách khoản chi chỉ ở Ngày (`ExpenseListCard`), biểu đồ Tuần / Tháng, thanh ngân sách, icon lặp.
- **Còn thiếu đúng 1 việc:** bấm 1 nhóm → pop-up các khoản chi của nhóm trong kỳ. Dữ liệu đã có sẵn (`expenses` của kỳ đang xem, tối đa 1000 dòng) → lọc theo nhóm, **không thêm truy vấn**.

## Plan

- [ ] 1. `lib/expenses/groupByDay.ts` (hàm thuần): `expensesOfCategory(expenses, categoryId)` (mới nhất trước) + `groupByDay(list)` → `[{ date, items, total }]` · test (thứ tự, nhóm theo ngày, tổng).
- [ ] 2. `features/expenses/CategoryExpensesDialog.tsx` (`DialogShell` `large`): tiêu đề ✕ · icon + tên nhóm · `+` · dòng kỳ đang xem ("Tháng 10, 2026" / "Tuần …" / "Thứ Năm, 15/10") + tổng nhóm · danh sách nhóm theo ngày (Tuần, Tháng có dòng ngày "T5, 15/10 · 145.000 ₫"; Ngày không cần dòng ngày) · mỗi dòng: ghi chú (không có → "Không có ghi chú" màu `textMuted`) + icon lặp + số tiền, **không** lặp icon, tên nhóm · cuộn khi dài · i18n VI + EN.
- [ ] 3. `CategoryTotalsCard`: mỗi dòng nhóm bấm được (`onPress(categoryId)`) · `expenses.tsx` giữ `openCategory` + mở pop-up.
- [ ] 4. Sửa từ pop-up: bấm 1 khoản → đóng pop-up, đẩy form sửa (Modal nằm trên mọi màn nên không để mở khi sang form) · ghi nhớ nhóm đang xem · khi quay lại màn Chi tiêu (`useFocusEffect`) → mở lại pop-up · lưu / xoá (Hoàn tác) xong thấy danh sách đã đổi · nhóm hết khoản (xoá hết) → không mở lại.
- [ ] 5. `+` trong pop-up: đóng pop-up, mở form thêm với nhóm = nhóm này (thêm tham số `category` cho `app/expense/edit.tsx`), ngày = `defaultSpentOn` (ngày đang xem ở Ngày, hôm nay nếu trong kỳ, ngược lại ngày đầu kỳ) · sau khi lưu quay lại → pop-up mở lại · khoá `+` khi mất mạng / máy chủ sự cố.
- [ ] 6. `typecheck` + `lint` + `npm test` · thử trên máy ảo: Ngày / Tuần / Tháng bấm nhóm → đúng khoản chi của nhóm · sửa 1 khoản rồi về pop-up thấy số mới · xoá + Hoàn tác · `+` thêm khoản đúng nhóm · nhóm có khoản lặp thấy icon · nhiều khoản → cuộn · tổng nhóm khớp danh sách nhóm · commit + push · tick lộ trình.

## Cần bạn quyết

- Không có điểm mới. Lưu ý: pop-up đóng khi sang form rồi mở lại khi quay về (nhìn như "về lại pop-up" theo spec); nếu bạn muốn pop-up luôn hiện phía trên form thì phải đổi pop-up thành màn riêng — tôi không đề xuất.

## Kết quả
