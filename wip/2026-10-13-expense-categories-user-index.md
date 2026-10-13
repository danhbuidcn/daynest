# 2026-10-13 — Index `expense_categories (user_id)` — ✅ xong (lên DB thật ở bước 8)

Thuộc: [S4 bước 7](2026-10-12-s4-step-7-load-test.md) (phát hiện khi test tải) · [S4 db.md](../docs/specs/sprint-4/design/db.md#kiểm-tra-tải).

## Input

- RLS của `expenses` kiểm "nhóm thuộc cùng user" → Seq Scan cả `expense_categories` mỗi lần lấy tổng 6 tháng. Bạn chọn thêm index (2026-10-13).

## Plan

- [x] 1. `supabase/db new s4_expense_categories_user_idx` → `create index expense_categories_user_idx on public.expense_categories (user_id);` (chỉ thêm, không cần để `pending/`).
- [x] 2. `supabase/db test` (RLS) · `supabase/db load` → `explain` 6b hết Seq Scan, test tải vẫn đạt.
- [x] 3. Ghi kết quả vào S4 db.md (thay dòng "Lưu ý") · chưa lên DB thật: `supabase/db migrate` ở bước 8.
- [x] 4. Commit `chore(supabase): index expense categories by user` + push.

## Kết quả

- 2026-10-13 — Việc 1: `migrations/20261013042021_s4_expense_categories_user_idx.sql`. Lưu ý bước 8: migration pending `20261012102237_s4_any_colour.sql` giờ cũ hơn → đổi timestamp khi chuyển vào `migrations/` (theo `pending/README.md`).
- 2026-10-13 — Việc 2a: `supabase/db test` → 3 file, 65 test qua.
- 2026-10-13 — Việc 2b: `supabase/db load`: `explain` 6b → `Index Scan using expense_categories_user_idx` (rows=5), hết Seq Scan · 238.190 request, 0 lỗi, p95 325 ms (trước 446 ms), 792 req/s (trước 597). Một phần chênh lệch có thể do dao động giữa 2 lần chạy trên máy này.
- 2026-10-13 — Việc 3: S4 db.md thay dòng "Lưu ý" bằng kết quả · chưa lên DB thật → `supabase/db migrate` ở bước 8.
- 2026-10-13 — Việc 4: commit `chore(supabase): index expense categories by user` + push.

