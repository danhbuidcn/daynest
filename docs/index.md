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
      F<n>-<english-name>.md # từng chức năng (tên file tiếng Anh): mục tiêu, logic, luồng, mô tả
      design/               # thiết kế chi tiết: màn hình, mockup, DB, build…
```

| Đường dẫn | Nội dung |
| --- | --- |
| [specs/index.md](specs/index.md) | Spec tổng — đọc đầu tiên |
| [specs/design-system.md](specs/design-system.md) | Design system dùng chung mọi sprint |
| [specs/sprint-1/](specs/sprint-1/index.md) | Sprint 1: nền móng (khung app, đăng nhập Google, DB, ký app) |
| [specs/sprint-2/](specs/sprint-2/index.md) | Sprint 2: lịch, event, nhắc, đồng bộ Google, notes |
| [specs/sprint-3/](specs/sprint-3/index.md) | Sprint 3: hoàn thiện lịch + ghi chú |
| [specs/sprint-4/](specs/sprint-4/index.md) | Sprint 4: chi tiêu |
| [specs/sprint-5/](specs/sprint-5/index.md) | Sprint 5: todo trên lịch, chu kỳ kinh nguyệt, báo lỗi |
| [specs/sprint-6/](specs/sprint-6/index.md) | Sprint 6: quảng cáo + Pro + lên Google Play |

Quy tắc:

- Tên file, tên thư mục: tiếng Anh, kebab-case (nội dung trong `docs/` vẫn tiếng Việt).
- Folder `sprint-N/` chỉ tạo khi bắt đầu sprint đó.
- Mỗi file ghi "Thuộc: …" trỏ lên file cha để truy ngược.
- Gạch đầu dòng ngắn, bám mục tiêu; không lặp nội dung giữa các file.
