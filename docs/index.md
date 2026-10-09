# Tài liệu Daynest

Đọc từ trên xuống: tổng → sprint → chức năng → thiết kế.

```text
docs/
  index.md                  # file này
  specs/
    index.md                # spec tổng: sản phẩm, quyết định, kiến trúc, danh sách sprint
    design-system.md        # màu, chữ, khoảng cách, icon, thành phần dùng chung
    sprint-N/
      index.md              # mục tiêu, phạm vi, luồng tổng, DoD của sprint
      F<n>-<tên>.md         # từng chức năng: mục tiêu, logic, luồng, mô tả
      design/               # thiết kế chi tiết: màn hình, mockup, DB, build…
  research/
    cute-calendar/          # khảo sát Cute Calendar: features.md + screenshots/
    memrise/                # khảo sát Memrise: screenshots/
```

| Đường dẫn | Nội dung |
| --- | --- |
| [specs/index.md](specs/index.md) | Spec tổng — đọc đầu tiên |
| [specs/design-system.md](specs/design-system.md) | Design system dùng chung mọi sprint |
| [specs/sprint-1/](specs/sprint-1/index.md) | Sprint 1: nền móng (khung app, đăng nhập Google, DB, ký app) |
| [research/cute-calendar/](research/cute-calendar/features.md) | Tham khảo tính năng + UI app lịch |
| `research/memrise/` | Tham khảo UI (ảnh chụp màn hình) |

Quy tắc:

- Folder `sprint-N/` chỉ tạo khi bắt đầu sprint đó.
- Mỗi file ghi "Thuộc: …" trỏ lên file cha để truy ngược.
- Gạch đầu dòng ngắn, bám mục tiêu; không lặp nội dung giữa các file.
