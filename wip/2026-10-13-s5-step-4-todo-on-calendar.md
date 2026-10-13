# 2026-10-13 — S5 bước 4: Todo trên Lịch + nhắc todo — ✅ xong

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · spec [S5 § Todo trên Lịch](../docs/specs/sprint-5/index.md#todo-trên-lịch) · [mockup](../docs/specs/sprint-5/design/mockups.html) màn 4, 5, 6.

## Input

- Bước 3 đã có: `useTodosInRange` (trả `TodoOccurrence` = `EventOccurrence` + việc phụ + trạng thái), `useSetTodoStatus` (tick lạc quan), `TodoTick`, màn `/todo/[id]`.
- Lịch: `app/(tabs)/calendar.tsx` tải event bằng `useEventsInRange`, truyền `occurrences` xuống `MonthView` (thanh `EventBar`), `WeekView` / `ListView` (thẻ `EventCard`), `DayView` (`EventBar` lớn ở hàng Cả ngày + `DayTimeline`), `DayEventsDialog` (dòng `EventListRow`).
- Nhắc: `features/reminders/reminderSync.ts` chỉ đọc event · bấm thông báo → `/event/[id]` (`useNotificationTap.ts`).

## Output

- Todo hiện cùng event trên Tháng, Tuần, Ngày, Danh sách, pop-up ngày, có ô tròn; tick ngay trên Lịch (trừ thanh Tháng: chỉ hiện) · todo có nhắc → thông báo, bấm → chi tiết todo.

## Plan

- [x] 1. `calendar.tsx`: tải thêm `useTodosInRange` (+ tải trước kỳ bên cạnh như event) · gộp event + todo cho các chế độ; bấm todo → `/todo/[id]`, bấm event → như cũ · tick → `useSetTodoStatus` (lỗi → toast "Lưu không thành công…").
- [x] 2. Tháng: `BarItem` thêm kind `todo` + `done` → `EventBar` vẽ ô tròn nhỏ ở đầu thanh (xong: tròn đặc ✓, chữ gạch ngang, mờ). Thứ tự: ngày lễ · event · todo.
- [x] 3. Tuần, Danh sách: `EventCard` nhận thêm `todo` (tuỳ chọn) → ô tròn bấm được trước tiêu đề, "2/5" sau giờ, xong → gạch ngang mờ. Ngày: todo cả ngày ở hàng Cả ngày, todo có giờ trên dòng thời gian — cùng kiểu thẻ (tick được).
- [x] 4. Pop-up ngày: todo dưới event, `EventListRow` có ô tick + "2/5".
- [x] 5. Hàm thuần sắp thứ tự / gộp (event trước todo, todo xong xuống cuối trong cùng ngày) + test.
- [x] 6. Nhắc: `reminderSync` đọc thêm todo (cùng 30 ngày, dùng `pickReminders` chung) · `data` có `todoId` → `useNotificationTap` mở `/todo/[id]` · lần todo đã xong → **không nhắc** (bạn chọn A); tick / bỏ tick → đặt lại nhắc.
- [x] 7. `npm run typecheck && npm run lint && npm test` · `npm run release` → máy ảo: tạo todo (có việc phụ, lặp, có giờ + nhắc 1 phút) → thấy trên Tháng / Tuần / Ngày / Danh sách / pop-up, tick ở từng nơi, lỗi mạng → trả lại + toast, thông báo đến → bấm mở chi tiết · thử lại 2 việc còn treo từ bước 2 ("1 note" ở Categories, hộp xoá) · dọn dữ liệu thử · commit `feat(app): todos on the calendar, todo reminders` + push.

Không làm: danh sách todo ở tab Ghi chú (bước 5), chu kỳ (bước 6–7).

## Kết quả
- 2026-10-13 — Bạn `ok`, chọn **A**: todo đã xong không nhắc.
- 2026-10-13 — 1–6 xong: `calendar.tsx` tải + tải trước todo, gộp với event, tick (`useSetTodoStatus`, lỗi → toast), bấm todo → `/todo/[id]` · `EventBar` (thanh Tháng: chấm tròn nhỏ, chỉ hiện; hàng Cả ngày của Ngày: ô tick bấm được) · `EventCard`, `EventListRow`, `DayTimeline`: ô tick + "2/5", xong → gạch ngang mờ · `calendarOrder` (event → todo chưa xong → todo xong) + test · `reminderSync` thêm todo chưa xong, `data.todoId` → `useNotificationTap` mở chi tiết todo · tick → đặt lại nhắc.
- typecheck qua · lint 0 lỗi (3 cảnh báo cũ) · `npm test` 25 bộ, 188 test qua.
- 2026-10-13 16:30 — Thử máy ảo (2 bản build, 8–9 phút mỗi bản):
  - Todo lặp hằng ngày, 2 việc phụ: Tháng hiện thanh có ô tròn, xong → ✓ + gạch ngang mờ · pop-up ngày: ô tick + "0/2" → tick → "2/2" · Danh sách, Tuần, Ngày (hàng Cả ngày) tick được · tick 14/10 ở Tuần, 13/10 giữ nguyên.
  - 2 todo có giờ thêm thẳng vào DB (bắt đầu sau 3 phút, nhắc đúng giờ; 1 chưa xong, 1 đã xong): dòng thời gian của Ngày hiện cả 2 có ô tick · chỉ có 1 lịch báo, thông báo "Nhac chua xong · 16:13 – 16:43" đến (cái đã xong không báo) · bấm thông báo → mở chi tiết todo.
  - **Lỗi tìm thấy, đã sửa:** mất mạng → yêu cầu tick treo mãi, màn hiện "đã xong" dù DB không đổi. Sửa: `setTodoStatus` kiểm tra mạng trước (như `authService`), mất mạng → báo lỗi ngay. Thử lại: trả lại ngay + toast "Lưu không thành công. Vui lòng thử lại." · có mạng → lưu đúng.
  - **Phát hiện (chưa sửa, ngoài phạm vi):** yêu cầu gửi lúc mất mạng (vd. lưu nhóm ghi chú, đổi ngôn ngữ) có thể treo, nút Lưu mờ mãi đến khi tắt app mở lại. Lỗi chung của app, có từ trước — đề xuất xử lý riêng (thêm thời gian chờ cho mọi yêu cầu Supabase).
  - "1 note" (Categories, hộp xoá): **chưa thử trên máy ảo** (thao tác bị treo vì lỗi trên) — đã kiểm bằng i18next ở bước 2.
  - Đã dọn: 3 todo thử (DB 0 todo). Ngôn ngữ vẫn Tiếng Việt.
