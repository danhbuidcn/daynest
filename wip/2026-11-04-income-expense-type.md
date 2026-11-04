# Thu / chi: chọn loại khi tạo bản ghi

## Input
- Khi tạo bản ghi thu chi, cho chọn **Thu** hoặc **Chi**. Mặc định là **Chi**.
- Ví dụ: đầu tháng chi 1đ vào việc A, sau đó kiếm được 2đ → ghi 1 khoản Chi 1đ và 1 khoản Thu 2đ.
- Chưa làm gì. Người dùng sẽ tự xử lý sau; file này là điều tra + kế hoạch.

## Điều đã đọc (2026-11-04)
- Bảng `expenses` ([migration S4](../supabase/migrations/20261012102236_s4_expenses.sql)): `amount bigint check (1..1e11)`, luôn dương, chưa có cột loại. Mọi bản ghi hiện đều là chi.
- `expense_monthly_totals` (cùng file): `sum(amount)` → tính cả thu sẽ sai nếu không tách loại.
- `generate_due_expenses` ([migration S6](../supabase/migrations/20261015072016_s6_budget_recurring_appearance.sql)) copy `category_id, amount, note` từ `expense_recurrences` sang `expenses`. Nếu thêm cột `type` mà không sửa hàm này, khoản lặp luôn thành Chi (an toàn, nhưng chưa cho lặp khoản Thu).
- App: [expense.ts](../app/src/features/expenses/expense.ts) (kiểu `Expense`), [api.ts](../app/src/features/expenses/api.ts) (`COLUMNS`, `ExpenseInput`), [edit.tsx](../app/src/app/expense/edit.tsx) (form), [lib/expenses/index.ts](../app/src/lib/expenses/index.ts) (`sumAmounts`, `totalsByCategory`, `dailyTotals`, `monthlyTotals`), `BudgetBar`, `ExpenseSummary`, `ExpenseCharts`, `CategoryExpensesDialog`.

## Cách làm đơn giản nhất (đề xuất)
- Thêm cột `kind text not null default 'expense' check (kind in ('expense','income'))` vào `expenses`. Giữ `amount` dương. Phải tăng `min_version_code` cùng migration: bản cũ sẽ cộng khoản Thu vào tổng Chi và hàm tổng đổi cột trả về (sửa lại điều ghi sai lúc đầu).
- Mọi chỗ cộng tổng phải tách theo `kind`. Thêm hiển thị "Thu" và "Còn lại = Thu − Chi" ở phần tổng.

## Đã quyết (2026-11-04)
1. Danh mục: Thu dùng chung danh mục với Chi.
2. Tổng tháng: hiện **cả hai** tổng, Thu và Chi (biểu đồ 6 tháng cũng tách hai loại). Ngân sách tháng: còn lại = hạn mức + tổng Thu − tổng Chi (Thu làm tăng ngân sách).
3. Khoản lặp lại: **có** chọn Thu / Chi. Mặc định Chi.
4. Màu/dấu của Thu: theo đề xuất, làm trong mockup ở bước 1 (cần duyệt mockup).

## Plan (chờ `ok`)
- [x] 1a. Spec: [sprint-8/index.md](../docs/specs/sprint-8/index.md) + [db.md](../docs/specs/sprint-8/design/db.md) (2026-11-04).
- [x] 1b. Mockup vẽ xong: [mockups.html](../docs/specs/sprint-8/design/mockups.html) (11 màn, đã mở thử bằng Chrome, không lỗi) (2026-11-04).
- [x] 1c. Mockup đã được duyệt (2026-11-04).
- [x] 2. (2026-11-04: `supabase/pending/20261104000000_s8_income_expense_kind.sql` + `pending/rls_s8.sql`, giữ trong `pending/` tới lúc release; `db test` qua 139 test; đổi `tests/rls_s4_colour.sql` dòng 34 thành `>= 6` vì min_version_code tăng. Hàm `expense_monthly_totals` giữ nguyên dạng, chỉ đếm Chi; thêm hàm mới `expense_monthly_totals_by_kind`.) Migration `supabase/db new`: thêm cột `kind` (default `'expense'`) vào `expenses` và `expense_recurrences`; sửa `generate_due_expenses` để copy `kind`; sửa `expense_monthly_totals` trả tổng theo `kind`; tăng `min_version_code`; `db test`.
- [x] 3. App: kiểu `Expense`/`ExpenseInput`/`COLUMNS`/`rowToExpense`, và phần tương tự ở `recurrenceApi.ts`; form `edit.tsx` + `recurrence.tsx` thêm chọn Thu/Chi (mặc định Chi); i18n `en.json` + `vi.json` cùng khóa.
- [x] 4. Logic `lib/expenses`: tách tổng Thu / Chi; test (logic thuần phải có test).
- [x] 5. Màn tổng, biểu đồ, danh sách: hiện Thu và Chi; còn lại của ngân sách = hạn mức + Thu − Chi.
- [x] 6a. `npm run typecheck` sạch · `npm run lint` 0 lỗi · `npm test` 272/272 qua (2026-11-04; đã `npm ci` lại vì `node_modules` cũ thiếu file).
- [ ] 6b. Thử trên máy thật — cần release: bump 8.0.0 / versionCode 13 → chuyển migration từ `supabase/pending/` sang `migrations/` (+ test sang `tests/`) → `supabase/db test` → `supabase/db migrate` → `npm run release` → cài đè máy.
- [ ] 7. Commit + push theo quy trình cuối sprint.

## Kết quả
Code xong, chưa commit, chưa release (2026-11-04).
- DB: [migration](../supabase/pending/20261104000000_s8_income_expense_kind.sql), [test](../supabase/pending/rls_s8.sql).
- App: `KindSwitch` (Chi | Thu ở form), `TotalCard` 2 tổng, `BudgetBar` cộng Thu, `BarChart` 2 cột/tháng, chip Chi | Thu ở Theo ngày và Theo nhóm, dấu `+` ở khoản Thu.
- Khác mockup: chip Chi | Thu dùng chung 1 trạng thái cho thẻ Theo ngày và Theo nhóm; thẻ ngân sách nằm trong thẻ tổng (như S6), không tách thẻ riêng.
