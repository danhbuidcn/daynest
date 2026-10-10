# 2026-10-10 — S2 code bước 4: migration (events, notes, giới hạn 2 thiết bị) — ✅ xong

## Input

- Lộ trình: [wip/2026-10-09-s2-code-roadmap-step-3-lunar-month.md](2026-10-09-s2-code-roadmap-step-3-lunar-month.md) — bước 3 (lịch âm) đã xong, tiếp bước 4.
- Spec: [db.md](../docs/specs/sprint-2/design/db.md), [F7-device-limit.md](../docs/specs/sprint-2/F7-device-limit.md).

## Plan

- [x] 1. `supabase/db new s2_calendar_notes` → migration: cột mới `user_settings` (`notifications_enabled`, `show_lunar`, `show_holidays`, `time_zone` + trigger kiểm tên múi giờ) · bảng `events`, `event_exceptions`, `user_devices`, `google_sync_state`, `note_categories`, `notes` · hàm `register_device`, `session_active`, `touch_device`, `unregister_device`, `delete_note_categories` · RLS mọi bảng (mới + sửa `profiles`, `user_settings` thêm điều kiện `session_active()`).
- [x] 2. `supabase/tests/rls_s2.sql`: đăng nhập máy 3 → máy sớm nhất bị đá, phiên đó không đọc/ghi được bảng nào kể cả `profiles`/`user_settings`; đăng nhập lại cùng `device_id` không đá máy khác; 2 user giả A/B không đọc/sửa/xoá được `events`, `event_exceptions`, `google_sync_state`, `note_categories`, `notes` của nhau; A không gắn note vào danh mục B, không gắn ngoại lệ vào event B; `delete_note_categories` xoá đúng phạm vi RLS; `time_zone` sai tên bị chặn.
- [x] 3. Sửa `supabase/tests/rls_s1.sql`: thêm `register_device` cho user A trước khi test (RLS S1 giờ cũng cần phiên đang hoạt động).
- [x] 4. `supabase/db test` (Docker local) → 43/43 test qua.
- [x] 5. `supabase/db migrate` lên project thật (đã hỏi, bạn đồng ý) → `supabase/db status` khớp.
- [x] 6. Commit `chore(supabase): s2 migration — events, notes, 2-device limit`, push.

## Kết quả

- Bug tự phát hiện lúc viết test: `register_device` dùng `offset 2` để tìm máy cũ nhất — sai, `offset 2` trả về máy **mới nhất** trong 3 máy (ngược lại). Sửa: đếm số máy, nếu > 2 thì lấy máy có `signed_in_at` nhỏ nhất (`order by ... limit 1`, không `offset`) để đá.
- Việc còn lại trước khi release S2: bước 5 (`supabase/db migrate`), bước 6 (commit), rồi tiếp bước 5 lộ trình (F7 — giới hạn 2 thiết bị trong app).
