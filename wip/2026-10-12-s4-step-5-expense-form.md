# 2026-10-12 — S4 bước 5: Form khoản chi — ⏳ chờ duyệt

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · mockup màn 5, 7, 7b, 8, 9.

## Input

- Thêm / sửa / xoá khoản chi · pop-up `+` có "Khoản chi".

## Plan

- [ ] 1. Màn `app/src/app/expense/edit.tsx` (dùng `FormScreen`): số tiền (bàn phím số, chấm ngàn khi gõ, con trỏ sẵn khi thêm mới) · dòng nhóm → hộp chọn nhóm (+ "Thêm nhóm" — hộp làm ở bước 6) · ngày (mặc định hôm nay / ngày đang xem) · ghi chú ≤ 200.
- [ ] 2. Nhóm mặc định = nhóm dùng gần nhất (lưu trên máy), lần đầu "Ăn uống".
- [ ] 3. Lưu: `id` sinh 1 lần khi mở form · sửa dùng khoá lạc quan → hộp "Đã thay đổi ở thiết bị khác" như event/note · mất mạng khoá Lưu, lỗi → toast giữ form.
- [ ] 4. Xoá: hộp "Xoá khoản chi này?" → xoá hẳn → về tab, toast "Đã xoá".
- [ ] 5. Pop-up `+` (`QuickAddDialog`): thêm "Khoản chi" ở dòng dưới.
- [ ] 6. i18n en + vi · test hàm thuần mới · `typecheck && lint && test` · máy thật: thêm/sửa/xoá, bấm Lưu 2 lần không trùng.
- [ ] 7. Commit `feat(app): add, edit, delete expenses` + push.

## Kết quả
