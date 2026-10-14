# Xung đột dữ liệu

Thuộc: [Kiến trúc](index.md).

## Hai tài khoản khác nhau

Không bao giờ thấy hay sửa được dữ liệu của nhau — RLS chặn ở DB, không phụ thuộc app ([RLS là gì](database.md#rls-là-gì)).

```mermaid
flowchart LR
  UA["User A<br/>JWT: sub = A"] -->|"select / update events"| RLS{"RLS<br/>user_id = auth.uid()<br/>and session_active()"}
  UB["User B<br/>JWT: sub = B"] -->|"select / update events"| RLS
  RLS -->|"chỉ dòng user_id = A"| RA[("Dòng của A")]
  RLS -->|"chỉ dòng user_id = B"| RB[("Dòng của B")]
  UA -. "sửa id của B" .-x RB
```

- A sửa/xoá dòng của B → 0 dòng bị ảnh hưởng (như không tồn tại).
- A không gắn được note vào danh mục của B, không gắn ngoại lệ vào event của B (`with check`).
- Test: `supabase/tests/rls_s1.sql`, `rls_s2.sql`, `rls_s4.sql`, `rls_s4_colour.sql`, `rls_s5.sql` (chạy `supabase/db test`).

## Cùng tài khoản, 2 máy sửa cùng 1 event / note

Khoá lạc quan theo `updated_at`.

```mermaid
sequenceDiagram
  autonumber
  participant M1 as Máy 1
  participant M2 as Máy 2
  participant DB as Postgres

  M1->>DB: Đọc event X
  DB-->>M1: X (updated_at = t1)
  M2->>DB: Đọc event X
  DB-->>M2: X (updated_at = t1)

  M2->>DB: update X where updated_at = t1
  DB-->>M2: 1 dòng, updated_at = t2
  Note over DB: Trigger set_updated_at → t2

  M1->>DB: update X where updated_at = t1
  DB-->>M1: 0 dòng (đã là t2)
  M1->>M1: Hộp Đã thay đổi ở thiết bị khác

  alt Tải bản mới
    M1->>DB: Đọc lại X
    DB-->>M1: Bản của Máy 2 (bỏ thay đổi của Máy 1)
  else Ghi đè
    M1->>DB: Đọc updated_at mới (t2) rồi update where updated_at = t2
    DB-->>M1: 1 dòng, updated_at = t3 (bản của Máy 1 thắng)
  end
```

## Các trường hợp xung đột khác

| Trường hợp | Cách xử lý |
| --- | --- |
| 1 máy xoá, máy kia đang sửa | Sửa → 0 dòng → hộp xung đột; Tải bản mới → không còn event, đóng form |
| 2 máy cùng sửa "chỉ lần này" 1 lần lặp | Upsert theo `(event_id, occurrence_date)` → 1 ngoại lệ, bản ghi sau cùng thắng |
| 2 máy cùng đăng nhập lúc 2 máy khác đang dùng | `register_device` khoá theo user → xếp hàng, luôn ≤ 2 máy |
| 2 máy cùng bật đồng bộ Google | Xem [Đồng bộ Google](google-sync.md): id cố định + upsert theo `google_event_id` |
| Sửa ở Daynest và trên Google giữa 2 lần đồng bộ | Bản sửa sau cùng thắng (so `updated` Google với `updated_at`) |
| Bấm Lưu 2 lần / mạng chập chờn | `id` app sinh → không tạo trùng |
