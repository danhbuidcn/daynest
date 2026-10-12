# 2026-10-12 — S4 bước 4: Tab Chi tiêu — Tuần, Tháng + biểu đồ — ⏳ chờ duyệt

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · mockup màn 1, 1b, 2, 2b.

## Input

- Tuần, Tháng chỉ hiện số liệu tổng hợp · biểu đồ theo ngày · 6 tháng gần đây.

## Plan

- [ ] 1. Hàm thuần + test: cộng theo ngày trong kỳ · số gọn ("2,5tr", "510k") · nhãn trục tháng (1, 5, 10, …, ngày cuối).
- [ ] 2. `components/BarChart.tsx` (react-native-svg) theo design-system: 1 màu, cột đang chọn `primaryDark`, số trên cột cao nhất, bấm cột → `onPress(i)`, bấm giữ → hiện số tiền.
- [ ] 3. Tuần: tổng · theo ngày (7 cột) · theo nhóm · bấm cột → chế độ Ngày của ngày đó.
- [ ] 4. Tháng: tổng · theo ngày · 6 tháng gần đây (`expense_monthly_totals`) · theo nhóm · bấm cột tháng → tháng đó.
- [ ] 5. Tải trước kỳ liền kề như Lịch (bản 3.0.1).
- [ ] 6. `typecheck && lint && test` · máy thật: số liệu khớp tổng khoản chi.
- [ ] 7. Commit `feat(app): expenses week and month views with charts` + push.

## Kết quả
