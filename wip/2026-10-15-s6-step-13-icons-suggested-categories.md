# 2026-10-15 — S6 bước 13: Icon + nhóm gợi ý cho người Việt — ⏳ chờ bạn duyệt

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §12](../docs/specs/sprint-6/index.md) · mockup 21c, 21d · bước trước: [bước 12](2026-10-15-s6-step-12-plus-per-tab.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 12).

## Hiện trạng (đã xem code)

- `PICKABLE_ICONS` (36) trong `features/expenses/expense.ts`; `Icon.tsx` có 36 icon đó + `drop` (dùng cả cho chu kỳ kinh nguyệt). `categoryIcon()` rơi về `tag` nếu tên lạ.
- Màn Nhóm chi tiêu (`app/expense/categories.tsx`): "Có sẵn" · "Của bạn" · "Thêm nhóm"; đã có hộp `limitOpen` (đủ 30) nhưng chưa có "Gợi ý". Lưu nhóm qua `useExpenseCategoryWrites().save` (`id`, `isNew`, `input`).
- Icon đã có dùng lại được: `tag coffee cart bag shirt home bolt wifi phone tool bus fuel plane pill dumbbell scissors baby paw cap briefcase laptop card coins gift film game`. **Chưa có (cần vẽ path mới):** trà sữa, bia, ăn uống (`food` có sẵn → dùng lại), nước (`water`), gas, xe máy, taxi, gửi xe, khám bệnh, sách, bảo hiểm, lì xì, hiếu hỉ, karaoke, rác, chung cư.

## Plan

- [ ] 1. `Icon.tsx`: thêm path cho các icon còn thiếu (tên: `milktea beer water gas moto taxi parking doctor book shield envelope flower mic trash2 building`; xem lại danh sách cuối với mockup 21c) · `drop` giữ nguyên.
- [ ] 2. `expense.ts`: `PICKABLE_ICONS` 36 → 42 theo thứ tự mockup 21c · `CATEGORY_ICONS` vẫn nhận icon đã bỏ khỏi danh sách chọn (`wine bike heart umbrella ticket camera ball tree drop`) để nhóm cũ hiện đúng · sửa test đếm 36 → 42.
- [ ] 3. `ExpenseCategoryDialog.tsx`: lưới icon 42, tên hiện dưới mỗi icon, cuộn trong pop-up · i18n tên icon (VI + EN).
- [ ] 4. `features/expenses/suggestedCategories.ts`: 24 gợi ý (key, icon, màu, tên VI + EN) · hàm thuần `visibleSuggestions(suggestions, existingNames, lang)` (ẩn trùng tên, không phân biệt hoa thường) · test.
- [ ] 5. `categories.tsx`: khu "Gợi ý" dưới "Của bạn" (24 chip) · chạm → `save` nhóm mới (tên theo ngôn ngữ app) + toast "Đã thêm nhóm …" · đủ 30 → hộp "Đã đủ 30 nhóm", không thêm · khoá khi mất mạng / máy chủ sự cố (như nút "Thêm nhóm") · i18n VI + EN, cùng khoá.
- [ ] 6. Spec: nếu thấy lệch danh sách icon ở S4 thì ghi chú trỏ sang §12.
- [ ] 7. `typecheck` + `lint` + `npm test` · thử trên máy ảo: hộp Thêm nhóm (42 icon cuộn được) · chạm 1 gợi ý → nhóm mới đúng icon, màu, gợi ý ẩn · đổi ngôn ngữ EN → tên gợi ý tiếng Anh · đủ 30 nhóm → hộp báo · nhóm cũ dùng icon đã bỏ vẫn hiện · commit + push · tick lộ trình.

## Cần bạn quyết

- Số icon mới cần vẽ khá nhiều (~15): tôi vẽ theo nét của bộ hiện có, bạn xem trên máy ảo rồi chỉnh. Được không?

## Kết quả

- (chưa làm)
