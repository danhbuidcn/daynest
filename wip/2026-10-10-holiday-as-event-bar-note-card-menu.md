# 2026-10-10 — Ngày lễ hiện như thanh event + thẻ note có ⋯ (xoá, di chuyển) — ✅ xong

## Input

- Bạn: "các sự kiện mặc định như 2/9, valentine, v.v. cũng cần xử lý để hiển thị giống sự kiện custom" · "16. Quản lý — Notes thêm 3 chấm ở cuối, click thì show option xóa, di chuyển đến."
- 3 câu hỏi làm rõ (giới hạn thanh/ô, màu, bấm vào) → bạn chọn "tham khảo app lịch cài sẵn trên máy thật, ghi quyết định vào spec" (không ghi tên app vào docs, theo quy tắc đã chốt trước đó).
- Khảo sát trực tiếp trên máy thật qua USB (app lịch đã cài sẵn, không phải app Daynest): ngày lễ hiện thành 1 thanh đầy màu như event thường, xếp cùng danh sách với event khác trong ô/pop-up ngày (không tách riêng) · bấm vào không mở gì (không tương tác).

## Plan

- [x] 1. [F1-calendar.md](../docs/specs/sprint-2/F1-calendar.md): ô tháng — ngày lễ hiện thành 1 thanh (nền `error`, chữ trắng, không bấm được) xếp đầu danh sách thanh, tính vào giới hạn tối đa 3 thanh + "+N" (không tách riêng). Pop-up ngày: lễ xếp đầu trong danh sách event (chấm `error`, không bấm được), bỏ dòng "tên lễ" riêng.
- [x] 2. [F5-notes.md](../docs/specs/sprint-2/F5-notes.md): thẻ note thêm `⋯` góc thẻ → Xoá (vào thùng rác như cũ) · Di chuyển đến (chọn danh mục) — không cần mở Editor.
- [x] 3. [screens.md](../docs/specs/sprint-2/design/screens.md): cập nhật mô tả màn 1/5 (qua F1) và màn 16.
- [x] 4. [mockups.html](../docs/specs/sprint-2/design/mockups.html): ô tháng + pop-up ngày vẽ lại theo quyết định mới (class `.ev-hol`, bỏ `.hname`) · thẻ note (`ncard`) thêm `⋯` cạnh ngày sửa. Kiểm bằng Chrome headless screenshot — đúng như mô tả.

## Việc còn lại

- Code: ô tháng (bước 6 — thanh event trên lưới tháng) và thẻ note (bước 9 — Notes) làm theo spec mới này khi tới lượt trong lộ trình S2.
