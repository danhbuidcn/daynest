# 2026-10-12 — S4 bước 3: Tab Chi tiêu — chế độ Ngày — ⏳ chờ duyệt

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · mockup màn 3, 3b, 4.

## Input

- Tab "Thống kê" → "Chi tiêu" · thanh Ngày/Tuần/Tháng · header kỳ + hộp chọn kỳ · chế độ Ngày đủ nội dung.

## Plan

- [ ] 1. `app/src/lib/expenses/` (hàm thuần + test): khoảng ngày của kỳ (ngày / tuần theo `week_start` / tháng, theo múi giờ) · kỳ trước/sau · cộng theo nhóm (số tiền + %, xếp nhiều → ít) · định dạng "50.000 ₫" · đọc số tiền từ chữ gõ.
- [ ] 2. `features/expenses/api.ts` + hook: khoản chi theo kỳ, nhóm của user · cache trên máy như Lịch.
- [ ] 3. Tab: đổi `stats.tsx` → tab Chi tiêu (tên, icon `wallet`) · thêm icon `wallet`, `food`, `car`, `bill`, `tag` vào `Icon.tsx`.
- [ ] 4. Màn: thanh 3 chế độ (nhớ lựa chọn trên máy), header kỳ ‹ › · hộp chọn kỳ (Tháng: dùng lại `MonthYearPicker`; Tuần/Ngày: lịch nhỏ mới) + nút về kỳ hiện tại · nút nhóm góc phải (màn Nhóm làm ở bước 6, tạm để trống).
- [ ] 5. Chế độ Ngày: tổng · theo nhóm · danh sách (bấm → form, làm ở bước 5) · kỳ trống.
- [ ] 6. i18n en + vi · `typecheck && lint && test` · máy thật (cần DB có bảng — chạy với Supabase local hoặc sau bước 8).
- [ ] 7. Commit `feat(app): expenses tab, day view` + push.

## Kết quả
