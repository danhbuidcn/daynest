# 2026-10-12 — S4 bước 5: Form khoản chi — ✅ xong (máy thật thử ở bước 8)

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · mockup màn 5, 7, 7b, 8, 9.

## Input

- Thêm / sửa / xoá khoản chi · pop-up `+` có "Khoản chi".

## Plan

- [x] 1. Màn `app/src/app/expense/edit.tsx` (dùng `FormScreen`): số tiền (bàn phím số, chấm ngàn khi gõ, con trỏ sẵn khi thêm mới) · dòng nhóm → hộp chọn nhóm (+ "Thêm nhóm" — hộp làm ở bước 6) · ngày (mặc định hôm nay / ngày đang xem) · ghi chú ≤ 200.
- [x] 2. Nhóm mặc định = nhóm dùng gần nhất (lưu trên máy), lần đầu "Ăn uống".
- [x] 3. Lưu: `id` sinh 1 lần khi mở form · sửa dùng khoá lạc quan → hộp "Đã thay đổi ở thiết bị khác" như event/note · mất mạng khoá Lưu, lỗi → toast giữ form.
- [x] 4. Xoá: hộp "Xoá khoản chi này?" → xoá hẳn → về tab, toast "Đã xoá".
- [x] 5. Pop-up `+` (`QuickAddDialog`): thêm "Khoản chi" ở dòng dưới.
- [x] 6. i18n en + vi · test hàm thuần mới · `typecheck && lint && test` · máy thật: để bước 8 (như bước 3, 4).
- [x] 7. Commit `feat(app): add, edit, delete expenses` + push.

## Kết quả

- 2026-10-13 — Việc 1: `app/expense/edit.tsx` (dùng `FormScreen`): số tiền chữ to, bàn phím số của máy, tự chèn chấm ngàn (`formatAmountInput`), con trỏ sẵn khi thêm · dòng nhóm → `ExpenseCategoryPicker` (bấm là chọn + đóng; "Thêm nhóm" tạm toast "Đang phát triển" tới bước 6) · dòng ngày "Hôm nay, T3 13/10/2026" → `MiniCalendarPicker` · ghi chú 1 dòng ≤ 200.
- 2026-10-13 — Ngày mặc định khi bấm "Thêm khoản chi" ở tab (`defaultSpentOn`): Ngày → ngày đang xem; Tuần/Tháng → hôm nay nếu nằm trong kỳ, không thì ngày đầu kỳ (mockup màn 4). Pop-up `+` → hôm nay.
- 2026-10-13 — Việc 2: nhóm mặc định `defaultCategoryId`: nhóm lưu gần nhất trên máy (`expenses.lastCategory`), nhóm đó đã bị xoá → "Ăn uống", không có → nhóm đầu.
- 2026-10-13 — Việc 3: `api.ts` `createExpense` (upsert theo `id` sinh 1 lần) · `updateExpense` (khoá lạc quan `updated_at` → `ConflictError` → dùng lại `ConflictDialog` của event: "Tải bản mới" / "Ghi đè") · mất mạng (`expo-network`) → khoá Lưu, Xoá + dòng "Không có kết nối" · lỗi → toast, giữ form · đang lưu → khoá nút (bấm 2 lần không gửi 2 lần).
- 2026-10-13 — Việc 4: nút "Xoá" (nền đỏ nhạt) trên "Lưu" → hộp "Xoá khoản chi này?" → xoá hẳn → về tab, toast "Đã xoá".
- 2026-10-13 — Việc 5: `QuickAddDialog` thêm "Khoản chi" (icon ví, nền đào nhạt) ở dòng dưới → form thêm.
- 2026-10-13 — Việc 6: i18n `expenses.form.*`, `events.quickAdd.expense` (en + vi) · 4 test mới (chấm ngàn, Hôm nay/Hôm qua, ngày mặc định, nhóm mặc định) · `typecheck` qua · `lint` 0 lỗi (3 cảnh báo cũ) · `npm test` 22 bộ / 161 test qua. Máy thật: để bước 8 — thêm/sửa/xoá, bấm Lưu 2 lần không trùng, sửa trên 2 máy → hộp xung đột.
- 2026-10-13 — Việc 7: commit `feat(app): add, edit, delete expenses` + push.

