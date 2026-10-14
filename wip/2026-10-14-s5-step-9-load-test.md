# 2026-10-14 — S5 bước 9: Test tải — ✅ xong

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · spec [S5](../docs/specs/sprint-5/index.md) · [db.md § Kiểm tra tải](../docs/specs/sprint-5/design/db.md#kiểm-tra-tải).

## Input

- Test tải có thêm Todo + chu kỳ · đo dung lượng thêm/user.

## Plan

- [x] 1. `supabase/load/seed.sql`: mỗi user giả thêm 60 todo (10 lặp hằng ngày, mỗi todo 5 việc phụ) + 300 ngoại lệ `status` + 60 ngày có kinh (12 kỳ).
- [x] 2. `run.mjs`: thêm đọc danh sách todo (37 ngày) → tick 1 todo → đọc `period_days` 12 tháng · `explain.sql`: 2 truy vấn mới (danh sách todo, `period_days` 12 tháng).
- [x] 3. `supabase/db load` → đạt 0 lỗi, p95 < 1 s, danh sách todo dùng `todos_span_idx`.
- [x] 4. Đo dung lượng `todos`, `todo_exceptions`, `period_days` → KB/user → ghi kết quả vào S5 db.md + [Spec tổng §3](../docs/specs/index.md#mục-tiêu-tải).
- [x] 5. Commit `chore(supabase): s5 load test` + push.

## Kết quả

- 2026-10-14 — Bạn `ok`. Việc 1: `seed.sql` thêm 50 todo 1 lần (mỗi 7 ngày, nửa đầu đã xong) + 10 todo lặp hằng ngày, mỗi todo 5 việc phụ · 30 ngoại lệ `status`/todo lặp (300/user) · 12 kỳ × 5 ngày từ 2025-11-01.
- 2026-10-14 — Việc 2: `run.mjs` thêm danh sách todo (tuần 12/10, 2026-09-11 → 10-26) + ngoại lệ → tick 1 lần lặp (sửa, không có thì thêm `status`, như `setTodoStatus`) → `period_days` từ 2025-10-01 (đúng 60 ngày) · `explain.sql` thêm truy vấn 7 (danh sách todo), 8 (ngày có kinh).
- 2026-10-14 — Việc 3: `supabase/db load` → 144.187 request, **0 lỗi, p95 633 ms** (p50 138, p99 1.142), 475 req/s → đạt. `explain`: danh sách todo → Bitmap `todos_span_idx` · ngày có kinh → Index Only Scan `period_days_user_id_day_key`. p95 cao hơn S4 (325 ms): 15 request/vòng thay vì 10, DB local 2,96 GB.
- 2026-10-14 — Việc 4: dung lượng S5 ~123 KB/user (`todo_exceptions` 77, `todos` 37, `period_days` 9) · cả DB ≈ 296 KB/user. Đã ghi vào [S5 db.md](../docs/specs/sprint-5/design/db.md#kiểm-tra-tải) + [Spec tổng §3](../docs/specs/index.md#mục-tiêu-tải).
- 2026-10-14 — Việc 5: commit `chore(supabase): s5 load test` + push.
