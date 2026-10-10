# 2026-10-10 — Google: chỉ đồng bộ năm hiện tại + event lặp — ✅ xong

**Bạn chốt:** chỉ đồng bộ dữ liệu năm hiện tại và các sự kiện lặp lại qua các năm. Chữ hộp tiến độ đơn giản, dễ hiểu.

- [x] `F4`: thêm mục **Phạm vi** — áp cho cả 2 chiều (trước: kéo năm nay nhưng lúc bật đẩy **hết**):
  - không lặp: có ngày trong năm hiện tại;
  - lặp dương: còn lần diễn ra trong năm hiện tại → đồng bộ cả chuỗi (kể cả bắt đầu năm trước);
  - lặp âm: không đồng bộ (như cũ);
  - event đã liên kết vẫn đồng bộ khi sửa/xoá; event mới cho năm sau → đẩy khi sang năm đó.
- [x] Chữ hộp tiến độ (màn 22): "Đang lấy sự kiện năm 2026 từ Google về Daynest, và gửi sự kiện của Daynest lên Google." → "Gồm sự kiện năm 2026 và các sự kiện lặp lại." (tiêu đề hộp đã là "Đang đồng bộ Google Calendar").
- [x] Spec tổng §2, `mockups.html`, test hàm phạm vi trong F4.
