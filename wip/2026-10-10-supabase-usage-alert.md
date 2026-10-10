# 2026-10-10 — Cảnh báo email khi Supabase dùng ≥ 80% gói — ❌ huỷ

## Input

- Chạy 0h mỗi ngày (giờ VN). Chỉ số nào ≥ 80% giới hạn gói Free → gửi email cho danhbuidcn@gmail.com.
- Chỉ số trên dashboard: Egress 5 GB · Database 500 MB · MAU 50.000 · File storage 1 GB · Log Ingestion 1 GB · Log Query 100 GB.

## Plan

- [ ] `.github/workflows/supabase-usage.yml`: `cron: '0 17 * * *'` (0h +7) + chạy tay (`workflow_dispatch`).
- [ ] Đo bằng SQL qua `psql "$SUPABASE_DB_URL"` (secret GitHub, Session pooler):
  - Database size ≥ 400 MB.
  - MAU (gần đúng: user đăng nhập / làm mới phiên trong 30 ngày) ≥ 40.000.
  - File storage (`storage.objects`) ≥ 800 MB.
- [ ] Vượt ngưỡng → job fail, in bảng số liệu vào Job summary → GitHub gửi email báo lỗi.
- [ ] Egress, Log Ingestion, Log Query: không có API công khai → không đo; dựa vào email vượt quota của Supabase.
- [ ] Ghi cách cài (secret, bật thông báo GitHub) vào `supabase/README.md`.
- [ ] Thử: chạy tay với ngưỡng thấp → nhận email; trả ngưỡng về 80%.

## Kết quả

- Huỷ: API công khai của Supabase không trả Egress, Log Ingestion, Log Query → không theo dõi đủ 6 chỉ số. Dùng email vượt quota có sẵn của Supabase (billing email) + xem trang Usage thủ công.
