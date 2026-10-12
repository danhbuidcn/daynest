# 2026-10-12 — S4 bước 7: Test tải — ⏳ chờ duyệt

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · [db.md § Kiểm tra tải](../docs/specs/sprint-4/design/db.md#kiểm-tra-tải).

## Input

- Test tải có thêm Chi tiêu · đo dung lượng DB.

## Plan

- [ ] 1. `supabase/load/seed.sql`: mỗi user giả 3 nhóm có sẵn + 2 nhóm tự tạo + 730 khoản chi.
- [ ] 2. `run.mjs`: thêm đọc khoản chi 1 tháng → tổng 6 tháng → tạo/sửa 1 khoản chi · `explain.sql`: 2 truy vấn mới.
- [ ] 3. `supabase/db load` → đạt 0 lỗi, p95 < 1 s, 2 truy vấn dùng đúng index.
- [ ] 4. Đo `pg_total_relation_size` → KB/user → cập nhật [Spec tổng §3](../docs/specs/index.md#mục-tiêu-tải) + db.md (ghi kết quả).
- [ ] 5. Commit `chore(supabase): s4 load test` + push.

## Kết quả
