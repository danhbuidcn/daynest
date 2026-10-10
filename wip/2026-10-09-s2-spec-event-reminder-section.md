# 2026-10-09 — S2 spec: mục Nhắc nhở trong form event giống app tham khảo — ✅ xong

~~Thêm cài đặt "Nhắc mặc định" 5/10/15 phút~~ — đã bỏ (hiểu sai: bạn muốn chọn mốc nhắc ngay trong event).

Spec hiện có: chọn mốc trong form (Đúng giờ · 5 · 10 · 15 · 30 phút · 1 giờ · 1 ngày trước), mặc định 15 phút. Còn thiếu:

- [x] `F3-reminders.md` + `F2-event.md`: thêm công tắc **"Cài đặt nhắc nhở"** đầu mục (bật = có nhắc, hiện danh sách mốc; tắt = không nhắc, ẩn danh sách) · mỗi mốc 1 dòng icon đồng hồ + "15 phút trước" + ✕ · "+ Thêm nhắc nhở" mở sheet từ đáy: Huỷ bỏ · "Chọn nhắc nhở lúc" · Hoàn tất, danh sách mốc có ✓.
- [x] `design/screens.md` màn 11: đổi "Hộp chọn" → sheet từ đáy như trên.
- [x] Khảo sát app tham khảo trên máy thật (bạn cho phép, không lưu gì): danh sách mốc = Đúng giờ · 5 · 10 · 30 phút · 1 · 2 giờ · 1 · 2 ngày · 1 tuần trước (cả ngày dùng chung); mặc định 15 phút (không có trong danh sách); icon `!` = mẹo tắt tối ưu pin + nút Loại trừ → đã cập nhật F3 + thêm màn 11b.
