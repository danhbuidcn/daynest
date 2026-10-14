# Đọc lịch: event lặp

Thuộc: [Kiến trúc](index.md).

Spec: [S2 F1](../sprint-2/F1-calendar.md) · [S2 F2](../sprint-2/F2-event.md) · [S5](../sprint-5/index.md) (todo, chu kỳ).

Tab Lịch đọc 3 nguồn: event, todo, ngày có kinh. Event và todo cùng 1 cách (dưới đây); kỳ kinh tải riêng.

```mermaid
sequenceDiagram
  autonumber
  participant UI as MonthView
  participant Q as TanStack Query
  participant API as events/api.ts
  participant DB as Postgres
  participant L as lib/recurrence + lunar

  UI->>Q: useEventsInRange(from, to)
  alt Có trong cache, chưa quá 2 phút
    Q-->>UI: Dữ liệu cache, không gọi mạng
  else Chưa có / cũ
    Q-->>UI: Tạm hiện khoảng rộng hơn đã tải hoặc dữ liệu cũ (lưới không nháy rỗng)
    Q->>API: fetchEvents(from, to)
    API->>DB: events where span_start ≤ to + 1 and span_end ≥ from − 1<br/>and deleted_at is null (±1 ngày vì span lưu ngày UTC)
    DB-->>API: Các dòng quy tắc (dùng index user_id, span_start)
    Q->>API: fetchExceptions(ids)
    API->>DB: event_exceptions where event_id in ids
    DB-->>API: skip / override
    API-->>Q: events + exceptions
  end
  Q->>L: occurrencesForEvents(events, exceptions, range, timeZone)
  L-->>UI: Danh sách lần diễn ra (bỏ skip, áp override)
  UI->>UI: Gộp event + todo, xếp thanh (lib/calendar/eventBars)
  UI->>Q: usePrefetchEvents / usePrefetchTodos(khoảng trước, sau)
```

- DB chỉ lưu quy tắc; lặp dương (ngày/tuần/tháng/năm) và lặp năm âm lịch được trải ra **trên máy**, trong khoảng ngày đang xem.
- Lịch âm + ngày lễ tính hoàn toàn trên máy (`lib/lunar`, `lib/holidays`), không gọi mạng.
- **Todo** (`features/todos/useTodos.ts`): giống event — `todos` + `todo_exceptions`, trải bằng cùng `lib/recurrence`; ngoại lệ `status` giữ trạng thái xong của từng lần lặp. Tick trên lịch → `useSetTodoStatus`.
- **Kỳ kinh** (`features/cycle/`): chỉ khi bật trong Cài đặt. Tải `period_days` 12 tháng gần nhất (1 query, không theo khoảng đang xem) → `lib/cycle` nhóm thành kỳ, dự đoán kỳ sau theo độ dài chu kỳ → đánh dấu ô ngày.
- Cache: TanStack Query 2 phút trong RAM, lưu AsyncStorage 7 ngày ([queryClient.ts](../../../app/src/features/cache/queryClient.ts)).
