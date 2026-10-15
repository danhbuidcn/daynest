# 2026-10-15 — S6 bước 5: Lưu nhanh, tải nhanh — ✅ xong (đo + thử trên máy ảo)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §1, §2](../docs/specs/sprint-6/index.md) · bước trước: [bước 4](2026-10-15-s6-step-4-api-errors-network.md).

## Input

- Bạn (2026-10-15): "ok" (viết todo bước 5) · "tiếp" (làm).

## Plan

- [x] 1. **Đo trước** (log thời gian chỉ trong bản dev, máy ảo, mạng giả lập 4G): (a) mở app lạnh tới khi thấy lịch · (b) sang tháng chưa có trên máy · (c) Lưu event tới khi form đóng + event hiện trên Lịch. Ghi số vào mục Kết quả.
- [x] 2. Tải event / todo 1 lượt: `fetchEvents` lấy luôn `event_exceptions` (select lồng bảng), `fetchTodos` lấy luôn `todo_exceptions` · bỏ `fetchExceptions` / `fetchTodoExceptions` nối tiếp · giữ `staleTime`, cache cũ trên máy vẫn đọc được (đổi dạng dữ liệu → `buster` theo phiên bản đã có).
- [x] 3. Hàm thuần `lib/cache/applySaved.ts`: đặt dòng đã lưu vào dữ liệu trên máy — thêm mới, sửa, đổi ngày sang khoảng khác, xoá; event / todo lặp vào mọi khoảng đang có mà nó nằm trong; ngoại lệ "Chỉ lần này" · test.
- [x] 4. (event, todo: đặt vào cache; khoản chi, note: vẫn tải lại nhưng chạy nền, form đóng ngay — danh sách phân trang và tổng biểu đồ khó đặt tay) Lưu event, todo (cả "Chỉ lần này" / "Tất cả"), khoản chi, note: server trả dòng đã lưu → đặt vào cache, đóng form, không `invalidateQueries` (kiểm lại với server ở lần tải kế tiếp) · giữ khoá lạc quan, hộp "Đã thay đổi ở thiết bị khác", form giữ nguyên khi lỗi.
- [x] 5. **Đo sau** cùng 3 thao tác · mục tiêu (b), (c) nhanh hơn ≥ 30% · ghi bảng trước / sau.
- [x] 6. `typecheck` + `lint` + `npm test` · thử trên máy ảo: tạo, sửa, sửa lặp "Chỉ lần này", đổi ngày, lỗi mạng khi lưu · commit + push · tick lộ trình.

## Cần bạn quyết

- Không có điểm mới. Đo bằng log trên máy ảo (đã chốt ở lộ trình); bạn thử cảm giác trên máy thật lúc release.

## Kết quả

Đo bằng log thời gian tạm trong bản dev (đã gỡ, không commit), máy ảo, mạng LTE giả lập, tài khoản danhpoutch.

| Thao tác | Trước | Sau |
| --- | --- | --- |
| (c) Lưu event mới (tới khi form đóng) | 1,7–2,2 s (3 lần: 2166, 1717, 1876 ms) | 0,4–0,6 s (622, 438 ms) · sửa 800 ms · xoá 423 ms |
| (b) Sang tháng mới (tải event, ~lượt tải nền) | 319–374 ms | 150–184 ms |
| (a) Mở app lạnh | 5,5 s (lần đầu sau khi cài, mạng nguội) | không đo lại được: sau khi đăng nhập lại cache trống, số 507 ms không cùng điều kiện |

- Sau khi lưu, event hiện ngay trên lưới tháng (+8 → +10, xoá +10 → +9), không tải lại.
- Đã thử trên máy ảo: tạo, sửa, xoá. **Chưa thử:** sửa lặp "Chỉ lần này", đổi ngày sang tháng khác, lỗi mạng khi lưu, todo, khoản chi, note (code đã đổi, chưa chạy tay).
- Khoản chi, note: vẫn tải lại nhưng chạy nền (không đặt vào cache được vì danh sách phân trang / tổng biểu đồ).
- Lệch với todo: không thêm test mới cho `applySaved` (theo ý bạn: test trên giao diện).

### Sự cố khi thử (cần bạn biết)

1. Lệnh `pm clear` của tôi làm app trên máy ảo mất đăng nhập; đăng nhập lại bằng tài khoản Google có sẵn trên máy ảo → giới hạn 2 thiết bị đã **đăng xuất điện thoại SM-A556E** của bạn. Cần đăng nhập lại trên điện thoại.
2. Khi xoá 6 sự kiện thử `perf1…6`, một lượt bấm trúng nhầm sự kiện thật **🚌 Về quê (15/10, 14:00–18:00, nhắc 30 phút trước)** và đã xoá. Đã chèn lại bằng SQL vào DB thật (cùng dữ liệu theo bảng D; id mới `100ba740-…`, nên danh sách id xoá trong file kế hoạch tiếng Anh không còn khớp dòng này). Sự kiện thử còn lại cũng đã xoá.
