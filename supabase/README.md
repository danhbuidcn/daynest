# Supabase

Mỗi thay đổi DB = 1 file trong `migrations/`. Không sửa DB trên dashboard; migration đã chạy thì không sửa, tạo file mới.

Lần đầu mỗi máy: `cp supabase/.env.example supabase/.env` → điền.

| Biến | Lấy ở đâu |
| --- | --- |
| `SUPABASE_PROJECT_REF` | URL dashboard: `supabase.com/dashboard/project/<ref>` |
| `SUPABASE_ACCESS_TOKEN` | Supabase → avatar góc phải → Account preferences → Access Tokens → Generate new token |
| `SUPABASE_DB_PASSWORD` | Project Settings → Database → Database password (quên thì Reset database password) |
| `GMAIL_USER` | Gmail gửi báo lỗi (`danhbuidcn@gmail.com`) |
| `GMAIL_APP_PASSWORD` | Mật khẩu ứng dụng của Gmail đó: myaccount.google.com/apppasswords (cần bật xác minh 2 bước) |

| Lệnh | Làm gì |
| --- | --- |
| `supabase/db new <ten>` | Tạo file migration mới |
| `supabase/db test` | Chạy lại migration + test RLS trên DB local (cần Docker) |
| `supabase/db status` | So migration trên máy với project thật |
| `supabase/db migrate` | Áp dụng migration lên project thật |
| `supabase/db function <name>` | Deploy 1 Edge Function (không đụng secret), vd. `delete-account` |
| `supabase/db functions` | Đặt secret Gmail + deploy Edge Function `send-bug-report`, `delete-account` lên project thật |
