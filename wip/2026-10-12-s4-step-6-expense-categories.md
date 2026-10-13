# 2026-10-12 — S4 bước 6: Nhóm chi tiêu — ✅ xong (máy thật thử ở bước 8)

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · mockup màn 10, 11, 11b, 12, 13.

## Input

- Màn Nhóm chi tiêu · thêm / sửa (tên, icon, màu) / xoá nhóm tự tạo.

## Plan

- [x] 1. Thêm 36 icon vào `Icon.tsx` — path giống hệt mockup S4.
- [x] 2. Màn `app/src/app/expense/categories.tsx`: nhóm có sẵn (khoá) · nhóm của bạn (⋯ → Sửa / Xoá) · "Thêm nhóm" · tối đa 30.
- [x] 3. Hộp thêm/sửa: tên 1–30 (không trùng, báo lỗi dưới ô) · lưới 36 icon cuộn · `ColorRow` (bước 2).
- [x] 4. Xoá: hộp "Xoá nhóm "X"?" (chỉ tiêu đề) → xoá nhóm + khoản chi (DB cascade) → làm mới cache.
- [x] 5. Nối: nút nhóm ở tab Chi tiêu, "Thêm nhóm" trong hộp chọn nhóm của form.
- [x] 6. i18n en + vi · `typecheck && lint && test` · máy thật: để bước 8 (như bước 3–5).
- [x] 7. Commit `feat(app): expense categories with icons and colours` + push.

## Kết quả

- 2026-10-13 — Việc 1: `Icon.tsx` thêm 33 icon, path chép đúng mockup. 3 icon đã có sẵn: `tag`, `phone` (giống `phoneI` của mockup; lưu tên `phone` vì DB chỉ nhận chữ thường), `camera` (giữ bản của trình soạn note, khác mockup chút ít). Danh sách 36 icon: `PICKABLE_ICONS` trong `features/expenses/expense.ts`.
- 2026-10-13 — Việc 2: `app/expense/categories.tsx`: "CÓ SẴN" (icon khoá) · "CỦA BẠN" (bấm dòng → sửa, ⋯ → menu Sửa / Xoá ngay dưới nút) · dòng "+ Thêm nhóm" (mờ khi đủ 30) · chú thích dưới.
- 2026-10-13 — Việc 3: `ExpenseCategoryDialog`: tên 1–30 (trùng → "Tên này đã có" dưới ô, lỗi DB 23505) · lưới 36 icon 6 cột co giãn (máy 360 dp không đủ 6 × 40), hiện 3 hàng, cuộn trong ô; ô đang chọn nền màu nhóm + viền 2 `text` cách 2 · `ColorRow`. `id` sinh 1 lần khi mở hộp.
- 2026-10-13 — Việc 4: hộp "Xoá nhóm "X"?" (chỉ tiêu đề) → xoá → DB xoá theo khoản chi (cascade) → làm mới nhóm + mọi kỳ + biểu đồ · toast "Đã xoá".
- 2026-10-13 — Việc 5: nút thẻ tag ở tab → màn Nhóm · "Thêm nhóm" trong hộp chọn nhóm của form → tạo tại chỗ, chọn luôn nhóm mới (ẩn khi đủ 30).
- 2026-10-13 — Việc 6: i18n `expenses.categoryDialog.*`, `expenses.categoriesScreen.*` (en + vi) · test 36 icon (không trùng, hợp check DB) · `typecheck` qua · `lint` 0 lỗi (3 cảnh báo cũ) · `npm test` 22 bộ / 162 test qua. Máy thật: để bước 8 — thêm/sửa/xoá nhóm, tên trùng, xoá nhóm → khoản chi mất theo, lưới icon trên máy hẹp.
- 2026-10-13 — Việc 7: commit `feat(app): expense categories with icons and colours` + push.

