# 2026-10-15 — S6 bước 6: Hoàn tác sau khi xoá — ✅ xong (thử trên máy ảo)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §5](../docs/specs/sprint-6/index.md) · bước trước: [bước 5](2026-10-15-s6-step-5-fast-save-load.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 5).

## Plan

- [x] 1. `lib/undo/pendingDelete.ts` (module thường, không phụ thuộc React): `scheduleDelete({ hide, restore, commit, onError })` · chạy `hide` ngay · sau 4 s chạy `commit` · `cancel()` chạy `restore` · app ra nền (`AppState`) → `commit` ngay mọi lệnh đang chờ · bắt đầu 1 lệnh xoá mới khi còn lệnh cũ → gửi lệnh cũ ngay (toast chỉ giữ 1 Hoàn tác, giống Gmail) · `commit` lỗi → `restore` + `onError`.
- [x] 2. Hook `features/cache/useUndoableDelete.ts`: nối `scheduleDelete` với toast ("Đã xoá" + nút Hoàn tác, 4 s — `useToast` đã có nút hành động từ S3) và với cache. `hide` = chụp dữ liệu các khoảng đang có rồi gỡ mục khỏi đó · `restore` = trả lại bản chụp · `commit` = mutation xoá hiện có (đã tự cập nhật cache khi thành công).
- [x] 3. Event: `useEventDelete` — bỏ hộp xác nhận ở event không lặp · lặp vẫn hỏi "Chỉ lần này / Tất cả" rồi xoá luôn, không hộp thứ hai · "Chỉ lần này" = `hide` đặt ngoại lệ `skip` vào cache · event đang đồng bộ Google: chỉ gọi `googleSync.deleteEvent` khi `commit` (Hoàn tác thì Google không bị đụng).
- [x] 4. Todo: `useTodoDelete` làm như event (cả "Chỉ lần này" và "Tất cả").
- [x] 5. Khoản chi: `app/expense/edit.tsx` bỏ `ConfirmDialog` xoá · `hide` gỡ khoản chi khỏi danh sách kỳ đang có · tổng biểu đồ 6 tháng tải lại sau khi `commit` (như hiện nay).
- [x] 6. Chuỗi i18n: "Đã xoá" + "Hoàn tác" (cùng khoá trong `en.json`, `vi.json`; dùng lại khoá `notes.undo` nếu hợp) · bỏ chuỗi hộp xác nhận không còn dùng (`event.delete*`, `expenses.form.deleteTitle/deleteText`…). Giữ hộp xoá nhóm chi tiêu, quy tắc lặp, xoá vĩnh viễn note.
- [x] 7. `typecheck` + `lint` + `npm test` · thử trên máy ảo: xoá event không lặp rồi Hoàn tác · để hết 4 s (xoá thật, kiểm DB) · xoá rồi ra nền trong 4 s (vẫn xoá) · xoá lặp "Chỉ lần này" + Hoàn tác · todo · khoản chi · lỗi khi gửi (tắt mạng ngay sau khi bấm xoá; mục hiện lại + toast) · event Google (nếu có thử được) · commit + push · tick lộ trình.

## Cần bạn quyết

1. Thêm 1 lệnh xoá khi còn lệnh cũ đang chờ → gửi lệnh cũ ngay (đề xuất, giống Gmail), hay giữ cả hai Hoàn tác? Đề xuất: gửi ngay, đơn giản và không mất lệnh.
2. Thử trên máy ảo: tôi **không** bấm xoá các sự kiện thật của bạn nữa — chỉ tạo event, todo, khoản chi thử rồi xoá chúng (kiểm lại tên trước mỗi lần bấm xoá).
3. Không thêm test Jest mới (theo ý bạn trước); `pendingDelete` là hàm thuần nên dễ thêm sau nếu bạn muốn.

## Kết quả

Đã thử trên máy ảo, chỉ với dữ liệu thử do tôi tạo (event `undo1`, `undo2`, `undor`; todo `undot`; khoản chi 1.234 ₫), đã xoá hết:

- Event không lặp: xoá → biến mất ngay + toast "Đã xoá · Hoàn tác" · Hoàn tác (≤ 4 s) → hiện lại, DB còn · để hết 4 s → DB mất.
- Xoá rồi về màn hình chính (ra nền) trong 4 s → DB mất ngay.
- Todo: xoá → toast → hết 4 s → DB mất. Khoản chi: xoá → danh sách + tổng cập nhật ngay → DB mất.
- Event lặp hằng ngày + "Chỉ lần này": chỉ ngày 15/10 mất `undor`, các ngày khác còn; DB có dòng `skip` 2026-10-15.
- Không còn hộp xác nhận xoá (event, todo, khoản chi); event / todo lặp vẫn hỏi "Chỉ lần này / Tất cả".
- **Chưa thử:** lỗi khi gửi xoá (mục hiện lại + toast lỗi; nút Xoá vốn khoá khi mất mạng nên khó tái hiện), xoá event đồng bộ Google, Hoàn tác của "Chỉ lần này" / todo / khoản chi (cùng đường code với event không lặp).
- Cảnh báo dev "ref.measureLayout must be called with a ref to a native component" xuất hiện khi mở chi tiết todo — chưa rõ gốc, không liên quan Hoàn tác (không đụng tới menu).

