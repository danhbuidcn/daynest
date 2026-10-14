# Báo lỗi

Thuộc: [Kiến trúc](index.md).

Spec: [S5](../sprint-5/index.md) · chi tiết bảng, Storage, Edge Function: [S5 db.md § Báo lỗi](../sprint-5/design/db.md#báo-lỗi). Code: `features/bugReport/api.ts`, `supabase/functions/send-bug-report/`.

Cài đặt → Báo lỗi: user viết nội dung + ≤ 3 ảnh → nhà phát triển nhận email kèm ảnh.

```mermaid
sequenceDiagram
  autonumber
  participant A as App
  participant DB as Postgres
  participant S as Storage (bucket bug-reports)
  participant F as Edge Function send-bug-report
  participant M as Gmail SMTP

  A->>A: Chọn ảnh → thu nhỏ (cạnh dài ≤ 1600 px, JPEG)
  A->>A: Có mạng? id = uuid (sinh 1 lần)
  A->>DB: insert bug_reports (id, body, images, máy, version)
  alt Đã ≥ 5 báo cáo trong 24 giờ
    DB-->>A: rate_limited → báo user
  else Trùng id (gửi lại)
    DB-->>A: 23505 → coi như đã có, đi tiếp
  end
  loop Mỗi ảnh
    A->>S: upload <user_id>/<report_id>/<n>.jpg (không ghi đè)
    S-->>A: OK / đã có → đi tiếp
  end
  A->>F: functions.invoke(report_id) + token đăng nhập
  F->>F: Kiểm tra token → user, báo cáo thuộc user, chưa gửi
  F->>DB: Đọc developer_emails (service role)
  F->>S: Tải ảnh
  F->>M: 1 email tới mọi địa chỉ, ảnh đính kèm
  F->>DB: email_sent_at = now()
  F-->>A: 200 (gửi mail lỗi vẫn 200)
```

| Quy tắc | Lý do |
| --- | --- |
| Thứ tự: báo cáo → ảnh → email; `id` app sinh | Gửi lại sau lần gửi dở chỉ làm phần còn thiếu, không tạo báo cáo thứ 2 |
| User chỉ insert, không đọc lại; ảnh không đọc, không xoá | Báo cáo chỉ nhà phát triển xem trên Supabase |
| ≤ 5 / 24 giờ: trigger `check_bug_report_limit`, khoá theo user | 2 lần gửi cùng lúc không vượt 5; chặn spam email |
| Email do Edge Function gửi | Cần service role (đọc `developer_emails`, tải ảnh) và mật khẩu Gmail — không được nằm trong app |
| Gửi mail lỗi → `email_sent_at` để null, vẫn trả 200 | Báo cáo đã lưu; user không phải gửi lại |

- Deploy function + đặt secret Gmail: `supabase/db functions` ([supabase/README.md](../../../supabase/README.md)).
