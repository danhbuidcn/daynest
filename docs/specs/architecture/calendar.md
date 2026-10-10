# Đọc lịch: event lặp

Thuộc: [Kiến trúc](index.md).

Spec: [S2 F1](../sprint-2/F1-calendar.md) · [S2 F2](../sprint-2/F2-event.md).

```mermaid
sequenceDiagram
  autonumber
  participant UI as MonthView
  participant Q as TanStack Query
  participant API as events/api.ts
  participant DB as Postgres
  participant L as lib/recurrence + lunar

  UI->>Q: useEventsInRange(from, to)
  alt Có trong cache
    Q-->>UI: Dữ liệu cache (vẫn làm mới nền)
  else Chưa có
    Q->>API: fetchEvents(from, to)
    API->>DB: events where span_start ≤ to and span_end ≥ from<br/>and deleted_at is null
    DB-->>API: Các dòng quy tắc (dùng index user_id, span_start)
    Q->>API: fetchExceptions(ids)
    API->>DB: event_exceptions where event_id in ids
    DB-->>API: skip / override
    API-->>Q: events + exceptions
  end
  Q->>L: occurrencesForEvents(events, exceptions, range, timeZone)
  L-->>UI: Danh sách lần diễn ra (bỏ skip, áp override)
  UI->>UI: Xếp thanh event (lib/calendar/eventBars)
```

- DB chỉ lưu quy tắc; lặp dương (ngày/tuần/tháng/năm) và lặp năm âm lịch được trải ra **trên máy**, trong khoảng ngày đang xem.
- Lịch âm + ngày lễ tính hoàn toàn trên máy (`lib/lunar`, `lib/holidays`), không gọi mạng.
