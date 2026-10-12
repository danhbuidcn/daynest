# 2026-10-12 — S4 bước 6: Nhóm chi tiêu — ⏳ chờ duyệt

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · mockup màn 10, 11, 11b, 12, 13.

## Input

- Màn Nhóm chi tiêu · thêm / sửa (tên, icon, màu) / xoá nhóm tự tạo.

## Plan

- [ ] 1. Thêm 36 icon vào `Icon.tsx` — path giống hệt mockup S4.
- [ ] 2. Màn `app/src/app/expense/categories.tsx`: nhóm có sẵn (khoá) · nhóm của bạn (⋯ → Sửa / Xoá) · "Thêm nhóm" · tối đa 30.
- [ ] 3. Hộp thêm/sửa: tên 1–30 (không trùng, báo lỗi dưới ô) · lưới 36 icon cuộn · `ColorRow` (bước 2).
- [ ] 4. Xoá: hộp "Xoá nhóm "X"?" (chỉ tiêu đề) → xoá nhóm + khoản chi (DB cascade) → làm mới cache.
- [ ] 5. Nối: nút nhóm ở tab Chi tiêu, "Thêm nhóm" trong hộp chọn nhóm của form.
- [ ] 6. i18n en + vi · `typecheck && lint && test` · máy thật.
- [ ] 7. Commit `feat(app): expense categories with icons and colours` + push.

## Kết quả
