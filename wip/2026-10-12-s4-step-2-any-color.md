# 2026-10-12 — S4 bước 2: Màu bất kỳ (toàn app) — ✅ xong

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · [§ Màu bất kỳ](../docs/specs/sprint-4/index.md#màu-bất-kỳ) · mockup màn 11, 11b.

## Input

- Mọi chỗ chọn màu (event, danh mục note; nhóm chi tiêu dùng lại ở bước 6): 6 màu mặc định + "Màu khác".

## Plan

- [x] 1. `app/src/lib/colors/` (hàm thuần + test Jest): kiểu `AppColor` = 6 tên | `#RRGGBB` · `toHex` · `isValidHex` · `textOn(color)` chọn `text`/trắng theo tương phản 4,5:1 · HSV ↔ hex.
- [x] 2. `lib/google/mapping.ts`: hex → `colorId` Google gần nhất (khoảng cách màu) · kéo về giữ cách cũ · test.
- [x] 3. `components/ColorRow.tsx` (thay `features/events/form/ColorPicker.tsx`): 6 chấm + chấm "Màu khác" · `components/ColorPickerDialog.tsx`: ô sáng/đậm + thanh màu (svg gradient + gesture-handler), ô hex, chip "Aa", Huỷ / Chọn.
- [x] 4. Thay ở form event + `CategoryEditDialog` (note) · sửa kiểu `EventColor` → `AppColor` ở API, cache, form.
- [x] 5. Mọi chỗ vẽ màu (EventBar, EventCard, EventListRow, DayTimeline, NoteCard, CategoryChips, CategoryPickerDialog, note editor) dùng `toHex` + `textOn`.
- [x] 6. i18n en + vi ("Màu khác", "Chọn") · `typecheck && lint && test`.
- [x] 7. Máy thật — bạn chọn **chỉ thử giao diện** (hàng màu, hộp chọn màu, ô hex, "Aa"); lưu hex + đồng bộ Google thử ở bước 8 sau khi migrate. Phần dồn sang bước 8: tạo event + danh mục note màu đậm, màu nhạt → hiện đúng, chữ đọc được · event màu khác đồng bộ Google thành màu gần nhất.
- [x] 7a. Bạn chốt version `4.0.0` (versionCode 6) → đổi `app/app.config.ts` ngay · `npm run release` trên máy này · cài máy ảo `Pixel_5_API_34` thử giao diện (không lưu màu hex).
- [x] 8. Commit `feat(app): pick any colour for events and note categories` + push.

- [x] 4b. (thêm, bạn duyệt 2026-10-13) `event_exceptions.color` cũng chỉ nhận 6 tên → sửa "chỉ lần này" của event màu hex sẽ lỗi. Thêm bảng này vào migration chờ `supabase/pending/20261012102237_s4_any_colour.sql` + test `rls_s4_colour.sql` + `db.md`.

Ghi chú: DB thật chưa nhận hex tới bước 8 → thử trên máy với Supabase local, hoặc thử phần lưu hex sau khi migrate.

## Kết quả
- 2026-10-13 — Bạn duyệt. Xong việc 1–6:
  - `lib/colors/` (kiểu `AppColor`, `toHex`, `parseHex`, `textOn`, HSV ↔ hex) · `lib/google/mapping.ts`: `toGoogleColorId` (hex → màu Google gần nhất trong 11 màu), `keepLocalColor` — kéo về giữ màu hex nếu trên Google vẫn là màu đã đẩy lên (nếu không, lần kéo ngay sau khi đẩy sẽ đổi hex thành tên màu); dùng ở `pull.ts` (chuỗi + lần lặp), `push.ts`.
  - `components/ColorRow.tsx` + `components/ColorPickerDialog.tsx` (svg gradient + touch responder thường, không cần gesture-handler trong Modal) · xoá `features/events/form/ColorPicker.tsx`.
  - `EventColor` → `AppColor` · mọi chỗ vẽ màu dùng `toHex`; thanh event dùng `textOn`.
  - i18n `colorPicker.*` · `typecheck` qua · `lint` 0 lỗi (3 cảnh báo cũ) · `jest` 144/144 (thêm `colors.test.ts`).
- 2026-10-13 — 4b: thêm `event_exceptions` vào migration chờ + 2 test trong `rls_s4_colour.sql` + `db.md`. `supabase/db test` (tạm chép migration chờ vào `migrations/`, xong xoá): 4 file, 72 test qua.
- 2026-10-13 09:55 — Version `4.0.0` (versionCode 6) · `npm run release` trên máy này: OK (14 phút 45 giây) · cài máy ảo `Pixel_5_API_34`, đăng nhập được. Thử: hàng 7 chấm ở form event + hộp thêm danh mục (vừa khung) · hộp "Màu khác" giống mockup · kéo ô sáng/đậm + thanh màu → mã hex, ô màu, "Aa" đổi theo; nền đậm → "Aa" trắng · gõ mã hex → ô, thanh, vị trí nút kéo đổi theo · hộp nằm trên bàn phím · bấm Chọn → chấm cuối hiện màu đó · hộp chọn màu mở được trong hộp danh mục.
  - Sửa sau khi thử: viền "đang chọn" sát chấm, gần như không thấy trên màu đậm → viền 2 px cách chấm 3 px (đúng design-system) · ô hex tự viết hoa. Build lại để xem.
- 2026-10-13 — Kiểm lại sau khi sửa: `typecheck` qua · `lint` 0 lỗi · `jest` 144/144.
- 2026-10-13 10:16 — Build lại OK (10:14) · cài máy ảo `Pixel_5_API_34`: viền "đang chọn" cách chấm, thấy rõ cả trên màu đậm `#1A3C8E` · gõ `1a3c8e` → ô hiện `#1A3C8E`, "Aa" trắng · bấm Chọn → chấm cuối màu đó, có viền. Không lưu (DB thật chưa nhận hex).

