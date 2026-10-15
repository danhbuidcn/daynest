# 2026-10-15 — S6 bước 14: Test tải S6 — ⏳ chờ bạn duyệt

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · [db.md § Kiểm tra tải](../docs/specs/sprint-6/design/db.md) · bước trước: [bước 13](2026-10-15-s6-step-13-icons-suggested-categories.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 13).

## Hiện trạng (đã xem code)

- `supabase/load/` có `seed.sql` (10.000 user giả, tới S5), `explain.sql` (8 truy vấn), `run.mjs` (100 user ảo × 300 s, đạt khi 0 lỗi và p95 < 1 s). `supabase/db load` chạy cả ba trên Supabase **local** (Docker), không đụng DB thật.
- S6 thêm: `expense_recurrences`, `expense_month_budgets`, `user_settings.monthly_budget`, hàm `generate_due_expenses`; app gọi thêm `generate_due_expenses` khi mở tab Chi tiêu, đọc ngân sách (2 truy vấn), và đọc event / todo bằng select lồng bảng (`events` + `event_exceptions`) thay cho 2 lượt.

## Plan

- [ ] 1. `seed.sql`: mỗi user giả thêm 5 quy tắc lặp (3 hằng tháng, 2 hằng tuần; `next_on` cách hôm nay 1–2 kỳ để hàm có việc làm) · `monthly_budget` + 2 tháng riêng trong `expense_month_budgets` · thêm 2 bảng mới vào `analyze` và bảng đếm / dung lượng.
- [ ] 2. `explain.sql`: thêm `generate_due_expenses` (gọi trong giao dịch, `rollback` sau) · ngân sách (`user_settings`, `expense_month_budgets`) · event + exception select lồng bảng · todo + exception select lồng bảng. Kiểm tra dùng index `(user_id, next_on)`.
- [ ] 3. `run.mjs`: vòng lặp thêm gọi `rpc/generate_due_expenses` · đọc ngân sách · đổi 2 lượt event / todo + exception thành 1 lượt lồng bảng (khớp `fetchEvents` hiện tại) · kiểm số dòng trả về.
- [ ] 4. `supabase/db load` (mất ~6 phút, Docker cần chạy) → cần 0 lỗi, p95 < 1 s. Không đạt → tìm truy vấn chậm, sửa index bằng migration mới (hỏi bạn trước vì đụng DB).
- [ ] 5. Ghi số liệu: dung lượng thêm / user → cập nhật Spec tổng §3 "Mục tiêu tải" (dòng Dung lượng DB) · ghi kết quả vào db.md S6 · tick DoD "Test RLS… test tải đạt" nếu đủ.

## Cần bạn quyết

- Không có điểm mới. (Chạy ~6 phút, chỉ trên DB local.)

## Kết quả

- (chưa làm)
