# DB — Sprint 2

Thuộc: [Sprint 2](../index.md). Nền S1: [sprint-1/design/db.md](../../sprint-1/design/db.md).

Quy tắc chung mọi bảng mới:

- `id uuid` PK, **app tự sinh** (DB vẫn có `default gen_random_uuid()`) → gửi lại không tạo trùng.
- `user_id uuid not null default auth.uid()` → `auth.users` `on delete cascade`.
- `created_at`, `updated_at timestamptz`; trigger `set_updated_at` (có từ S1).
- RLS bật; select/insert/update/delete chỉ khi `user_id = (select auth.uid())`; insert/update có `with check` cùng điều kiện.
- Sửa dùng **khoá lạc quan**: `update … where id = :id and updated_at = :read_updated_at returning *` → 0 dòng = đã đổi ở máy khác. App giữ nguyên chuỗi `updated_at` API trả về (không đổi qua `Date` — mất micro giây).

## `user_settings` — thêm cột

| Cột | Kiểu | Mặc định |
| --- | --- | --- |
| `notifications_enabled` | `boolean` | `true` |
| `show_lunar` | `boolean` | `true` |
| `show_holidays` | `boolean` | `true` |

## `events`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id`, `user_id` | `uuid` | Như trên |
| `title` | `text` | 1–100 ký tự |
| `note` | `text null` | ≤ 2000 |
| `color` | `text` | check in (`mint`,`sky`,`lavender`,`pink`,`peach`,`lemon`) |
| `all_day` | `boolean` | |
| `starts_at`, `ends_at` | `timestamptz null` | Event có giờ · `ends_at ≥ starts_at` |
| `start_date`, `end_date` | `date null` | Event cả ngày · tính cả ngày cuối · `end_date ≥ start_date` |
| `repeat` | `text` | `none` · `daily` · `weekly` · `monthly` · `yearly` · `lunar_yearly` |
| `repeat_interval` | `smallint` | 1–99, mặc định 1 |
| `repeat_until` | `date null` | null = không bao giờ hết |
| `lunar_month`, `lunar_day` | `smallint null` | Bắt buộc khi `lunar_yearly` · 1–12, 1–30 |
| `reminder_minutes` | `int[]` | Mặc định `{}` · ≤ 5 phần tử · phút trước giờ bắt đầu (cả ngày: trước 9:00) |
| `span_start`, `span_end` | `date` | App tính: ngày đầu của lần đầu, ngày cuối của lần cuối (`infinity` nếu lặp không hết) — chỉ để lọc theo khoảng ngày |
| `google_event_id` | `text null` | Id event trên Google (đẩy lên = `id` bỏ `-`) |
| `google_etag` | `text null` | Cho `If-Match` |
| `google_updated_at` | `timestamptz null` | `updated` của Google — luật "sửa sau cùng thắng" |
| `google_status` | `text` | `none` · `synced` · `pending` · mặc định `none` |
| `google_readonly` | `boolean` | Mặc định `false` · `RRULE` phức tạp → chỉ xem |
| `deleted_at` | `timestamptz null` | Chỉ dùng khi đã xoá ở app nhưng chưa xoá được trên Google (chờ đẩy) · app ẩn dòng này |
| `created_at`, `updated_at` | `timestamptz` | |

- Check: cả ngày ↔ có `start_date`/`end_date`, không có `starts_at`/`ends_at`; ngược lại với event có giờ.
- Unique `(user_id, google_event_id)` where `google_event_id is not null`.
- Index:
  - `(user_id, span_start)` — tải theo khoảng ngày.
  - `(user_id) where google_status = 'pending'` — tìm việc chờ đẩy.

Truy vấn lịch (khoảng ngày đang xem):

```sql
select * from events
where user_id = auth.uid() and deleted_at is null
  and span_start <= :to and span_end >= :from;
```

## `event_exceptions`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id`, `user_id` | `uuid` | Như trên |
| `event_id` | `uuid` | → `events` `on delete cascade` |
| `occurrence_date` | `date` | Ngày gốc của lần lặp |
| `kind` | `text` | `skip` · `override` |
| `title`, `note`, `color`, `all_day`, `starts_at`, `ends_at`, `start_date`, `end_date`, `reminder_minutes` | như `events`, `null` | Chỉ cho `override`; `null` = giữ theo event gốc |
| `google_status` | `text` | `none` · `synced` · `pending` |
| `created_at`, `updated_at` | `timestamptz` | |

- Unique `(event_id, occurrence_date)`. Index `(event_id)`.
- Tải kèm event: `select * from event_exceptions where event_id = any(:ids)`.

## `google_sync_state`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `user_id` | `uuid` PK | |
| `enabled` | `boolean` | Mặc định `false` |
| `sync_token` | `text null` | Tắt đồng bộ / `410` → `null` |
| `synced_year` | `smallint null` | Năm đã kéo · khác năm hiện tại → kéo lại |
| `last_synced_at` | `timestamptz null` | |
| `created_at`, `updated_at` | `timestamptz` | |

- App upsert dòng của mình lúc bật lần đầu (không cần trigger). Không lưu token Google.

## `note_categories`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id`, `user_id` | `uuid` | |
| `name` | `text` | 1–30 ký tự |
| `color` | `text` | 6 màu event |
| `created_at`, `updated_at` | `timestamptz` | |

- Unique `(user_id, lower(name))`. Giới hạn 30 danh mục: app kiểm tra.

## `notes`

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| `id`, `user_id` | `uuid` | |
| `category_id` | `uuid null` | → `note_categories` `on delete set null` |
| `title` | `text` | Mặc định `''`, ≤ 200 |
| `body` | `text` | Mặc định `''`, ≤ 20.000 |
| `checklist` | `jsonb` | Mặc định `[]` · mảng `{ id, text, done }` · ≤ 100 mục |
| `search_text` | `text` | App tính: tiêu đề + nội dung + checklist, chữ thường, bỏ dấu (`đ` → `d`) |
| `pinned` | `boolean` | Mặc định `false` |
| `deleted_at` | `timestamptz null` | Khác null = trong thùng rác |
| `created_at`, `updated_at` | `timestamptz` | |

- Index `(user_id, pinned desc, updated_at desc, id) where deleted_at is null` — danh sách.
- Index `(user_id, deleted_at) where deleted_at is not null` — thùng rác.
- Phân trang **keyset** theo `(pinned, updated_at, id)` (không dùng `offset`) → không lặp/sót khi note đổi lúc đang cuộn.
- Tìm kiếm: `search_text ilike '%' || :q || '%'` (`:q` bỏ dấu cùng cách) trong note của user — số note mỗi user nhỏ nên quét theo index `user_id` đủ nhanh, không cần `pg_trgm`.

## Migration + test

- `supabase/migrations/<timestamp>_s2_calendar_notes.sql`: cột mới `user_settings` + 5 bảng + RLS + index + trigger `updated_at`.
- `supabase/tests/rls_s2.sql`: 2 user giả; A không đọc/sửa/xoá được `events`, `event_exceptions`, `google_sync_state`, `note_categories`, `notes` của B; A không gắn được note vào danh mục của B, không gắn ngoại lệ vào event của B.

## Kiểm tra tải

- Chỉ chạy trên Supabase **local** (`supabase start`), không chạy trên DB thật.
- Seed: 10.000 user giả, mỗi user ~50 event (1/5 lặp) + 20 note.
- Script 100 user ảo chạy đồng thời 5 phút, mỗi user lặp lại: đọc lịch tháng (events + exceptions) → tạo/sửa 1 event → đọc trang notes đầu → tìm kiếm note.
- Đạt: 0 lỗi, p95 < 1 s. Kèm `explain analyze` 4 truy vấn chính (lịch tháng, ngoại lệ, danh sách note, tìm note) dùng đúng index.
- Công cụ + script chốt ở bước code (ghi vào todo bước đó).
