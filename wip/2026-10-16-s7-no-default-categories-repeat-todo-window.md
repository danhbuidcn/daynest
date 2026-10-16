# 2026-10-16 — S7: Bỏ nhóm chi tiêu mặc định, lặp lại khi sửa khoản chi, todo chỉ 1 ngày — 🔄 build v7.0.0 (11) xong, chờ bạn thử trên máy

## Input

- Bạn (2026-10-16): bỏ 3 nhóm mặc định trong nhóm chi tiêu, bắt tự chọn; todo chỉ hiện ngày mai (Sắp tới) và hôm qua (Quá hạn); lặp lại lúc có lúc không → thêm vào form sửa khoản chi.

## Plan

- [x] Migration `20261016062527_s7_no_default_expense_categories.sql`: bỏ trigger/hàm tạo nhóm; nhóm cũ thành nhóm thường (tên theo ngôn ngữ). Đã `supabase/db migrate`.
- [x] Form khoản chi: không chọn sẵn nhóm, "Chọn nhóm", Lưu khoá đến khi chọn.
- [x] Todo: `OVERDUE_DAYS = 1`, `UPCOMING_DAYS = 1`.
- [x] Form sửa khoản chi thường có dòng "Lặp lại" (quy tắc bắt đầu từ kỳ kế tiếp).
- [x] `npm run typecheck`, `npm test` (270) đạt; build `app/dist/daynest-7.0.0-11.apk/.aab`.
- [ ] Bạn thử trên máy thật (tôi không đăng nhập Google được nên chưa thử màn sau đăng nhập).

## Kết quả

- Chưa chạy `supabase/db test` (cần Docker); test RLS `rls_s4.sql` và seed tải đã sửa theo, chưa chạy.
