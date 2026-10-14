# Đồng bộ Google Calendar

Thuộc: [Kiến trúc](index.md).

Spec: [S2 F4](../sprint-2/F4-google-calendar.md). Code: `features/google/` (`sync.ts` điều phối, `push.ts`, `pull.ts`, `client.ts`), `lib/google/` (đổi định dạng, phạm vi). Chỉ khi bật trong Cài đặt; phạm vi = event năm hiện tại + event lặp còn diễn ra trong năm (không đẩy lặp âm).

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
  A->>G: Đẩy event Daynest chưa liên kết trong phạm vi (có thanh tiến độ)<br/>id Google = id Daynest bỏ dấu -
  G-->>A: 200 hoặc 409 (đã có = coi như xong)
  A->>DB: Lưu sync_token, synced_year
  end

  rect rgba(120,220,160,0.12)
  Note over A,G: Đang bật — Daynest → Google (xếp hàng, không chồng nhau)
  A->>DB: Lưu event / ngoại lệ "chỉ lần này"
  A->>G: insert / patch (If-Match etag) / delete<br/>ngoại lệ: skip → xoá lần đó, override → patch lần đó
  alt Lỗi mạng / lỗi khác
    A->>DB: google_status = pending (pushPending ở lần đồng bộ sau)
  else 429 / rateLimitExceeded
    A->>G: Chờ 1 s, 2 s, 4 s, 8 s rồi thử lại (tối đa 4 lần)
  else 412 etag cũ
    A->>G: Kéo bản mới → bản sửa sau cùng thắng
  else 404 / 410 (đã xoá trên Google)
    A->>G: insert lại
  else 403 (event không phải của user)
    A->>DB: Giữ bản của Google
  end
  end

  rect rgba(255,200,120,0.12)
  Note over A,G: Đang bật — Google → Daynest (mở app nếu > 5 phút, kéo xuống ở Lịch, nút Đồng bộ ngay)
  A->>G: events.list(syncToken)
  alt 410 Gone
    A->>G: Kéo lại cả năm, ghép theo google_event_id
  else Có thay đổi
    G-->>A: Event đổi / cancelled
    A->>DB: Upsert / xoá
  end
  A->>G: pushPending: đẩy lại event / ngoại lệ còn pending
  A->>DB: Lưu sync_token, synced_year, last_synced_at
  A->>A: Đặt lại thông báo, làm mới lịch
  end
```

- Token Google chỉ ở trên máy (SDK tự làm mới), không lưu DB. `401` → thử lại 1 lần với token mới → vẫn lỗi: "Cần kết nối lại Google".
- Không gọi riêng `session_active()`: máy đã bị đá ra thì RLS từ chối mọi lệnh ghi DB.
- Không đẩy lên Google: event lặp âm lịch, event chỉ xem (`google_readonly` — kiểu lặp của Google mà Daynest không biểu diễn được, lưu từng lần trong năm).
- Xoá event đã liên kết: ẩn trước (`deleted_at`), xoá hẳn khi Google xác nhận.
- Năm mới (`synced_year` khác năm nay) → kéo lại cả năm.
- Tắt đồng bộ → giữ nguyên dữ liệu 2 bên, giữ `google_event_id` để bật lại ghép đúng, không trùng.
