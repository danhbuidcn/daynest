# Dữ liệu (DB)

Thuộc: [Kiến trúc](index.md).

Chi tiết cột: [S1 db.md](../sprint-1/design/db.md) · [S2 db.md](../sprint-2/design/db.md).

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : "trigger tạo"
  AUTH_USERS ||--|| USER_SETTINGS : "trigger tạo"
  AUTH_USERS ||--o{ USER_DEVICES : "tối đa 2"
  AUTH_USERS ||--o| GOOGLE_SYNC_STATE : "khi bật đồng bộ"
  AUTH_USERS ||--o{ EVENTS : ""
  EVENTS ||--o{ EVENT_EXCEPTIONS : "skip / override"
  AUTH_USERS ||--o{ NOTE_CATEGORIES : "≤ 30"
  NOTE_CATEGORIES |o--o{ NOTES : "set null khi xoá"
  AUTH_USERS ||--o{ NOTES : ""

  PROFILES {
    uuid id PK
    text display_name
    text email
    text avatar_url
  }
  USER_SETTINGS {
    uuid user_id PK
    text language
    smallint week_start
    text time_zone
    bool notifications_enabled
  }
  USER_DEVICES {
    uuid user_id PK
    uuid device_id PK
    uuid session_id UK
    timestamptz signed_in_at
    timestamptz last_seen_at
  }
  EVENTS {
    uuid id PK "app tự sinh"
    uuid user_id
    text title
    bool all_day
    timestamptz starts_at
    date start_date
    text repeat "none..lunar_yearly"
    date span_start "lọc khoảng ngày"
    date span_end
    text google_event_id "unique theo user"
    text google_status
    timestamptz updated_at "khoá lạc quan"
  }
  EVENT_EXCEPTIONS {
    uuid id PK
    uuid event_id FK
    date occurrence_date "unique theo event"
    text kind
  }
  GOOGLE_SYNC_STATE {
    uuid user_id PK
    bool enabled
    text sync_token
    smallint synced_year
  }
  NOTE_CATEGORIES {
    uuid id PK
    text name "unique lower theo user"
    text color
  }
  NOTES {
    uuid id PK
    uuid category_id FK
    text title
    jsonb checklist
    text search_text "bỏ dấu"
    bool pinned
    timestamptz deleted_at "thùng rác"
  }
```

Nguyên tắc lưu:

| Nguyên tắc | Lý do |
| --- | --- |
| Mọi bảng có `user_id` + RLS `user_id = auth.uid()` và `session_active()` | Không lộ dữ liệu giữa user; máy bị đăng xuất dừng ngay |
| `id` do app sinh (uuid) | Gửi lại không tạo bản trùng |
| `updated_at` do trigger đặt | Dùng làm phiên bản cho khoá lạc quan |
| Event lặp = 1 dòng quy tắc + ngoại lệ | DB không phình; app tự trải ra các lần |
| `span_start` / `span_end` | Tải đúng event chạm khoảng ngày đang xem, có index |
| Ghi chú xoá mềm (`deleted_at`) | Thùng rác khôi phục được |
| Trên máy chỉ có phiên + cache | Online-only; cache chỉ để xem |


## RLS là gì

**RLS (Row Level Security)** = luật phân quyền **theo từng dòng** của Postgres, gắn vào bảng. Mỗi lệnh `select / insert / update / delete` đều bị Postgres lọc qua luật này, dù gọi từ đâu.

Vì sao cần: app không có server riêng, key Supabase (`anon key`) nằm trong app nên ai cũng lấy được. Bảo mật không dựa vào app mà dựa vào RLS ở DB: có key cũng chỉ chạm được dòng của chính mình.

```mermaid
flowchart LR
  Req["App gửi: select * from events<br/>kèm JWT của user A"] --> PGR["PostgREST"]
  PGR -->|"đặt auth.uid() = A<br/>từ JWT"| Policy{"Luật RLS của bảng events"}
  Policy -->|"user_id = A và<br/>phiên còn hiệu lực"| Keep["Trả về"]
  Policy -->|"dòng của user khác<br/>hoặc máy đã bị đăng xuất"| Drop["Bị loại, như không tồn tại"]
```
