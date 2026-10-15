# 2026-10-15 — S6 bước 8: Ngân sách tháng — ✅ xong (thử trên máy ảo; chưa đối chiếu DB, chưa thử 2 máy)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §6](../docs/specs/sprint-6/index.md) · [db.md](../docs/specs/sprint-6/design/db.md) § Ngân sách · bước trước: [bước 7](2026-10-15-s6-step-7-haptics-skeleton.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 7).

## Plan

- [x] 1. `lib/expenses/budget.ts` (hàm thuần): `budgetForMonth(general, overrides, month)` → `{ amount, kind: 'general' | 'month' } | null` (dòng tháng có `amount` null = không ngân sách dù có chung) · `budgetProgress(spent, amount)` → `{ percent, remaining, over, level: 'ok' | 'warn' | 'over' }` (< 80% ok · 80–100% warn · > 100% over).
- [x] 2. `features/expenses/budgetApi.ts` + `useBudget.ts`: đọc `user_settings.monthly_budget` + dòng `expense_month_budgets` của tháng đang xem (1 truy vấn mỗi bảng, cache theo tháng) · lưu: công tắc bật → ghi `monthly_budget`, xoá dòng tháng · công tắc tắt → upsert dòng tháng · ô trống = null (chung) / dòng `amount` null (riêng) · đặt kết quả vào cache như bước 5, không tải lại.
- [x] 3. `features/expenses/BudgetBar.tsx`: thanh tiến độ trong `TotalCard` (chỉ chế độ Tháng; màu `primary` / `warning` / `error` theo token) · dòng dưới "71% ngân sách [riêng] 7.800.000 ₫" + "Còn …" / "Vượt …" (`error`) · chưa đặt: nút "Đặt ngân sách tháng" nền `primarySoft`.
- [x] 4. `features/expenses/BudgetDialog.tsx`: hộp "Ngân sách tháng N" — ô số tiền (`number-pad`, `formatAmountInput`, tối đa 100.000.000.000) · công tắc "Dùng cho mọi tháng" (mặc định bật; tháng có ngân sách riêng → tắt) · Huỷ / Lưu · khoá Lưu khi mất mạng / máy chủ sự cố (`useOnline`) · rung `success()` khi lưu.
- [x] 5. Gắn vào `app/(tabs)/expenses.tsx` (Tháng) · i18n VI + EN cùng khoá (`expenses.budget.*`), câu chữ lịch sự, ngắn · không thêm chú thích dưới màn.
- [x] 6. `typecheck` + `lint` + `npm test` · thử trên máy ảo: chưa đặt → đặt chung → thanh đúng màu (dưới 80%, 80–100%, vượt — chỉnh số để ra 3 màu) · đặt riêng 1 tháng, sang tháng khác vẫn chung · công tắc bật lại → bỏ riêng · ô trống → bỏ ngân sách · Ngày, Tuần không hiện · kiểm DB · commit + push · tick lộ trình.

## Cần bạn quyết

1. *(Bạn `ok` 2026-10-15: thêm test cho 2 hàm.)* Hàm `budgetForMonth`, `budgetProgress`: spec ghi "có test", ghi nhớ của bạn là "không thêm Jest mới, thử trên máy ảo". Đề xuất: **thêm test cho 2 hàm này** (theo spec + CLAUDE.md "hàm thuần luôn có test"), còn lại thử trên máy ảo. Đồng ý?

## Kết quả

- **Code:** `lib/expenses/budget.ts` (+ 3 test) · `budgetApi` nằm trong `features/expenses/api.ts` · `useBudget.ts` · `BudgetBar.tsx` · `BudgetDialog.tsx` (mở khi cần, ô nhập bắt đầu từ ngân sách hiện có) · `TotalCard` nhận phần tử con · i18n `expenses.budget.*` VI + EN. `typecheck`, `lint` (0 lỗi), `npm test` (255) đều qua.
- **Máy ảo:** chưa đặt → nút "Đặt ngân sách tháng" · chung 3.000.000 → 90% cam, "Còn 314.990 ₫" · riêng 2.000.000 (tắt công tắc) → 134% đỏ, "ngân sách riêng", "Vượt 685.010 ₫" · mở lại thì công tắc tắt đúng · xoá trống ô + bật công tắc + Lưu → về "Đặt ngân sách tháng" (dữ liệu trở lại như cũ). Chưa chụp màu xanh (< 80%) — cùng hàm, test hàm đã có.
- **Chưa làm / lưu ý:** chưa đối chiếu trực tiếp bảng trong DB (chỉ thấy app lưu không lỗi) · chưa thử 2 máy · tháng chưa có khoản chi nào hiện màn "Chưa có khoản chi" nên chưa đặt được ngân sách ở tháng đó (đặt từ tháng có chi tiêu, hoặc nói tôi nếu muốn hiện thanh cả khi trống).
