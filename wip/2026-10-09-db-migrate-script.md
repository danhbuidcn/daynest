# 2026-10-09 — DB migrate kiểu Rails, Claude CLI tự chạy được — ✅ xong

(Thay 2 todo "Rút gọn README" và "Quản lý Supabase bằng CLI" — gộp, đã bỏ.)

**Mục tiêu:** mỗi thay đổi DB = 1 file migration có timestamp (giống Rails). 1 lệnh chạy được mà không phải gõ tay mật khẩu hay mở trình duyệt, nên Claude CLI tự chạy.

**Cách chạy (script `supabase/db`, tự đọc `supabase/.env`):**

| Lệnh | Giống Rails | Làm gì |
| --- | --- | --- |
| `supabase/db new <ten>` | `rails g migration` | Tạo `migrations/<timestamp>_<ten>.sql` |
| `supabase/db test` | `rails test` | Chạy Supabase local (Docker), chạy lại mọi migration, chạy `tests/*.sql` |
| `supabase/db status` | `db:migrate:status` | So migration local và project thật |
| `supabase/db migrate` | `db:migrate` | Đẩy migration mới lên project thật |

- [x] 1. `supabase/.env.example`, có comment ghi lấy giá trị ở đâu:
  - `SUPABASE_PROJECT_REF=xxfsqxuymswnbomxbpfs`;
  - `SUPABASE_ACCESS_TOKEN=` (Supabase → Account → Access Tokens → Generate) → thay cho `supabase login`, không cần mở trình duyệt;
  - `SUPABASE_DB_PASSWORD=` (Project Settings → Database) → thay cho việc gõ mật khẩu.
- [x] 2. Script `supabase/db` (bash, ~30 dòng):
  - đọc `.env`;
  - tự `link` nếu chưa link;
  - 4 lệnh trên;
  - `migrate` chạy `--dry-run` in danh sách trước, rồi mới push.
- [x] 3. **Bạn** (1 lần/máy): `cp supabase/.env.example supabase/.env` → điền access token + mật khẩu DB.
- [x] 4. Tôi đồng bộ lịch sử: migration `init` đã chạy tay qua SQL Editor → `migration repair --status applied 20261009000000`. Sau đó `supabase/db status` phải khớp.
- [x] 5. README rút gọn (~10 dòng mỗi file):
  - `supabase/README.md`: copy `.env` → điền; bảng 4 lệnh; quy tắc: không sửa DB trên dashboard, migration đã chạy thì không sửa, tạo file mới.
  - `app/README.md`: copy `.env` → điền; `npm install && npm run android`; lệnh kiểm tra. Chú thích "lấy ở đâu" chuyển vào comment trong `app/.env.example`.
- [x] 6. Kiểm tra: `test` 14/14, `new` OK, `status` khớp, `migrate` up to date. Token cần full access (scoped token thiếu `project_admin_read`, `api_gateway_keys_read`…). Đổi tên `init` → `20261009000000_init.sql` để migration tạo trong ngày (giờ UTC) không xếp trước init:
  - `supabase/db test` → 14/14;
  - `supabase/db new thu` → tạo đúng file rồi xoá;
  - `supabase/db status` khớp;
  - `supabase/db migrate` → "up to date".
- [x] 7. Commit `chore(supabase): rails-like migrate script, short readmes` rồi push.
