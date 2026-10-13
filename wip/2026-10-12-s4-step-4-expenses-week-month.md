# 2026-10-12 — S4 bước 4: Tab Chi tiêu — Tuần, Tháng + biểu đồ — ✅ xong (máy thật thử ở bước 8)

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · mockup màn 1, 1b, 2, 2b.

## Input

- Tuần, Tháng chỉ hiện số liệu tổng hợp · biểu đồ theo ngày · 6 tháng gần đây.

## Plan

- [x] 1. Hàm thuần + test: cộng theo ngày trong kỳ · số gọn ("2,5tr", "510k") · nhãn trục tháng (1, 5, 10, …, ngày cuối).
- [x] 2. `components/BarChart.tsx` (react-native-svg) theo design-system: 1 màu, cột đang chọn `primaryDark`, số trên cột cao nhất, bấm cột → `onPress(i)`, bấm giữ → hiện số tiền.
- [x] 3. Tuần: tổng · theo ngày (7 cột) · theo nhóm · bấm cột → chế độ Ngày của ngày đó.
- [x] 4. Tháng: tổng · theo ngày · 6 tháng gần đây (`expense_monthly_totals`) · theo nhóm · bấm cột tháng → tháng đó.
- [x] 5. Tải trước kỳ liền kề như Lịch (bản 3.0.1).
- [x] 6. `typecheck && lint && test` · máy thật: để bước 8 (như bước 3).
- [x] 7. Commit `feat(app): expenses week and month views with charts` + push.

## Kết quả

- 2026-10-13 — Việc 1: `lib/expenses` thêm `dailyTotals`, `recentMonths(Range)`, `monthlyTotals`, `isMonthAxisDay`, `compactVnd` + 5 test (13/13 qua).
- 2026-10-13 — Việc 2: `components/BarChart.tsx` dùng `View` thường (giống mockup, không cần `react-native-svg`): cột `primary` mờ 55%, cột đánh dấu `primaryDark`, số gọn trên cột cao nhất, nhãn trục tràn sang bên cạnh thay vì bị cắt (cột tháng chỉ rộng ~9 px). Bấm cột → `onPress`, bấm giữ → toast "12/10: 250.000 ₫".
- 2026-10-13 — Việc 3: `features/expenses/ExpenseCharts.tsx` `DailyChart`: Tuần ghi T2…CN theo `week_start`, cột hôm nay đậm · bấm cột → chế độ Ngày của ngày đó.
- 2026-10-13 — Việc 4: Tháng: `DailyChart` (nhãn 1, 5, …, 25, ngày cuối) + `MonthlyChart` (6 tháng, tháng đang xem đậm, bấm → tháng đó). Số 6 tháng lấy từ RPC `expense_monthly_totals` (đã có trên DB thật), key `[expenses, 'monthly', …]` để lưu khoản chi ở bước 5 làm mới luôn biểu đồ. Thứ tự: tổng · theo ngày · 6 tháng · theo nhóm (như mockup). Kỳ trống ẩn cả biểu đồ (spec).
- 2026-10-13 — Việc 5: tải trước kỳ trước/sau cho cả khoản chi và tổng 6 tháng (chỉ ở chế độ Tháng).
- 2026-10-13 — Việc 6: i18n `expenses.byDay`, `expenses.recentMonths` (en + vi) · `typecheck` qua · `lint` 0 lỗi (3 cảnh báo cũ) · `npm test` 22 bộ / 157 test qua.
- 2026-10-13 — Máy ảo: chưa thử. Lệnh `npm run release` (build APK thử) bị chặn quyền tự động → để bước 8, thử trên máy thật: số liệu biểu đồ khớp tổng, nhãn trục tháng không bị cắt, số trên cột cao nhất không tràn ra ngoài thẻ.
- 2026-10-13 — Việc 7: commit `feat(app): expenses week and month views with charts` + push.
