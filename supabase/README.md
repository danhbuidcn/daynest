# Supabase

Mỗi thay đổi DB = 1 file trong `migrations/`. Không sửa DB trên dashboard; migration đã chạy thì không sửa, tạo file mới.

Lần đầu mỗi máy: `cp supabase/.env.example supabase/.env` → điền.

| Lệnh | Làm gì |
| --- | --- |
| `supabase/db new <ten>` | Tạo file migration mới |
| `supabase/db test` | Chạy lại migration + test RLS trên DB local (cần Docker) |
| `supabase/db status` | So migration trên máy với project thật |
| `supabase/db migrate` | Áp dụng migration lên project thật |
