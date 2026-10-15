# 2026-10-15 — Biểu đồ Chi tiêu: hiện số tiền từng cột — ⏸ chờ duyệt

## Input

- Bạn (2026-10-15): "ở biểu đồ tuần và tháng, tôi muốn hiển thị số tiền chi tiêu của từng ngày. ở biểu đồ tháng, hiển thị theo tuần trong tháng và 6 tháng gần đây".

## Plan

- [ ] 1. Hiểu thế này, bạn xác nhận: **Tuần** → 7 cột (từng ngày), mỗi cột có số tiền · **Tháng** → cột theo từng tuần trong tháng + biểu đồ 6 tháng gần đây, mỗi cột có số tiền. Số rút gọn cho vừa cột (vd 35k, 1,2tr).
- [ ] 2. Xem `BarChart.tsx` + màn Chi tiêu hiện tại; thêm nhãn số trên cột (hàm rút gọn tiền là hàm thuần).
- [ ] 3. Tháng: gộp khoản chi theo tuần trong tháng (tuần theo `weekStart` Cài đặt).
- [ ] 4. Thêm vào spec S6 (hoặc S4 §Chi tiêu) + mockup nếu bạn muốn xem trước · kiểm trên máy ảo · commit + push.

## Kết quả
