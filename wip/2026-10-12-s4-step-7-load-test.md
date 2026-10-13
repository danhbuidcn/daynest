# 2026-10-12 — S4 bước 7: Test tải — ✅ xong

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · [db.md § Kiểm tra tải](../docs/specs/sprint-4/design/db.md#kiểm-tra-tải).

## Input

- Test tải có thêm Chi tiêu · đo dung lượng DB.

## Plan

- [x] 1. `supabase/load/seed.sql`: mỗi user giả 3 nhóm có sẵn + 2 nhóm tự tạo + 730 khoản chi.
- [x] 2. `run.mjs`: thêm đọc khoản chi 1 tháng → tổng 6 tháng → tạo/sửa 1 khoản chi · `explain.sql`: 2 truy vấn mới.
- [x] 3. `supabase/db load` → đạt 0 lỗi, p95 < 1 s, 2 truy vấn dùng đúng index.
- [x] 4. Đo `pg_total_relation_size` → KB/user → cập nhật [Spec tổng §3](../docs/specs/index.md#mục-tiêu-tải) + db.md (ghi kết quả).
- [x] 5. Commit `chore(supabase): s4 load test` + push.

## Kết quả

- 2026-10-13 — Việc 1: `seed.sql`: 3 nhóm có sẵn do trigger tạo + 2 nhóm tự tạo (màu hex) + 730 khoản chi (2/ngày cả năm 2026, rải 5 nhóm) mỗi user → 7,3 triệu dòng · cuối seed in dung lượng từng bảng (KB/user) + cả DB.
- 2026-10-13 — Việc 2: `run.mjs` thêm: khoản chi tháng 10 (≥ 62 dòng) → `rpc/expense_monthly_totals` (đúng 6 tháng) → tạo khoản chi (upsert theo `id`) → sửa với khoá `updated_at` · `explain.sql` thêm truy vấn 5 (khoản chi 1 tháng), 6 (tổng 6 tháng) + 6b (câu lệnh bên trong hàm, vì `explain` của hàm SQL không hiện kế hoạch bên trong).
- 2026-10-13 — Việc 3: `supabase/db load` → 179.730 request, **0 lỗi, p95 446 ms** (p50 127, p99 757), 597 req/s → đạt. `explain`: khoản chi 1 tháng → Index Scan `expenses_period_idx`; tổng 6 tháng → Bitmap `expenses_period_idx`.
- 2026-10-13 — Phát hiện: RLS của `expenses` (nhóm phải cùng user) trong tổng 6 tháng → Seq Scan cả `expense_categories` (50.000 dòng) mỗi lần gọi; thiếu index `(user_id)` (2 index unique đều có `where`). Chưa làm chậm quá ngưỡng. Sửa = 1 migration thêm index — bạn chọn làm → [2026-10-13-expense-categories-user-index.md](2026-10-13-expense-categories-user-index.md).
- 2026-10-13 — Việc 4: dung lượng: `expenses` 1.531 MB = 157 KB/user/năm (~215 byte/dòng) · cả DB 1.757 MB ≈ 176 KB/user → vượt 500 MB gói Free nếu ~2.800 user ghi đều 2 khoản/ngày. Đã ghi vào [S4 db.md](../docs/specs/sprint-4/design/db.md#kiểm-tra-tải) + [Spec tổng §3](../docs/specs/index.md#mục-tiêu-tải) (rủi ro, theo dõi, cân nhắc Pro cùng S6).
- 2026-10-13 — Việc 5: commit `chore(supabase): s4 load test` + push.

