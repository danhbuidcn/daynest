# DB — Sprint 6

Thuộc: [Sprint 6](../index.md).

1 migration `s6_budget_recurring_appearance`, **chỉ thêm** (cột có mặc định, bảng mới, hàm, trigger) → bản app cũ chạy bình thường, **không** tăng `app_config.min_version_code`.

Lưu nhanh, tải nhanh, lỗi mạng, rung, khung xương, Hoàn tác: không đổi DB.

## Ngân sách — cột trong `user_settings`

| Cột | Quy tắc |
| --- | --- |
| `monthly_budget bigint` | Ngân sách **chung** · null = chưa đặt · check `monthly_budget between 1 and 100000000000` |

- RLS giữ như `user_settings` hiện tại. App đọc / ghi cùng các cột Cài đặt khác.

### Bảng `expense_month_budgets` — ngân sách riêng 1 tháng

| Cột | Quy tắc |
| --- | --- |
| `user_id uuid` | `default auth.uid()` · `references auth.users on delete cascade` |
| `month date not null` | Ngày 1 của tháng · check `extract(day from month) = 1` |
| `amount bigint` | null = tháng này **không** có ngân sách (dù có ngân sách chung) · check 1 → 100.000.000.000 |
| `updated_at` | trigger `set_updated_at` |

- Khoá chính `(user_id, month)` · app upsert / xoá dòng.
- RLS `user_id = auth.uid()` + `session_active()`.
- Ngân sách của tháng M = dòng tháng M nếu có (kể cả `amount` null), không thì `monthly_budget`.
- Dung lượng nhỏ: tối đa vài dòng / user / năm.

## Giao diện — cột trong `user_settings`

| Cột | Quy tắc |
| --- | --- |
| `theme text not null default 'mint'` | check in 8 bộ màu + `system` + `custom` |
| `theme_primary text` | Màu chủ đạo tự chọn `#RRGGBB` (khi `theme = 'custom'`) · check dạng hex |
| `theme_dark boolean not null default false` | Tự chọn: nền Tối |
| `background text not null default 'plain'` | `plain` · `color-1` … `color-8` · `color` (Màu khác) · `gradient-1` … `gradient-8` · `pattern-1` … `pattern-6` · `photo` (ảnh chỉ trên máy; máy không có ảnh → coi như `plain`) |
| `background_color text` | Màu nền tự chọn `#RRGGBB` (khi `background = 'color'`) · check dạng hex |
| `font text not null default 'nunito'` | check in (`nunito`, `be-vietnam-pro`, `quicksand`, `baloo-2`, `itim`, `patrick-hand`) |
| `font_scale real not null default 1` | check in (0.9, 1, 1.15) |

- Bản app cũ không đọc các cột này → vẫn chạy với giao diện mặc định.

## Khoản chi lặp lại — bảng `expense_recurrences`

| Cột | Quy tắc |
| --- | --- |
| `id uuid pk` | App sinh khi mở form (gửi lại không trùng) |
| `user_id uuid` | `default auth.uid()` · `references auth.users on delete cascade` |
| `category_id uuid not null` | `references expense_categories on delete cascade` (xoá nhóm → xoá quy tắc) |
| `amount bigint not null` | check 1 → 100.000.000.000 (như `expenses`) |
| `note text not null default ''` | ≤ 200 ký tự |
| `frequency text not null` | check in (`weekly`, `monthly`) |
| `anchor_day smallint not null` | `weekly`: thứ 1–7 (ISO) · `monthly`: ngày 1–31 · lấy từ ngày bắt đầu, giữ để tháng ngắn không làm "trôi" ngày (31 → 30 → vẫn 31 tháng sau) |
| `next_on date not null` | Ngày tới hạn kế tiếp chưa ghi |
| `created_at`, `updated_at` | Như các bảng khác · trigger `set_updated_at` |

- Index `(user_id)` — màn danh sách quy tắc · hàm tự ghi lọc theo `user_id` + `next_on`.
- RLS: đọc / thêm / sửa / xoá khi `user_id = auth.uid()` + `session_active()` · `category_id` phải thuộc cùng user (check như `expenses`).
- Sửa quy tắc: khoá lạc quan theo `updated_at` (như khoản chi).

### Cột mới trong `expenses`

| Cột | Quy tắc |
| --- | --- |
| `recurrence_id uuid` | null = khoản chi thường · `references expense_recurrences on delete set null` (xoá quy tắc → khoản chi đã ghi giữ nguyên) |

- Bản app cũ chọn cột theo tên → không thấy cột mới, không lỗi.

### Hàm `generate_due_expenses(p_today date) returns int`

- `security invoker` (chạy theo quyền user, RLS vẫn áp dụng) · `set search_path = ''`.
- Lấy quy tắc của user có `next_on <= p_today` · `for update` (khoá dòng → máy thứ 2 gọi cùng lúc phải chờ, rồi thấy `next_on` đã dời, không ghi trùng).
- Với mỗi quy tắc: lặp trong khi `next_on <= p_today` → `insert` 1 dòng `expenses` (`spent_on = next_on`, `recurrence_id`) → dời `next_on` sang kỳ sau theo `frequency`, `anchor_day` (tháng thiếu ngày → ngày cuối tháng).
- Tối đa 60 dòng / lần gọi · trả số dòng đã ghi (app > 0 → tải lại Chi tiêu).
- `p_today` do app gửi theo múi giờ Cài đặt · chặn `p_today > current_date + 1` (máy để sai ngày không ghi trước tương lai xa).
- Cùng cách tính ngày kế tiếp có ở app (`lib/expenses/`, hàm thuần có test) để hiện "Lần tới" và tạo `next_on` ban đầu · test SQL so khớp vài ca (ngày 31, tháng 2 năm nhuận, hằng tuần).

## Tải event + todo 1 lượt (không đổi DB)

- `events` → `event_exceptions` và `todos` → `todo_exceptions` đã có khoá ngoại → select lồng bảng của Supabase dùng được ngay · ngoại lệ vẫn bị RLS lọc như cũ.

## Test RLS

- `expense_recurrences`: user A không đọc / sửa / xoá được quy tắc của B · không tạo được quy tắc với `category_id` của B.
- `generate_due_expenses`: A gọi chỉ ghi khoản chi của A · máy bị đăng xuất (`session_active()` false) không ghi được.
- `monthly_budget`, cột giao diện, `expense_month_budgets`: A không đọc / sửa được của B (theo RLS `user_settings` có sẵn).

## Kiểm tra tải

- Như [S2](../../sprint-2/design/db.md#kiểm-tra-tải), chạy `supabase/db load` trên Supabase local.
- Seed thêm mỗi user giả: 5 quy tắc lặp (3 hằng tháng, 2 hằng tuần) · `monthly_budget` + 2 tháng riêng.
- Vòng lặp user ảo thêm: gọi `generate_due_expenses` → đọc event + todo 1 lượt (select lồng bảng).
- Đạt: 0 lỗi, p95 < 1 s · `explain analyze` `generate_due_expenses` dùng index `(user_id)` của `expense_recurrences`.
- Đo dung lượng thêm / user → cập nhật [§3 Mục tiêu tải](../../index.md#mục-tiêu-tải).
