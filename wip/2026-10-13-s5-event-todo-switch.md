# 2026-10-13 — S5: form tạo chuyển qua lại Sự kiện ↔ Todo — ✅ xong

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · yêu cầu mới của bạn (2026-10-13 16:20): "ở form tạo todo có thể chuyển sang form tạo event, dùng lại và thiết kế lại mockup".

## Input

- Bạn chọn **A**: nút chuyển **Sự kiện | Todo** chỉ hiện khi **tạo mới**; sửa thì không đổi loại.
- Chuyển qua lại giữ nội dung đã nhập (tiêu đề, chi tiết, cả ngày / giờ, nhắc, lặp, màu). Việc phụ chỉ ở Todo: sang Sự kiện thì ẩn, quay lại Todo còn nguyên; lưu là Sự kiện → bỏ việc phụ.
- Hiện có 2 màn riêng: `app/event/edit.tsx`, `app/todo/edit.tsx` (cùng `FormState`, cùng `form/*`).

## Output

- Spec S5 + mockup mới có nút chuyển · app: từ pop-up `+` (Sự kiện hoặc Todo), pop-up ngày, chế độ Tuần / Ngày → form tạo có nút chuyển; lưu đúng loại đang chọn.

## Plan

Bạn đổi thiết kế (16:45, chọn A): **không dùng thanh chọn**; tiêu đề form tạo là nút "Todo ▾" / "Sự kiện ▾" → mở lại pop-up 4 ô của nút `+`. Ghi chú / Khoản chi → mở form đó thay form này, đã nhập gì thì hỏi "Bỏ thay đổi?", không mang nội dung.

- [x] 1. Spec `sprint-5/index.md`: § Todo › "Chuyển loại khi tạo" (viết lại theo pop-up) · § Màn hình · DoD · mục Thiết kế (20 màn).
- [x] 2. Mockup: màn 2 tiêu đề "Todo ▾" · màn 2b pop-up 4 ô, ô đang dùng có viền + ✓ · màn 2c form đã chuyển sang Sự kiện.
- [x] 3. `QuickAddDialog`: thêm `current?` (ô đang dùng có viền `primary` + ✓) · `FormScreen` / `ScreenHeader`: tiêu đề bấm được (`onPressTitle` → chữ + mũi tên xuống).
- [x] 4. Form tạo chung `features/todos/EntryForm.tsx` (chuyển `TodoForm` từ `app/todo/edit.tsx` ra, thêm `kind`): Việc phụ chỉ hiện khi Todo · Lưu gọi `useEventFormSave` hoặc `useTodoFormSave` theo `kind` · `/event/edit?date=` và `/todo/edit?date=` khi tạo đều dùng form này (chọn sẵn loại); màn sửa giữ nguyên · chọn Ghi chú / Khoản chi → (hỏi bỏ thay đổi nếu đã nhập) → `router.replace` sang form đó.
- [x] 5. Hàm thuần `switchKind` (ô chưa sửa → mặc định loại mới, đã sửa → giữ) + test · i18n nếu cần (VI + EN) · `npm run typecheck && npm run lint && npm test`.
- [x] 6. `npm run release` → máy ảo: + › Todo → nhập tiêu đề, 2 việc phụ → "Todo ▾" → Sự kiện (giữ tiêu đề, giờ + nhắc mặc định Sự kiện, ẩn việc phụ) → về Todo (còn việc phụ) → lưu · + › Sự kiện → đổi Todo → lưu · đổi sang Ghi chú khi đã nhập → hỏi bỏ thay đổi → mở Ghi chú · màn sửa tiêu đề không bấm được · dọn dữ liệu thử · commit `feat(app): switch entry type from the create form` + push.

## Kết quả
- 2026-10-13 — Bạn `ok` theo đề xuất: ô chưa sửa → mặc định của loại mới, đã sửa → giữ.
- 2026-10-13 — 1–2: spec § Todo thêm "Chuyển loại khi tạo", § Màn hình, DoD, mục Thiết kế (19 màn) · mockup màn 2 có nút chuyển (dùng lại thanh chọn `seg two` của design-system), thêm màn 2b (đã chuyển sang Sự kiện: giữ tiêu đề / lặp / màu, giờ 10:00–11:00, nhắc 15 phút, ẩn Việc phụ). Chụp trang bằng Chrome để kiểm.
- 2026-10-13 16:45 — Bạn đổi ý: **không dùng thanh chọn (tab)** ở đầu form; bấm vào đầu form → mở pop-up 4 lựa chọn giống màn 1 (nút +). Việc 1–2 (spec, mockup theo thanh chọn) phải sửa lại. Chưa sửa code. Đang hỏi bạn cách xử lý Ghi chú / Khoản chi.
- 2026-10-13 16:55 — Bạn chọn **A** (Ghi chú / Khoản chi mở form mới, không mang nội dung). Đã sửa spec + mockup theo pop-up (chụp Chrome kiểm). Plan code viết lại (việc 3–6), chờ duyệt.
- 2026-10-13 — Bạn `ok` plan code. Việc 3 xong: icon `chevronDown`, `ScreenHeader`/`FormScreen` có `onPressTitle`, `QuickAddDialog` có `current` (viền + ✓); tiêu đề pop-up (thứ, ngày · giờ) chuyển vào `QuickAddDialog` để 2 chỗ dùng chung. typecheck qua.
- 2026-10-13 — Việc 4–5 xong: `features/todos/EntryForm.tsx` (form Todo cũ chuyển ra + `kind`; dùng cho tạo Sự kiện / Todo và sửa Todo; sửa Sự kiện giữ `EventForm`) · `switchKind` trong `todoFormState.ts` (nhóm "cả ngày / giờ" và "nhắc" chưa sửa → mặc định loại mới) + 3 test · i18n `todos.form.changeKind`. typecheck ✓ · lint 0 lỗi (3 cảnh báo cũ ở `i18n/index.ts`) · test 191/191 ✓.
- 2026-10-13 17:05 — Việc 6: `npm run release` (7 phút 46 giây) → cài lên máy ảo, thử:
  - + › Todo → tiêu đề "Todo ▾", nhập tiêu đề + 2 việc phụ → bấm tiêu đề → pop-up 4 ô, ô Todo có viền + ✓ → Sự kiện: giữ tiêu đề, giờ 18:00–19:00, nhắc 15 phút, ẩn việc phụ → về Todo: còn 2 việc phụ, cả ngày, nhắc tắt → lưu: todo "0/2" trên Tuần ✓
  - + › Sự kiện → đổi Todo → lưu: todo cả ngày ✓ · + › Todo → đổi Sự kiện → lưu: sự kiện 18:00–19:00 có chuông ✓
  - Đã nhập → Ghi chú → hỏi "Bỏ thay đổi?" → Bỏ → mở ghi chú trống; Back 2 lần ra màn hình chính (form cũ không còn) ✓ · chưa nhập → Khoản chi → mở thẳng, Back 1 lần về Lịch ✓
  - Màn sửa todo: tiêu đề "Todo" chữ thường, bấm không mở pop-up ✓
  - Đã dọn: 2 todo + 1 sự kiện thử (xoá trên app); không có ghi chú trống nào bị tạo.
  - Ô ở chế độ Tuần cắt tiêu đề dài, không có "…" ("Thu doi loai" → "Thu doi lo"): bạn xác nhận là thiết kế, không phải lỗi.
