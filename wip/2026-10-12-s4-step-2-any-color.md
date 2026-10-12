# 2026-10-12 — S4 bước 2: Màu bất kỳ (toàn app) — ⏳ chờ duyệt

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · [§ Màu bất kỳ](../docs/specs/sprint-4/index.md#màu-bất-kỳ) · mockup màn 11, 11b.

## Input

- Mọi chỗ chọn màu (event, danh mục note; nhóm chi tiêu dùng lại ở bước 6): 6 màu mặc định + "Màu khác".

## Plan

- [ ] 1. `app/src/lib/colors/` (hàm thuần + test Jest): kiểu `AppColor` = 6 tên | `#RRGGBB` · `toHex` · `isValidHex` · `textOn(color)` chọn `text`/trắng theo tương phản 4,5:1 · HSV ↔ hex.
- [ ] 2. `lib/google/mapping.ts`: hex → `colorId` Google gần nhất (khoảng cách màu) · kéo về giữ cách cũ · test.
- [ ] 3. `components/ColorRow.tsx` (thay `features/events/form/ColorPicker.tsx`): 6 chấm + chấm "Màu khác" · `components/ColorPickerDialog.tsx`: ô sáng/đậm + thanh màu (svg gradient + gesture-handler), ô hex, chip "Aa", Huỷ / Chọn.
- [ ] 4. Thay ở form event + `CategoryEditDialog` (note) · sửa kiểu `EventColor` → `AppColor` ở API, cache, form.
- [ ] 5. Mọi chỗ vẽ màu (EventBar, EventCard, EventListRow, DayTimeline, NoteCard, CategoryChips, CategoryPickerDialog, note editor) dùng `toHex` + `textOn`.
- [ ] 6. i18n en + vi ("Màu khác", "Chọn") · `typecheck && lint && test`.
- [ ] 7. Máy thật (DB local hoặc chờ bước 8 — xem ghi chú): tạo event + danh mục note màu đậm, màu nhạt → hiện đúng, chữ đọc được · event màu khác đồng bộ Google thành màu gần nhất.
- [ ] 8. Commit `feat(app): pick any colour for events and note categories` + push.

Ghi chú: DB thật chưa nhận hex tới bước 8 → thử trên máy với Supabase local, hoặc thử phần lưu hex sau khi migrate.

## Kết quả
