# 2026-10-10 — S2 code bước 11: test tải, rà chữ dài, DoD → release 1.1.0 — 🔄 đang làm

## Input

- Lộ trình: [bước 10 xong](2026-10-10-s2-code-step-10-google-sync.md). Bước 11 (cuối) — xem [lộ trình](2026-10-09-s2-code-roadmap-step-3-lunar-month.md).
- Spec: [S2 DoD](../docs/specs/sprint-2/index.md#xong-khi-dod), [db.md § Kiểm tra tải](../docs/specs/sprint-2/design/db.md#kiểm-tra-tải), [Spec tổng §3 Mục tiêu tải, §4 Cuối sprint](../docs/specs/index.md#cuối-sprint-mọi-sprint).
- Chưa có công cụ test tải (máy không có k6, pgbench, psql) → dùng Node (`fetch` gọi thẳng PostgREST, ký JWT bằng `node:crypto`) + `psql` trong container DB của Supabase local.

## Output

- `supabase/load/`: seed 10.000 user giả (~50 event, 1/5 lặp, + 20 note / user), script 100 user ảo × 5 phút, `explain analyze` 4 truy vấn chính. Lệnh `supabase/db load`.
- Kết quả: 0 lỗi, p95 < 1 s, 4 truy vấn dùng đúng index.
- Rà chữ dài trên emulator (tiêu đề event/note dài, EN + VI).
- DoD S2 được tick (mục nào chưa thử được thì ghi rõ).
- Release `1.1.0` (versionCode +1): APK, tag `v1.1.0`, GitHub Release kèm APK.

## Plan

- [x] 1. `supabase/load/seed.sql`: 10.000 user (`auth.users` → trigger tạo profile + settings), 1 `user_devices` / user (session cố định để qua `session_active()`), 50 event (10 lặp, vài ngoại lệ), 3 danh mục, 20 note.
- [x] 2. `supabase/load/run.mjs`: 100 user ảo đồng thời 5 phút, mỗi vòng: đọc lịch tháng (events + exceptions) → tạo 1 event → sửa event đó (khoá `updated_at`) → trang notes đầu → tìm note. Ghi p50/p95/p99, số lỗi. Truy vấn giống hệt `features/events/api.ts`, `features/notes/api.ts`.
- [x] 3. `supabase/load/explain.sql`: `explain analyze` lịch tháng, ngoại lệ, danh sách note, tìm note (với vai trò `authenticated`).
- [x] 4. `supabase/db load` (start → reset → seed → run → explain). Chạy, ghi kết quả vào đây + db.md.
- [x] 5. Rà chữ dài trên emulator: event/note/danh mục tiêu đề dài, EN + VI, các màn Tháng/Tuần/Ngày/Danh sách/Chi tiết/Notes.
- [x] 6. `npm run typecheck && npm run lint && npm test`.
- [x] 7. Rà DoD S2, tick các mục đã đạt; ghi mục chưa thử được.
- [ ] 8. Cuối sprint: version `1.1.0` + versionCode +1 → (không có migration mới) → `npm run release` → cài đè máy → thử luồng chính → commit `chore(release): v1.1.0` → tag + push → `gh release create` kèm APK.

## Kết quả

**Test tải** (`supabase/db load`, Supabase local, 10.000 user giả = 500.000 event + 200.000 note): 100 user ảo × 5 phút, 339.318 request (1.130 req/s) — **0 lỗi, p95 136 ms, p99 234 ms** (tối đa 1,3 s). Mỗi thao tác (đọc tháng, ngoại lệ, tạo, sửa, trang notes, tìm note) p95 134–138 ms. ✅ PASS.

**`explain analyze`** (qua RLS): lịch tháng dùng `events_span_idx`; ngoại lệ dùng `event_exceptions_event_idx`; trang notes và tìm note dùng `notes_list_idx`, danh mục dùng `note_categories_user_name_key`. Không có seq scan trên bảng lớn.

**Kiểm tra mã:** `typecheck` sạch, `lint` 0 lỗi, 122 test qua.

**Rà chữ dài (emulator, bản 1.1.0 release):** tiêu đề event 100 ký tự (có từ 30 ký tự liền) — form wrap 3 dòng + bộ đếm 100/100 · Tháng, Tuần, Danh sách, Ngày cắt gọn đúng · Chi tiết wrap, không tràn · xoá event có hộp xác nhận. Chưa rà riêng note/danh mục dài.

**DoD:** tick 6 mục có bằng chứng (lịch âm + test, 4 chế độ xem, tạo/sửa/xoá event, Notes, RLS, test tải). Các mục còn lại ghi "chưa thử" ngay trong DoD — cần máy thật / 2–3 máy / phía Google. **Chưa release**: còn bước 8 (cài đè máy thật, thử luồng chính, commit + tag + GitHub Release).

**Phát hiện (đăng nhập v1.0.1 lỗi):** migration S2 đã áp lên Supabase thật, mà v1.0.1 không gọi `register_device` → `session_active()` sai → RLS chặn đọc `profiles` → "đăng nhập thất bại". Chỉ sửa được bằng cách cài v1.1.0.
