# 2026-10-12 — S3 bước 6: gửi lại không tạo trùng (event, danh mục) — ✅ xong

Thuộc: [S3 lộ trình](2026-10-12-s3-plan.md) · spec [S3 mục 4](../docs/specs/sprint-3/index.md) · nguyên tắc [§3](../docs/specs/index.md#nguyên-tắc-mở-rộng).

## Input

- Spec: mọi thao tác tạo — app sinh `id` 1 lần khi mở form, gửi lại dùng cùng `id` → không tạo trùng.

## Rà code (2026-10-12 11:25)

| Thao tác tạo | Hiện trạng | Gửi lại sau khi lần 1 đã lưu nhưng mất phản hồi |
| --- | --- | --- |
| Tạo event — [api.ts](../app/src/features/events/api.ts) `createEvent` | `id` sinh **mỗi lần gọi** | ❌ tạo event thứ 2 |
| Tạo danh mục — [notes/api.ts](../app/src/features/notes/api.ts) `saveCategory` | không gửi `id` | ❌ không trùng (tên là duy nhất) nhưng báo sai "Tên này đã có" |
| Tạo note | `id` sinh khi mở màn + `upsert` | ✅ |
| Lần lặp "Chỉ lần này" | `upsert` theo (event, ngày) | ✅ |
| Đẩy event lên Google | `id` Google lấy từ `id` event, trùng → 409 → sửa lại | ✅ |
| Kéo event từ Google về | tìm theo `google_event_id`, có unique index | ✅ |
| Bấm Lưu 2 lần liền | nút Lưu tắt khi đang lưu (`saving`) | ✅ |

## Plan

- [x] 1. Event: form tạo mới sinh `id` 1 lần khi mở (`useState(() => Crypto.randomUUID())` ở [edit.tsx](../app/src/app/event/edit.tsx)) → truyền qua `useSaveEvent` → `createEvent(id, input)` dùng `upsert(..., { onConflict: 'id', ignoreDuplicates: false })` giống `createNote`.
- [x] 2. Danh mục: [CategoryEditDialog.tsx](../app/src/features/notes/CategoryEditDialog.tsx) sinh `id` 1 lần khi mở hộp thêm → `saveCategory` tạo mới bằng `upsert` theo `id`. Tên trùng với danh mục **khác** vẫn báo "Tên này đã có".
- [x] 3. Kiểm tra RLS cho `upsert` trên `events`, `note_categories` (cần quyền insert + update của chính user — đọc migration; nếu thiếu → báo bạn, không tự thêm migration).
- [x] 4. Test Jest: `createEvent` gọi 2 lần cùng `id` → gửi `upsert` cùng `id` (mock Supabase như `eventsApi.test.ts`).
- [x] 5. `npm run typecheck && npm run lint && npm test`.
- [x] 6. Thử trên máy: tạo event + danh mục → mỗi cái 1 bản. Xoá dữ liệu thử.
- [x] 7. Commit `fix(app): retrying a create no longer duplicates events or categories` + push.

**Ngoài phạm vi (ghi lại, chưa làm):** sửa event/note dùng khoá lạc quan `updated_at` → nếu lần sửa 1 đã lưu nhưng mất phản hồi, gửi lại sẽ hiện hộp "xung đột" dù không có máy khác sửa. Không tạo trùng, chỉ hỏi thừa. Bạn muốn xử lý thì tôi viết todo riêng.

## Kết quả

- 2026-10-12 11:30 — Bạn duyệt plan.
- 2026-10-12 12:00 — Bước 1–5 xong:
  - Event: `id` sinh 1 lần trong `useEventFormSave` (cùng vòng đời với form, thay vì `edit.tsx` như plan — gọn hơn, không phải truyền qua props) → `createEvent(id, input)` dùng `upsert` theo `id`.
  - Danh mục: `CategoryEditDialog` sinh `id` khi mở → `saveCategory({ id, isNew, … })`: tạo mới = `upsert` theo `id`, sửa = `update` như cũ (để không tạo lại danh mục vừa bị xoá ở máy khác).
  - RLS: `events`, `note_categories` đều có policy `for all` + grant insert/update → `upsert` chạy được, không cần migration.
  - Test `createEvent` gọi 2 lần cùng `id` → 2 lệnh `upsert` cùng `id`, không có `insert`. typecheck + lint (0 lỗi) + test 126/126 qua.
- 2026-10-12 11:50 — Thử trên máy: tạo event "ZZTestIdem" bấm Lưu 2 lần liền → ngày 12/10 chỉ có 1 event (đã đẩy lên Google). Tạo danh mục "ZZCat" bấm Lưu 2 lần → 1 danh mục; sửa tên → "ZZCat2" chạy đúng. Đã xoá event (cả trên Google) và danh mục thử. Trường hợp "lưu xong nhưng mất phản hồi rồi gửi lại" không tái hiện được bằng tay → kiểm bằng test Jest.
- 2026-10-12 11:55 — Commit + push.
