# DB — Sprint 4

Thuộc: [Sprint 4](../index.md). Quy tắc chung mọi bảng mới (id app tự sinh, `user_id`, `updated_at`, RLS + `session_active()`, khoá lạc quan): [S2 db.md](../../sprint-2/design/db.md).

## `expense_categories`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id`, `user_id` | `uuid` | |
| `key` | `text null` | Nhóm có sẵn: `food`, `transport`, `bills` · nhóm tự tạo: `null` |
| `name` | `text null` | Nhóm tự tạo: 1–30 ký tự · nhóm có sẵn: `null` (app lấy tên theo `key` từ i18n) |
| `icon` | `text` | Nhóm có sẵn: `food`, `car`, `bill` · nhóm tự tạo: 1 trong 36 tên icon (danh sách trong app), mặc định `tag` · check dạng `^[a-z]{2,20}$` (không khoá danh sách trong DB → thêm icon sau không cần migration; app gặp tên lạ → hiện `tag`) |
| `color` | `text` | 6 tên màu event hoặc mã hex `#RRGGBB` (xem dưới) |
| `created_at`, `updated_at` | `timestamptz` | |

- Check: đúng 1 trong 2 cột `key`, `name` có giá trị.
- Unique `(user_id, key)` · unique `(user_id, lower(name))`. Giới hạn 30 nhóm tự tạo: app kiểm tra.
- Nhóm có sẵn không sửa, không xoá được: RLS update/delete chỉ cho dòng `key is null`.
- Tạo nhóm có sẵn: hàm `add_default_expense_categories(user_id)` · trigger riêng `on_auth_user_created_expense_categories` gọi cho user mới (không sửa `handle_new_user()` của S1) · migration S4 gọi cho mọi user đang có.
- Xoá nhóm: `delete from expense_categories where id = :id` → khoản chi trong nhóm bị xoá theo (FK `on delete cascade`).

## `expenses`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id`, `user_id` | `uuid` | |
| `category_id` | `uuid` | → `expense_categories`, not null, `on delete cascade` |
| `amount` | `bigint` | VND, 1 → 100.000.000.000 |
| `spent_on` | `date` | Ngày chi, theo múi giờ trong Cài đặt |
| `note` | `text` | `''` mặc định, ≤ 200 ký tự |
| `created_at`, `updated_at` | `timestamptz` | |

- Index `(user_id, spent_on desc, created_at desc)` — 2 truy vấn của app: khoản chi của 1 kỳ (`spent_on between :from and :to`, tối đa 1.000 dòng) · tổng theo tháng (dưới).
- Tổng theo tháng (biểu đồ 6 tháng): hàm `expense_monthly_totals(from date, to date)` (quyền người gọi, RLS vẫn áp) → `select date_trunc('month', spent_on)::date, sum(amount) … group by 1` — không tải từng dòng về máy.
- RLS như `notes`: `category_id` phải thuộc cùng user.
- Không có cột `deleted_at` (xoá hẳn).

## Migration + test

- Migration 1 `supabase/migrations/20261012102236_s4_expenses.sql`: 2 bảng + RLS + index + trigger `updated_at` + hàm tổng theo tháng + nhóm có sẵn (user mới + user cũ). Chỉ thêm → đã lên DB thật 2026-10-12.
- Migration 2 `supabase/pending/20261012102237_s4_any_colour.sql` (+ test `rls_s4_colour.sql`): màu hex cho `events`, `event_exceptions`, `note_categories` + `min_version_code = 6` — giữ lại tới lúc release S4 ([pending/README.md](../../../../supabase/pending/README.md)).
- **Màu bất kỳ (toàn app):** check cột `color` của `events`, `event_exceptions` (màu riêng của "chỉ lần này"), `note_categories`, `expense_categories` đổi thành `color in (6 tên) or color ~ '^#[0-9A-F]{6}$'` (hex viết hoa).
- Bản app cũ chỉ hiểu 6 tên màu → migration tăng `app_config.min_version_code` lên `versionCode` của bản S4 (Spec tổng §4 bước 3).
- `supabase/tests/rls_s4.sql`: 2 user giả · A không đọc/sửa/xoá được nhóm, khoản chi của B · A không gắn khoản chi vào nhóm của B · không sửa/xoá được nhóm có sẵn · xoá nhóm tự tạo → khoản chi trong nhóm bị xoá · user mới có đủ 3 nhóm · `color` nhận 6 tên + hex hợp lệ, từ chối giá trị khác (`#abc`, `red`) ở cả 3 bảng.

## Kiểm tra tải

- Như [S2](../../sprint-2/design/db.md#kiểm-tra-tải), chạy `supabase/db load` trên Supabase local.
- Seed thêm: mỗi user giả 3 nhóm có sẵn + 2 nhóm tự tạo + **730 khoản chi** (2 khoản/ngày × 1 năm).
- Thêm vào vòng lặp user ảo: đọc khoản chi 1 tháng → tổng 6 tháng → tạo/sửa 1 khoản chi.
- Đạt: 0 lỗi, p95 < 1 s · `explain analyze` 2 truy vấn (khoản chi theo kỳ, tổng 6 tháng) dùng đúng index.
- Kết quả (2026-10-13): 179.730 request, 0 lỗi, p50 127 ms, p95 446 ms, p99 757 ms, 597 req/s → **đạt**. Khoản chi 1 tháng dùng `expenses_period_idx` (Index Scan); tổng 6 tháng (câu lệnh trong hàm) dùng `expenses_period_idx` (Bitmap). p95 cao hơn S2 (136 ms) vì mỗi vòng có 10 request thay vì 6 và DB local nặng 1,76 GB (S2 ~0,2 GB).
- Index `expense_categories (user_id)` (migration `20261013042021`, thêm sau lần đo đầu): kiểm tra RLS "nhóm thuộc cùng user" trước đó quét cả bảng `expense_categories` (Seq Scan 50.000 dòng / lần gọi) vì 2 index unique đều có điều kiện `where`; nay dùng `expense_categories_user_idx`. Chạy lại (2026-10-13): 238.190 request, 0 lỗi, p50 97 ms, **p95 325 ms**, p99 566 ms, 792 req/s · bảng `expense_categories` thêm ~1 MB (1,1 KB/user).
- Dung lượng đo (2026-10-13, 730 khoản chi/user): `expenses` 1.531 MB = **157 KB/user/năm** (~215 byte/dòng cả 3 index) · `expense_categories` 1 KB/user · cả DB 1.757 MB = ~176 KB/user. Vượt 500 MB gói Free khi ~2.800 user ghi đều 2 khoản/ngày cả năm → rủi ro ghi ở [§3](../../index.md#mục-tiêu-tải).
- **Đo dung lượng:** `pg_total_relation_size('expenses')` / số user → cập nhật [§3 Mục tiêu tải](../../index.md#mục-tiêu-tải). Ước tính trước: ~150 byte/dòng (cả index) × 730 ≈ 110 KB/user/năm → 10.000 user ≈ 1,1 GB/năm, **vượt 500 MB gói Free**. Thực tế ít user ghi đều mỗi ngày; nếu số đo vẫn vượt → ghi rủi ro, theo dõi, cân nhắc gói Pro ($25/tháng, [supabase-plans.md](../../architecture/supabase-plans.md)) cùng lúc có thu nhập ở [S6](../../sprint-6/index.md).
