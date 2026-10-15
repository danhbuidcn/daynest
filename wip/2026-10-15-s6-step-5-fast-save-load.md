# 2026-10-15 — S6 bước 5: Lưu nhanh, tải nhanh — ⏳ chờ bạn duyệt

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §1, §2](../docs/specs/sprint-6/index.md) · bước trước: [bước 4](2026-10-15-s6-step-4-api-errors-network.md).

## Input

- Bạn (2026-10-15): "ok" (viết todo bước 5).

## Plan

- [ ] 1. **Đo trước** (log thời gian chỉ trong bản dev, máy ảo, mạng giả lập 4G): (a) mở app lạnh tới khi thấy lịch · (b) sang tháng chưa có trên máy · (c) Lưu event tới khi form đóng + event hiện trên Lịch. Ghi số vào mục Kết quả.
- [ ] 2. Tải event / todo 1 lượt: `fetchEvents` lấy luôn `event_exceptions` (select lồng bảng), `fetchTodos` lấy luôn `todo_exceptions` · bỏ `fetchExceptions` / `fetchTodoExceptions` nối tiếp · giữ `staleTime`, cache cũ trên máy vẫn đọc được (đổi dạng dữ liệu → `buster` theo phiên bản đã có).
- [ ] 3. Hàm thuần `lib/cache/applySaved.ts`: đặt dòng đã lưu vào dữ liệu trên máy — thêm mới, sửa, đổi ngày sang khoảng khác, xoá; event / todo lặp vào mọi khoảng đang có mà nó nằm trong; ngoại lệ "Chỉ lần này" · test.
- [ ] 4. Lưu event, todo (cả "Chỉ lần này" / "Tất cả"), khoản chi, note: server trả dòng đã lưu → đặt vào cache, đóng form, không `invalidateQueries` (kiểm lại với server ở lần tải kế tiếp) · giữ khoá lạc quan, hộp "Đã thay đổi ở thiết bị khác", form giữ nguyên khi lỗi.
- [ ] 5. **Đo sau** cùng 3 thao tác · mục tiêu (b), (c) nhanh hơn ≥ 30% · ghi bảng trước / sau.
- [ ] 6. `typecheck` + `lint` + `npm test` · thử trên máy ảo: tạo, sửa, sửa lặp "Chỉ lần này", đổi ngày, lỗi mạng khi lưu · commit + push · tick lộ trình.

## Cần bạn quyết

- Không có điểm mới. Đo bằng log trên máy ảo (đã chốt ở lộ trình); bạn thử cảm giác trên máy thật lúc release.

## Kết quả

