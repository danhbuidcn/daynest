# Supabase

Mỗi thay đổi DB = 1 file trong `migrations/` (giống Rails). Không sửa DB trên dashboard; migration đã chạy thì không sửa, tạo file mới.

Lần đầu mỗi máy: `cp supabase/.env.example supabase/.env` → điền.

| Lệnh | Giống Rails |
| --- | --- |
| `supabase/db new <ten>` | `rails g migration` |
| `supabase/db test` | `rails test` (cần Docker) |
| `supabase/db status` | `rails db:migrate:status` |
| `supabase/db migrate` | `rails db:migrate` |
