# 2026-10-14 — Tài liệu kiến trúc + tổng quan theo spec chốt mới nhất (tới S6) — ✅ xong

## Input

- Bạn (2026-10-14): "update lại docs liên quan. không cần ghi trạng thái đã code hay chưa. chỉ cần ghi theo nội dung chốt mới nhất."
- Hiểu: tài liệu mô tả thiết kế **đã chốt** (S1–S6), không ghi "theo code vX", "chưa code", "cập nhật ngày…".
- Spec chốt mới nhất: [sprint-6/index.md](../docs/specs/sprint-6/index.md) § Đã chốt + [sprint-6/design/db.md](../docs/specs/sprint-6/design/db.md).
- Việc trước: [2026-10-14-architecture-docs-update.md](2026-10-14-architecture-docs-update.md).

## Plan

Chỉ sửa tài liệu trong `docs/specs/architecture/` + `docs/overview.md|.html`. Không chép chi tiết UI của S6 (rung, khung xương, giao diện từng màu…) — chỉ phần ảnh hưởng luồng dữ liệu, link sang S6.

- [x] 1. Bỏ dòng trạng thái: `architecture/index.md` ("Trạng thái: theo code v5.0.1…"), `overview.md|.html` ("Theo code v5.0.1 (hết S5), cập nhật 2026-10-14").
- [x] 2. `calendar.md` + overview mục 5: event / todo tải **1 lượt** (select lồng `events → event_exceptions`, `todos → todo_exceptions`) · đọc lỗi tự thử lại 2 lần (1 s, 3 s) · lỗi tải: có dữ liệu → giữ + "Chưa cập nhật được · Thử lại", chưa có → thẻ lỗi.
- [x] 3. `data-writes.md` + overview mục 6: Lưu chờ server → **đặt dòng đã lưu vào cache, không tải lại** · ghi không tự thử lại · Xoá: biến mất ngay, **Hoàn tác 4 s** rồi mới gửi (ra nền → gửi ngay, lỗi → hiện lại) · mất mạng khoá mọi thao tác ghi (trừ giao diện).
- [x] 4. `errors.md` (viết lại theo S6 §3): thời gian chờ 15 s (ảnh, Edge Function 60 s) · banner mất mạng chung · 5 loại lỗi + câu thông báo · hàm phân loại lỗi trong `lib/`.
- [x] 5. `database.md` + overview mục 9: `user_settings` + `monthly_budget`, cột giao diện · bảng `expense_month_budgets`, `expense_recurrences` · `expenses.recurrence_id` · hàm `generate_due_expenses` · ảnh nền chỉ trên máy.
- [x] 6. Tạo `expenses.md`: Chi tiêu — tổng tháng ở DB, ngân sách của tháng (riêng ghi đè chung), khoản chi lặp tự ghi (`generate_due_expenses`, khoá dòng, ≤ 60 / lần, chặn ngày tương lai). Thêm vào bảng file ở `index.md`.
- [x] 7. `user-flow.md`: banner mất mạng · Chi tiêu theo nhóm → pop-up nhóm · ngân sách · Khoản chi lặp lại (từ màn Nhóm) · Cài đặt › Giao diện.
- [x] 8. Sửa nhỏ: `google-sync.md` (chờ 15 s; xoá event đồng bộ gửi sau Hoàn tác) · `traffic.md` (đọc thử lại 2 lần, ghi không thử lại, test tải S6, index `expense_recurrences`) · `conflicts.md` (2 máy cùng tự ghi khoản chi lặp → khoá dòng, không trùng; ngân sách / quy tắc lặp theo khoá lạc quan) · `index.md` (vai trò app: banner, cache lưu xong; hàm SQL thêm `generate_due_expenses`; cache AsyncStorage + giao diện trên máy).
- [x] 9. Overview html: sửa sơ đồ 5 (ô "fetchEvents + fetchExceptions" → 1 lượt) và sơ đồ 6 (ô Thành công: "đặt dòng vào cache", thêm nhánh mất mạng / Hoàn tác) · chụp lại sáng / tối.
- [x] 10. Kiểm tra: grep không còn "theo code", "chưa code", "v5.0.1", "hết S5" trong 2 nơi trên · link đúng · dựng lại mọi Mermaid bằng `mermaid-cli`.
- [x] 11. Cập nhật file này + `wip/index.md` · commit `docs: architecture per latest spec` (chỉ file của việc này) + push.

## Kết quả
- 2026-10-14 — Bước 1–8: bỏ 3 dòng trạng thái · `calendar.md` + overview §5 (1 lượt, thử lại 2 lần, lỗi tải; có mạng lại → tải lại, mở lại app → nếu cũ > 2 phút) · `data-writes.md` viết lại (lưu → đặt vào cache, Hoàn tác 4 s, mất mạng) + overview §6 · `errors.md` viết lại (phân loại, thời gian chờ, tình huống) · `database.md` (+2 bảng, cột ngân sách/giao diện, `recurrence_id`, 3 nguyên tắc) + overview §9 · tạo `expenses.md` · `user-flow.md` (banner, nhóm → pop-up, ngân sách, khoản chi lặp, Giao diện) · `google-sync.md`, `traffic.md`, `conflicts.md`, `index.md`.
- 2026-10-14 — Bước 9: overview.html sơ đồ 5 (ô "Tải 1 lượt: events + ngoại lệ"), sơ đồ 6 (ô Thành công: đặt vào cache → Google → nhắc) + sơ đồ mới "Xoá có Hoàn tác 4 s" · chụp sáng / tối đúng.
- 2026-10-14 — Bước 10: không còn "theo code", "chưa code", "v5.0.1", "hết S5", "invalidate" · link nội bộ đúng · `mermaid-cli` 11.4.2 dựng 21/21 sơ đồ OK.
- 2026-10-14 — Bước 11: commit `docs: architecture per latest spec` + push.
