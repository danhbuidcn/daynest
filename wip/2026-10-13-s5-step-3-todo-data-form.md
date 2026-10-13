# 2026-10-13 — S5 bước 3: Todo — dữ liệu + form — ✅ xong

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · spec [S5 § Todo](../docs/specs/sprint-5/index.md#todo) · [db.md § Todo](../docs/specs/sprint-5/design/db.md#todo--bảng-mới-todos-todo_exceptions) · [mockup](../docs/specs/sprint-5/design/mockups.html) (form, chi tiết Todo, nút +).

## Input

- Bảng `todos`, `todo_exceptions` đã có trên DB thật (bước 1).
- Event đã có: `features/events/` (`event.ts` kiểu + đổi cột, `api.ts`, `useEvents.ts` cache, `occurrences.ts` trải lặp, `useEventFormSave.ts` + `OccurrenceDialogs.tsx` "Chỉ lần này", `form/*`) · màn `app/event/edit.tsx`, `app/event/[id].tsx`.
- Việc phụ: khối checklist `features/notes/editor/ChecklistBlock.tsx`.

## Output

- Tạo / sửa / xoá todo, lặp, "Chỉ lần này", nhắc (lưu `reminder_minutes`; đặt thông báo thật ở bước 4) · việc phụ thêm / sửa / xoá / kéo đổi thứ tự · tick ở màn chi tiết.
- Chưa hiện trên Lịch, chưa có danh sách todo (bước 4, 5).

## Plan

- [x] 1. `features/todos/todo.ts`: kiểu `TodoInput` (= `EventInput` + `subtasks`), `TodoRow`, đổi cột ↔ kiểu · dùng lại `computeSpan`, phần đổi cột chung của event (tách hàm nhỏ nếu cần, không đổi behavior event).
- [x] 2. `lib/todo-status` (hàm thuần) + test `todoStatus.test.ts`: trạng thái 1 lần (todo không lặp lấy `done`/`done_subtasks`; lần lặp lấy từ exception) · tick todo → mọi việc phụ xong · tick đủ việc phụ → todo xong · bỏ tick 1 việc phụ → todo chưa xong · "2/5" · bỏ `id` việc phụ đã xoá.
- [x] 3. `features/todos/api.ts` + `useTodos.ts`: tải theo khoảng ngày + exceptions, tạo / sửa (khoá `updated_at`) / xoá mềm, upsert exception (`skip`, `override`, `status` — đã có `override` thì chỉ cập nhật `done`, `done_subtasks`) · cache react-query như event · trải lặp dùng `occurrencesForEvents` (nhận chung dạng dữ liệu).
- [x] 4. Form Todo `app/todo/edit.tsx`: tiêu đề · chi tiết · Việc phụ (dùng lại `ChecklistBlock`, ≤ 50 việc, ≤ 200 ký tự, kéo đổi thứ tự) · cả ngày (mặc định bật) / giờ · nhắc (mặc định tắt) · lặp · màu · Lưu / "Chỉ lần này" như event (dùng lại `form/*`, `OccurrenceDialogs`).
- [x] 5. Chi tiết Todo `app/todo/[id].tsx`: ô tick + tiêu đề · việc phụ tick được (lạc quan, lỗi → trả lại + toast) · thời gian · lặp · nhắc · chi tiết · ⋯ Sửa / Xoá (lặp → hỏi "Chỉ lần này / Tất cả").
- [x] 6. Pop-up `+` (`app/(tabs)/_layout.tsx`): thêm "Todo" sau "Sự kiện" → form Todo ngày đang chọn · i18n `todos.*` (VI + EN, cùng khoá, có `_one`).
- [x] 7. `npm run typecheck && npm run lint && npm test` · thử máy ảo: tạo todo có 3 việc phụ, kéo đổi thứ tự, tick, todo lặp sửa "Chỉ lần này", xoá · commit `feat(app): todo data, form and detail` + push.

Không làm ở bước này: todo trên Lịch, đặt thông báo nhắc (bước 4) · đồng bộ Google (spec: không đồng bộ — bảng riêng nên không cần sửa gì).

## Kết quả
- 2026-10-13 — Bạn `ok` → bắt đầu.
- 2026-10-13 — 1–3: `lib/todos` (trạng thái xong + test), `features/todos/todo.ts` (kiểu, đổi cột dùng lại `toEvent`/`toEventColumns` — không sửa event, trải lặp dùng `occurrencesForEvent`, `withStatus` cho tick lạc quan), `api.ts`, `useTodos.ts`. Xoá todo = xoá hẳn như event (ngoại lệ tự xoá theo), không xoá mềm.
- 2026-10-13 — 4–6: form `app/todo/edit.tsx`, chi tiết `app/todo/[id].tsx`, `TodoTick` (bước 4 dùng lại), pop-up + 2×2 (Sự kiện · Todo / Ghi chú · Khoản chi), icon `todo`, i18n `todos.*` + `events.quickAdd.todo`. Sửa nhỏ dùng chung (mặc định giữ nguyên hành vi cũ): `ChecklistBlock` thêm `maxItems`, `addLabel`, `placeholder`, `showWhenEmpty`, `rowBackground` · `FormScreen` thêm `nestable` (kéo thả cần) · `OccurrenceActionDialog` thêm `title` ("Todo đang lặp lại"). Tick trong form của todo lặp → ghi vào lần lặp đang sửa (tạo mới / đổi lặp → lần đầu).
- typecheck qua · lint 0 lỗi (3 cảnh báo cũ) · `npm test` 25 bộ, 187 test qua (mới: `todoStatus` 10, `todoOccurrences` 8, `todoFormState` 5).
- 2026-10-13 — Build APK (`npm run release`) bị chặn quyền tự động → chưa thử máy ảo, chưa commit.
- 2026-10-13 15:45 — Bạn cho phép `npm run release` (`.claude/settings.local.json`, không commit). Build OK (10 phút 25 giây), cài máy ảo `Pixel_5_API_34`. Lưu ý: file `app/dist/daynest-4.0.0-6.apk/.aab` trên máy này bị ghi đè bằng bản thử (bản trên GitHub Release không đổi).
- 2026-10-13 15:53 — Thử máy ảo (đọc DB thật để kiểm tra, mở chi tiết bằng `daynest://todo/<id>` vì todo chưa lên Lịch):
  - Pop-up + 2×2 đúng mockup · form Todo: cả ngày bật, nhắc tắt · thêm 3 việc phụ, ✕ xoá dòng trống, kéo "Viec C" lên đầu · tick A → Lưu, "Đã lưu". DB: thứ tự C, A, B, `done_subtasks` = [A], dòng trống bị bỏ.
  - Chi tiết: tick ô tròn → 3/3, gạch ngang · bỏ tick A → 2/3, todo về chưa xong.
  - Sửa → lặp hằng ngày → Lưu: hàng todo `done` = false, `[]`; ngày 13/10 có dòng `status` giữ tick C, B · mở 14/10 → 0/3 (tick riêng từng lần).
  - 14/10 sửa tiêu đề → hộp "Todo đang lặp lại" → Chỉ lần này → dòng `override`, màn hiện "D2" · tick A trên 14/10 → vẫn `override`, `done_subtasks` = [A].
  - Xoá 14/10 Chỉ lần này → `skip` · xoá Tất cả từ 15/10 → DB 0 todo, 0 ngoại lệ (đã dọn).
