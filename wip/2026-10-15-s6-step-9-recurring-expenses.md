# 2026-10-15 — S6 bước 9: Khoản chi lặp lại — ✅ xong (thử trên máy ảo; chưa thử hằng tuần ghi bù, ngày tương lai, 2 máy)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §7](../docs/specs/sprint-6/index.md) · [db.md](../docs/specs/sprint-6/design/db.md) § Khoản chi lặp lại · bước trước: [bước 8](2026-10-15-s6-step-8-budget.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 8).

## Cách làm

Bước này lớn (form + tự ghi + 2 màn quản lý), chia **2 phần trong cùng file**; xong phần A thì commit + push rồi làm phần B (mỗi phần 1 commit). Bảng `expense_recurrences`, cột `expenses.recurrence_id`, hàm `generate_due_expenses` đã có trên DB từ bước 1.

## Plan

**Phần A — tạo, tự ghi, hiện icon**

- [x] 1. `lib/expenses/recurrence.ts` (hàm thuần): `nextDueDate(frequency, anchorDay, from)` → ngày kế tiếp (hằng tháng: cùng ngày, tháng thiếu ngày → ngày cuối tháng, `anchorDay` giữ nguyên nên 31 → 30 → 31) · `anchorOf(frequency, date)` (thứ ISO 1–7 hoặc ngày 1–31) · `nextLabelDate` cho dòng "lần tới". Test khớp các ca của `rls_s6.sql` (ngày 31, tháng 2 nhuận, hằng tuần).
- [x] 2. `features/expenses/recurrenceApi.ts` + hook: `createRecurrence({ id, categoryId, amount, note, frequency, startOn })` (tính `anchor_day`, `next_on` = ngày bắt đầu; id sinh khi mở form, gửi lại không trùng) · `generateDue(today)` gọi `rpc('generate_due_expenses', { p_today })` → số dòng đã ghi.
- [x] 3. Form khoản chi (`app/expense/edit.tsx`, chỉ khi **tạo mới**): dòng "Lặp lại" — Không · Hằng tuần · Hằng tháng (hộp chọn có sẵn kiểu `ChoiceDialog`) · Lưu với lặp = tạo quy tắc rồi gọi `generateDue` (khoản chi đầu tiên được ghi ngay nếu ngày bắt đầu ≤ hôm nay; **không** tạo thêm khoản chi thường, tránh trùng) · ngày bắt đầu ở tương lai thì chỉ tạo quy tắc · khoá Lưu khi mất mạng như bước 4 · i18n VI + EN.
- [x] 4. Tự ghi: hook `useGenerateRecurring` ở màn Chi tiêu — gọi khi mở tab và khi app quay lại từ nền (`AppState`, như `useExpensesNav`) · hôm nay theo múi giờ Cài đặt · số dòng > 0 → làm mới danh sách khoản chi + tổng 6 tháng · lỗi thì im lặng (lần sau gọi lại) · không gọi khi mất mạng.
- [x] 5. Icon lặp nhỏ ở khoản chi tự ghi trong danh sách Chi tiêu › Ngày: đọc thêm cột `recurrence_id` trong `fetchExpenses` (`Expense.recurrenceId`), dùng icon `repeat` (có sẵn ở Lịch).
- [x] 6. `typecheck` + `lint` + `npm test` · thử trên máy ảo: tạo khoản chi hằng tháng ngày hôm nay → có 1 khoản + icon · tạo hằng tuần ngày đã qua 3 tuần → ghi bù 4 khoản · tạo ngày tương lai → chưa có khoản · ra nền rồi quay lại không ghi trùng · xoá khoản tự ghi → không bị ghi lại · kiểm DB · commit + push.

**Phần B — quản lý**

- [x] 7. Màn Nhóm chi tiêu (`app/expense/categories.tsx`): dòng đầu "Khoản chi lặp lại ›" → màn mới `app/expense/recurrences.tsx`: danh sách (icon nhóm · ghi chú hoặc tên nhóm · số tiền · "Hằng tháng · lần tới 05/11"), trống: "Chưa có khoản chi lặp lại.", nút đáy "Thêm khoản chi lặp lại" → form tạo với Lặp lại = Hằng tháng.
- [x] 8. Sửa quy tắc (`app/expense/recurrence-edit.tsx`): số tiền, nhóm, ghi chú, kiểu lặp, ngày lần tới · Lưu chỉ áp cho các lần sau (khoá lạc quan theo `updated_at`) · Xoá: hộp "Xoá khoản chi lặp lại này?" Huỷ / Xoá (khoản chi đã ghi giữ nguyên, không Hoàn tác).
- [x] 9. Xoá nhóm chi tiêu đã kéo theo quy tắc (DB `on delete cascade`) — kiểm hộp xác nhận xoá nhóm có nói rõ không, i18n.
- [x] 10. `typecheck` + `lint` + `npm test` · thử trên máy ảo: danh sách, sửa (lần sau đổi, khoản cũ giữ), xoá quy tắc, xoá nhóm có quy tắc · commit + push · tick lộ trình.

## Cần bạn quyết

1. Chia 2 phần, 2 commit trong cùng todo này. Được không?
2. Test cho `recurrence.ts`: spec và CLAUDE.md đều yêu cầu có → tôi thêm (như bước 8).

## Kết quả

- **Phần A (commit riêng):** `lib/expenses/recurrence.ts` (+3 nhóm test, tổng 258) · `recurrenceApi.ts` · `useGenerateRecurring.ts` (mỗi lần tab vào màn hình + app quay lại) · dòng "Lặp lại" ở form tạo · icon lặp ở danh sách. Máy ảo: tạo hằng tháng hôm nay → 1 khoản + icon, ra nền quay lại không ghi trùng. **Còn thử cùng phần B** (cần màn quản lý để dọn): hằng tuần ghi bù, ngày tương lai, xoá khoản tự ghi không bị ghi lại, kiểm DB. Dữ liệu thử đang có: 1 quy tắc hằng tháng 12.345 ₫ + 1 khoản chi hôm nay — đã xoá hết sau khi thử.
- **Phần B:** `recurrences.tsx` (danh sách, trống, nút thêm → form tạo với Lặp lại = Hằng tháng qua `?repeat=monthly`) · `recurrence.tsx` (sửa số tiền, nhóm, kiểu lặp, ngày lần tới, ghi chú; khoá lạc quan + hộp xung đột; xoá có hộp xác nhận) · dòng "Khoản chi lặp lại ›" đầu màn Nhóm · `useRecurrences.ts`. `typecheck`, `lint` (0 lỗi), `npm test` (258) qua.
- **Máy ảo:** danh sách "Hằng tháng · lần tới 15/11" → sửa số tiền, Lưu, danh sách cập nhật · xoá quy tắc → "Chưa có khoản chi lặp lại." và khoản chi đã ghi vẫn còn · xoá khoản chi thử → tổng về 1.765.000 ₫ như cũ.
- **Chưa thử:** hằng tuần ghi bù nhiều kỳ và ngày bắt đầu tương lai (logic nằm ở hàm DB, đã có test SQL ở bước 1 và test ngày tới hạn ở app) · 2 máy cùng lúc · xoá nhóm có quy tắc (cascade ở DB, đã test RLS bước 1). Sau khi xoá quy tắc, icon lặp ở khoản chi cũ còn hiện đến khi danh sách tải lại.
