# Cải thiện tốc độ, UX/UI, tính năng (trước S6 cũ)

Trạng thái: ✅ xong (bước 1–4) · tiếp: viết spec S6 · Tạo: 2026-10-14

## Plan

### Input

- Yêu cầu: app đã xong, cải thiện tốc độ + UX/UI hoặc thêm tính năng hữu ích, tham khảo app khác. Phải tính đến API lỗi, server có vấn đề, mất mạng.
- Đã chốt với bạn:
  - Làm **trước** S6 cũ (quảng cáo + Pro + lên Play).
  - Chọn: T1+T2, U6+U8, U3+U4, và nhờ tôi đề xuất trong U1/U2/U5/U7.
  - **Giữ online-only**: mất mạng chỉ xem, khoá ghi; có mạng thì Lưu hiện ngay, lỗi thì hoàn lại.

### Output

- 1 sprint mới **S6 — Nhanh, bền và tính năng**: T1, T2, E1–E5, U6, U8, U3, U4, U2, U7. Theo quy trình 5 giai đoạn (spec → mockup → code plan → code → release).
- S6 cũ → đổi thành **S7** (đổi tên folder `docs/specs/sprint-6/` → `sprint-7/`, sửa link).
- Để sau khi lên Play: U1 widget, U5 chế độ tối.

### Context — Investigation (chỉ đọc code, chưa đo trên máy)

**Tốc độ**

| # | Vấn đề | Bằng chứng | Cách sửa |
| --- | --- | --- | --- |
| T1 | Bấm Lưu (event, todo, khoản chi, note) phải chờ server, rồi tải lại mới thấy | `useEvents.ts` `useSaveEvent`: chỉ `onSuccess` → `invalidate`; form `run(() => mutateAsync…)` chờ xong | Cập nhật lạc quan (hiện ngay, lỗi thì hoàn lại) như `useSetTodoStatus` đã làm |
| T2 | Tải event/todo tốn 2 lượt gọi nối tiếp (bảng chính → bảng ngoại lệ) | `eventsQueryOptions`, `todosQueryOptions` | Gộp 1 lượt (select lồng bảng của Supabase) · đo trước/sau |
| T3 | Lưu 1 event → mọi khoảng ngày đang mở tải lại, mỗi khoảng 2 lượt | `invalidateQueries({ queryKey: [EVENTS_KEY] })` | Hết khi xong T1 + T2 |

**Lỗi API, server, mất mạng**

| # | Vấn đề | Bằng chứng | Hậu quả |
| --- | --- | --- | --- |
| E1 | Gọi API không giới hạn thời gian chờ | `lib/supabase.ts` không có `fetch` kèm timeout | Server treo → nút Lưu quay rất lâu |
| E2 | Thư viện dữ liệu (TanStack Query) không biết mạng tắt/bật, app quay lại màn hình | Không có `onlineManager`, `focusManager` | Có mạng lại / mở lại app không tự tải mới |
| E3 | Mỗi màn tự kiểm tra mạng, không có banner chung | 5 chỗ dùng `common.offline`; spec §5 ghi "Mất mạng → banner" | Có màn khoá Lưu, có màn không |
| E4 | Tab Lịch không có trạng thái lỗi | Chỉ `manage.tsx`, `expenses.tsx` xử lý `isError` | Tải lỗi → Lịch trống như "không có event" |
| E5 | Không phân biệt lỗi mạng, server sập, Supabase tạm dừng project | Toast lỗi chung | Người dùng không biết nên thử lại hay chờ |

**UX/UI và tính năng** (tham khảo CalendarCute, TimeTree, Google Calendar, Money Lover, Google Keep)

| # | Việc | Sprint |
| --- | --- | --- |
| U6 | Rung nhẹ khi tick, lưu, xoá · khung xương khi tải lần đầu | S6 |
| U8 | Nút Hoàn tác trên toast sau khi xoá | S6 · note đã có (thùng rác, `useNotes.ts:83`) → chỉ thêm cho event, todo, khoản chi |
| U3 | Ngân sách tháng cho chi tiêu, báo khi sắp vượt | S6 |
| U4 | Khoản chi lặp lại (tiền nhà, điện, mạng) | S6 |
| U2 | ~~Tìm kiếm event, todo~~ | **Bỏ** (bạn chốt 2026-10-14: màn Lịch đã nhiều dữ liệu) · `F1-calendar.md:70` trả về như cũ |
| U7 | ~~Note dạng checklist~~ | **Bỏ** — đã có từ trước (`features/notes/editor/ChecklistBlock.tsx`), tôi rà sai |
| U1 | Widget màn hình chính | Sau Play (code native, rủi ro build) · S2 từng loại |
| U5 | Chế độ tối | **S6** — gộp vào tính năng Giao diện (bạn yêu cầu 2026-10-14: đổi màu, nền, font như CalendarCute) |

### Plan (bước này chỉ sửa tài liệu, chưa sửa code)

- [x] 1. Đổi `docs/specs/sprint-6/` → `sprint-7/`, sửa mọi link trỏ tới nó (cả `wip/`, `CLAUDE.md` nếu có).
- [x] 2. `docs/specs/index.md`: bảng §4 thêm S6 "Nhanh, bền và tính năng", S7 = S6 cũ · §2 ghi rõ "Online-only: mất mạng khoá ghi ở mọi màn, có mạng thì Lưu hiện ngay" · §1 bỏ tìm kiếm khỏi danh sách "Không làm" (nếu có ở đó).
- [x] 3. `docs/specs/sprint-2/F1-calendar.md:70`: ghi chú "tìm kiếm event → làm ở S6".
- [x] 4. Thêm dòng vào `wip/index.md`, commit `docs: plan s6 speed, reliability and features`.
- [ ] 5. Bước tiếp theo (todo riêng, chờ duyệt riêng): viết spec S6 (`docs/specs/sprint-6/index.md`) theo bảng trên.

## Kết quả

- 2026-10-14 — Bạn duyệt: gộp thành 1 sprint S6, S6 cũ → S7. `git mv sprint-6 sprint-7`, sửa link ở `docs/index.md`, `docs/specs/index.md`, `sprint-4/design/db.md`, `sprint-5/index.md`, wip S6 cũ · thêm S6 vào bảng §4, ghi rõ online-only ở §2 · `F1-calendar.md:70` ghi tìm kiếm event làm ở S6. Mục "Không làm" ở §1 không có tìm kiếm → không cần sửa.
