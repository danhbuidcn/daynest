# 2026-10-12 — S3 bước 6: gửi lại không tạo trùng (event, danh mục) — ✅ đã duyệt, chưa làm

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

- [ ] 1. Event: form tạo mới sinh `id` 1 lần khi mở (`useState(() => Crypto.randomUUID())` ở [edit.tsx](../app/src/app/event/edit.tsx)) → truyền qua `useSaveEvent` → `createEvent(id, input)` dùng `upsert(..., { onConflict: 'id', ignoreDuplicates: false })` giống `createNote`.
- [ ] 2. Danh mục: [CategoryEditDialog.tsx](../app/src/features/notes/CategoryEditDialog.tsx) sinh `id` 1 lần khi mở hộp thêm → `saveCategory` tạo mới bằng `upsert` theo `id`. Tên trùng với danh mục **khác** vẫn báo "Tên này đã có".
- [ ] 3. Kiểm tra RLS cho `upsert` trên `events`, `note_categories` (cần quyền insert + update của chính user — đọc migration; nếu thiếu → báo bạn, không tự thêm migration).
- [ ] 4. Test Jest: `createEvent` gọi 2 lần cùng `id` → gửi `upsert` cùng `id` (mock Supabase như `eventsApi.test.ts`).
- [ ] 5. `npm run typecheck && npm run lint && npm test`.
- [ ] 6. Thử trên máy: tạo event + danh mục → mỗi cái 1 bản. Xoá dữ liệu thử.
- [ ] 7. Commit `fix(app): retrying a create no longer duplicates events or categories` + push.

**Ngoài phạm vi (ghi lại, chưa làm):** sửa event/note dùng khoá lạc quan `updated_at` → nếu lần sửa 1 đã lưu nhưng mất phản hồi, gửi lại sẽ hiện hộp "xung đột" dù không có máy khác sửa. Không tạo trùng, chỉ hỏi thừa. Bạn muốn xử lý thì tôi viết todo riêng.

## Kết quả

- 2026-10-12 11:30 — Bạn duyệt plan.
