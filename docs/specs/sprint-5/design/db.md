# DB — Sprint 5

Thuộc: [Sprint 5](../index.md).

## Todo — bảng mới `todos`, `todo_exceptions`

Bảng riêng (bạn chốt 2026-10-13), không đụng `events` → bản app cũ không bị ảnh hưởng, đồng bộ Google không cần sửa. App dùng lại hàm thuần trải lặp (`lib/recurrence/`) và đặt nhắc (`lib/notifications/`) — 2 hàm nhận cùng dạng dữ liệu cho event và todo.

### `todos`

Giống `events`, **bỏ** các cột Google (`google_*`), **thêm**:

| Cột | Quy tắc |
| --- | --- |
| `subtasks jsonb not null default '[]'` | Mảng `{id, text}` ≤ 50 phần tử, `id` là uuid, `text` 1–200 ký tự · kiểm tra bằng hàm `subtasks_valid()` (check không dùng được truy vấn con) |
| `done boolean not null default false` | Todo không lặp đã xong |
| `done_subtasks uuid[] not null default '{}'` | `id` việc phụ đã xong (todo không lặp) |

- Giữ nguyên các cột còn lại của `events`: `title`, `note`, `color` (6 tên + hex), `all_day`, `starts_at` / `ends_at` / `start_date` / `end_date`, `repeat`, `repeat_interval`, `repeat_until`, `lunar_month`, `lunar_day`, `reminder_minutes`, `span_start`, `span_end`, `deleted_at`, `created_at`, `updated_at` + cùng các check.
- Index `todos_span_idx (user_id, span_start)` — Lịch và danh sách todo đều tải theo khoảng ngày.
- RLS `user_id = auth.uid()` + `session_active()` như `events`.

### `todo_exceptions`

Giống `event_exceptions` (bỏ `google_status`), `todo_id` thay `event_id`, **thêm**:

| Cột | Quy tắc |
| --- | --- |
| `kind` | `skip` · `override` · **`status`** (chỉ lưu trạng thái xong của 1 lần lặp, không đổi nội dung) |
| `done boolean` | Lần lặp đã xong (null = chưa) |
| `done_subtasks uuid[] not null default '{}'` | Việc phụ đã xong của lần lặp |
| `subtasks jsonb` | Việc phụ riêng của lần lặp khi sửa "Chỉ lần này" (null = dùng của todo) |

- `unique (todo_id, occurrence_date)` · tick 1 lần lặp → upsert kind `status` (đã có `override` → chỉ cập nhật `done`, `done_subtasks`).
- RLS: như `event_exceptions` — `todo_id` phải thuộc cùng user.

## Chu kỳ — `period_days`, cột trong `user_settings`

### `period_days`

| Cột | Kiểu |
| --- | --- |
| `id` | uuid, app sinh |
| `user_id` | uuid, mặc định `auth.uid()` |
| `day` | date · `unique (user_id, day)` |
| `created_at` | timestamptz |

- 1 dòng = 1 ngày có kinh (~5 dòng/tháng). Kỳ kinh = chuỗi ngày liền nhau, app tự gom.
- Lưu màn Kỳ kinh: 1 lệnh — xoá ngày bỏ tick + thêm ngày mới tick (upsert theo `(user_id, day)`).
- Tải: ngày có kinh trong **12 tháng gần nhất** (đủ tính 6 chu kỳ) · index unique `(user_id, day)` dùng luôn.
- RLS `user_id = auth.uid()` + `session_active()` như bảng khác.

### `user_settings` thêm

| Cột | Mặc định | Check |
| --- | --- | --- |
| `cycle_enabled boolean` | `false` | — |
| `cycle_length smallint` | 28 | 21–45 |
| `period_length smallint` | 5 | 2–10 |
| `period_reminder boolean` | `true` | — |
| `period_reminder_days smallint` | 2 | 1–7 |
| `period_reminder_time time` | `09:00` | phút chia hết cho 5 |

## Báo lỗi

### `bug_reports`

| Cột | Quy tắc |
| --- | --- |
| `id` | uuid, app sinh (gửi lại không tạo trùng) |
| `user_id` | mặc định `auth.uid()` |
| `body` | 10–2000 ký tự |
| `images` | `text[]` đường dẫn Storage, ≤ 3 |
| `app_version`, `device`, `os`, `locale` | text ≤ 100 |
| `email_sent_at` | timestamptz, null = chưa gửi |
| `created_at` | timestamptz |

- RLS: user chỉ **insert** báo cáo của mình · không select / update / delete (báo cáo chỉ nhà phát triển xem trên Supabase).
- Giới hạn 5 / ngày: trigger `before insert` đếm báo cáo của user trong 24 giờ qua → ≥ 5 thì báo lỗi `rate_limited` (mã `P0001`) · trigger chạy `security definer` (user không đọc được bảng) + khoá theo user để 2 lần gửi cùng lúc không vượt 5.

### `developer_emails`

| Cột | Quy tắc |
| --- | --- |
| `email` | text, khoá chính |

- RLS bật, **không policy** → app (anon, authenticated) không đọc được; chỉ Edge Function (service role) đọc.
- Migration thêm email đầu tiên (repo private). Thêm/bớt email: migration mới.

### Storage

- Bucket private `bug-reports` · đường dẫn `<user_id>/<report_id>/<1..3>.jpg` · ≤ 2 MB/ảnh, chỉ `image/jpeg`.
- Policy: user chỉ upload vào thư mục `<user_id>/` của mình · không đọc, không xoá · upload không ghi đè (gửi lại cùng ảnh → lỗi trùng, app coi như đã có).
- Ước tính: 3 ảnh × ~300 KB · ít báo cáo → không đáng kể so với 1 GB gói Free.

### Edge Function `send-bug-report`

- Đầu tiên trong dự án (`supabase/functions/send-bug-report/`).
- App gọi sau khi insert báo cáo + upload ảnh xong, gửi `report_id` (kèm token đăng nhập).
- Function (service role): kiểm tra báo cáo thuộc user đang gọi, chưa gửi → đọc `developer_emails` → tải ảnh từ Storage → gửi 1 email tới mọi địa chỉ, ảnh đính kèm → ghi `email_sent_at`.
- Tiêu đề email: `[Daynest] Báo lỗi <app_version> — <email user>` · nội dung: `body` + máy, Android, ngôn ngữ, thời gian, `report_id`.
- Gửi mail: **SMTP Gmail** (`smtp.gmail.com:465`) bằng 1 tài khoản Gmail + **mật khẩu ứng dụng** (bạn tạo trong tài khoản Google, cần bật xác minh 2 bước) · Gmail cho ~500 mail/ngày, thừa với 5 báo cáo/ngày/user. Tài khoản + mật khẩu lưu ở secret của Supabase (`supabase secrets set`) và `supabase/.env`, không nằm trong repo.
- Lỗi gửi → giữ `email_sent_at = null`, trả 200 cho app; báo cáo vẫn xem được trên Supabase.

## Migration + test

- Migration `s5_todo_cycle_bug_report.sql`: mọi bảng / cột / RLS / index / bucket ở trên + email đầu tiên. **Chỉ thêm**, bản cũ vẫn chạy → không tăng `min_version_code`, chạy lên DB thật ngay khi xong bước DB.
- `supabase/tests/rls_s5.sql`: 2 user giả · A không đọc / sửa / xoá `todos`, `todo_exceptions`, `period_days` của B · không gắn ngoại lệ vào todo của B · A không đọc được `bug_reports`, `developer_emails`, ảnh của ai (kể cả của mình) · A không upload vào thư mục của B · báo cáo thứ 6 trong 24 giờ bị chặn · check `subtasks`, độ dài chu kỳ.

## Kiểm tra tải

- Như [S2](../../sprint-2/design/db.md#kiểm-tra-tải), chạy `supabase/db load` trên Supabase local.
- Seed thêm mỗi user giả: 60 todo (10 lặp hằng ngày, mỗi todo 5 việc phụ) + 300 ngoại lệ `status` · 60 ngày có kinh (12 kỳ).
- Vòng lặp user ảo thêm: đọc danh sách todo (37 ngày) → tick 1 todo → đọc `period_days` 12 tháng.
- Đạt: 0 lỗi, p95 < 1 s · `explain analyze` truy vấn danh sách todo dùng `todos_span_idx`.
- Đo dung lượng thêm/user → cập nhật [§3 Mục tiêu tải](../../index.md#mục-tiêu-tải).
