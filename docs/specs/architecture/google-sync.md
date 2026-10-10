# Đồng bộ Google Calendar

Thuộc: [Kiến trúc](index.md).

**(chưa code)** — spec: [S2 F4](../sprint-2/F4-google-calendar.md). Chỉ khi bật trong Cài đặt; phạm vi = event năm hiện tại + event lặp còn diễn ra trong năm (không đẩy lặp âm).

```mermaid
sequenceDiagram
  autonumber
  participant A as App
  participant DB as Postgres
  participant G as Google Calendar

  rect rgba(120,180,255,0.12)
  Note over A,G: Bật đồng bộ lần đầu
  A->>A: Xin scope calendar.events
  A->>G: events.list (năm nay, singleEvents=false)
  G-->>A: Event + nextSyncToken
  A->>DB: Upsert theo (user_id, google_event_id)
  A->>G: Đẩy event Daynest trong phạm vi<br/>id Google = id Daynest bỏ dấu -
  G-->>A: 200 hoặc 409 (đã có = coi như xong)
  A->>DB: Lưu sync_token, synced_year
  end

  rect rgba(120,220,160,0.12)
  Note over A,G: Đang bật — Daynest → Google
  A->>DB: Lưu event
  A->>G: insert / patch (If-Match etag) / delete
  alt Lỗi mạng / 429
    A->>DB: google_status = pending (đẩy lại lần sau)
  else 412 etag cũ
    A->>G: Kéo bản mới → bản sửa sau cùng thắng
  end
  end

  rect rgba(255,200,120,0.12)
  Note over A,G: Đang bật — Google → Daynest (mở app nếu > 5 phút, kéo xuống, Đồng bộ ngay)
  A->>DB: session_active() trước khi đồng bộ
  A->>G: events.list(syncToken)
  alt 410 Gone
    A->>G: Kéo lại cả năm, ghép theo google_event_id
  else Có thay đổi
    G-->>A: Event đổi / cancelled
    A->>DB: Upsert / xoá
  end
  A->>A: Đặt lại thông báo, làm mới lịch
  end
```

- Token Google chỉ ở trên máy (SDK tự làm mới), không lưu DB.
- Tắt đồng bộ → giữ nguyên dữ liệu 2 bên, giữ `google_event_id` để bật lại ghép đúng, không trùng.
