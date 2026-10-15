# 2026-10-15 — Biểu đồ Chi tiêu: hiện số tiền từng cột — ⏸ chờ bạn duyệt mockup

## Input

- Bạn (2026-10-15): "ở biểu đồ tuần và tháng, tôi muốn hiển thị số tiền chi tiêu của từng ngày. ở biểu đồ tháng, hiển thị theo tuần trong tháng và 6 tháng gần đây".

## Plan

- [x] 1. Bạn chốt: **Tuần** → 7 cột theo ngày · **Tháng** → biểu đồ **theo ngày** + biểu đồ **6 tháng gần nhất** · mọi cột đều ghi số tiền (rút gọn "35k", "1,2tr"). *(Không có biểu đồ "theo tuần trong tháng".)*
- [x] 1b. Mockup S6: màn 9 (Tháng, số xoay dọc trên 31 cột), 9e (Tháng — 6 tháng), 9f (Tuần) + spec S6 §Chi tiêu. **Chờ bạn duyệt.**
- [ ] 2. Xem `BarChart.tsx` + màn Chi tiêu hiện tại; thêm nhãn số trên cột (hàm rút gọn tiền là hàm thuần).
- [ ] 3. Biểu đồ 6 tháng gần nhất ở Tháng (đã có hàm `expense_monthly_totals`); bỏ "chỉ ghi số cột cao nhất".
- [ ] 4. Thêm vào spec S6 (hoặc S4 §Chi tiêu) + mockup nếu bạn muốn xem trước · kiểm trên máy ảo · commit + push.

## Kết quả
