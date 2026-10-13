# 2026-10-12 — S4 bước 3: Tab Chi tiêu — chế độ Ngày — ✅ xong

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · mockup màn 3, 3b, 4.

## Input

- Tab "Thống kê" → "Chi tiêu" · thanh Ngày/Tuần/Tháng · header kỳ + hộp chọn kỳ · chế độ Ngày đủ nội dung.

## Plan

- [x] 1. `app/src/lib/expenses/` (hàm thuần + test): khoảng ngày của kỳ (ngày / tuần theo `week_start` / tháng, theo múi giờ) · kỳ trước/sau · cộng theo nhóm (số tiền + %, xếp nhiều → ít) · định dạng "50.000 ₫" · đọc số tiền từ chữ gõ.
- [x] 2. `features/expenses/api.ts` + hook: khoản chi theo kỳ, nhóm của user · cache trên máy như Lịch.
- [x] 3. Tab: đổi `stats.tsx` → tab Chi tiêu (tên, icon `wallet`) · thêm icon `wallet`, `food`, `car`, `bill`, `tag` vào `Icon.tsx`.
- [x] 4. Màn: thanh 3 chế độ (nhớ lựa chọn trên máy), header kỳ ‹ › · hộp chọn kỳ (Tháng: dùng lại `MonthYearPicker`; Tuần/Ngày: lịch nhỏ mới) + nút về kỳ hiện tại · nút nhóm góc phải (màn Nhóm làm ở bước 6, tạm để trống).
- [x] 5. Chế độ Ngày: tổng · theo nhóm · danh sách (bấm → form, làm ở bước 5) · kỳ trống.
- [x] 6. i18n en + vi · `typecheck && lint && test` · máy thật: để bước 8 (bạn chọn b, 2026-10-13).
- [x] 7. Commit `feat(app): expenses tab, day view` + push.

## Kết quả

- 2026-10-13 — Việc 1: `lib/expenses/index.ts` (khoảng ngày, ‹ ›, cộng theo nhóm, "50.000 ₫", đọc số tiền) + `__tests__/expenses.test.ts` 8 test qua.
- 2026-10-13 — Việc 2: `features/expenses/` `expense.ts` (kiểu, tên nhóm theo i18n, icon lạ → `tag`) · `api.ts` (khoản chi theo kỳ ≤ 1.000 dòng, nhóm) · `useExpenses.ts` (TanStack Query, giữ kỳ cũ khi chuyển, tải trước kỳ liền kề, cache trên máy như Lịch).
- 2026-10-13 — Việc 3: `stats.tsx` → `expenses.tsx`, tab "Chi tiêu"/"Expenses", icon `wallet` · thêm icon `wallet`, `food`, `car`, `bill`, `tag`.
- 2026-10-13 — Việc 4: `components/SegmentedBar.tsx` dùng chung (Lịch cũng dùng qua `ViewModeBar`) · `useExpensesNav` (mặc định Tháng, nhớ chế độ trên máy) · header ‹ › (ẩn chip "Hôm nay" bằng prop tuỳ chọn) · `MonthYearPicker` thêm nút "Tháng này" · `MiniCalendarPicker` mới (Ngày / Tuần) + "Hôm nay"/"Tuần này". Nút nhóm, bấm dòng, "Thêm khoản chi": tạm hiện toast "Đang phát triển" (bước 5, 6).
- 2026-10-13 — Việc 5: `ExpenseSummary.tsx`: tổng (co chữ 1 dòng), theo nhóm (icon màu nhóm, thanh %), danh sách (chỉ Ngày) · kỳ trống · lỗi tải + "Thử lại". Tuần/Tháng tạm hiện tổng + theo nhóm; biểu đồ ở bước 4.
- 2026-10-13 — Việc 6: i18n `expenses.*` en + vi · `typecheck` qua · `lint` 0 lỗi (3 cảnh báo cũ ở `i18n/index.ts`) · `npm test` 22 bộ / 152 test qua. Chưa thử máy thật (bạn chọn b → bước 8).
