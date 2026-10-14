# Nhắc nhở

Thuộc: [Kiến trúc](index.md).

Spec: [S2 F3](../sprint-2/F3-reminders.md) · [S5](../sprint-5/index.md) (todo, nhắc kỳ kinh). Code: `features/reminders/reminderSync.ts`, `lib/notifications/`.

Thông báo đặt sẵn trên từng máy từ dữ liệu DB; không push từ server.

```mermaid
flowchart LR
  Trigger["Mở app / foreground<br/>lưu-xoá event, todo, tick todo<br/>ghi ngày có kinh · đồng bộ Google xong<br/>đổi cài đặt · đăng nhập / đăng xuất"] --> Queue["resyncReminders()<br/>xếp hàng, chạy lần lượt"]
  Queue --> Enabled{"Đã đăng nhập<br/>+ notifications_enabled<br/>+ có quyền?"}
  Enabled -->|Không| Cancel["Huỷ hết thông báo"]
  Enabled -->|Có| Load["Tải event + todo<br/>hôm qua → 30 + 7 ngày tới"]
  Load -->|"lỗi mạng"| Keep["Giữ nguyên nhắc đã đặt"]
  Load --> Pick["pickReminders: trải lặp, áp ngoại lệ<br/>bỏ todo đã xong, bỏ mốc đã qua<br/>≤ 60 mốc gần nhất trong 30 ngày"]
  Load --> Cycle["Chu kỳ bật + nhắc bật:<br/>dự đoán kỳ sau → nhắc trước N ngày, giờ đã chọn"]
  Pick & Cycle --> Reset["Huỷ hết → đặt lại<br/>expo-notifications"]
  Reset --> Fire(["Đến giờ: thông báo<br/>bấm → chi tiết đúng lần lặp<br/>(kỳ kinh → ngày đó trên Lịch)"])
```

- Tải dữ liệu **trước** khi huỷ: mất mạng thì nhắc cũ vẫn còn.
- Event cả ngày nhắc theo 9:00 ngày bắt đầu.
- Giới hạn 60 vì hệ điều hành giữ số thông báo chờ có hạn (iOS ≤ 64). Mốc nhắc xa nhất là "trước 1 tuần", nên tải thêm 7 ngày sau mốc 30 ngày.
- Từ chối quyền thông báo → vẫn lưu mốc nhắc trong DB, gợi ý bật quyền ([errors.md](errors.md)).
