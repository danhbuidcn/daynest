# 2026-10-14 — Cập nhật tài liệu kiến trúc theo code v5.0.1 — ✅ xong

## Input

- Bạn (2026-10-14): "Tài liệu kiến trúc đã cũ sửa. update tài liệu".
- `docs/specs/architecture/` ghi "theo code tới S2 bước 6"; code hiện tại: hết S5 (v5.0.1).
- Đã đối chiếu code + migrations. Chỗ lệch:
  - "(chưa code)" ở Google sync, nhắc nhở, `data-writes.md` — code đã có.
  - "Edge Functions: chưa dùng" — đã có `supabase/functions/send-bug-report` (gửi Gmail).
  - Sơ đồ DB thiếu: `todos`, `todo_exceptions`, `period_days`, `expense_categories`, `expenses`, `bug_reports`, `developer_emails`, `app_config`, cột chu kỳ trong `user_settings`.
  - Luồng user, đọc lịch, nhắc nhở chưa có todo, chu kỳ, chi tiêu, báo lỗi, màn "Cần cập nhật".
  - Test RLS chỉ ghi `rls_s1`, `rls_s2` — đã có thêm `rls_s4`, `rls_s4_colour`, `rls_s5`.
- **Sửa finding của tôi:** [overview](../docs/overview.md) mục 8 ghi nhắc "≤ 64" — code: tối đa **60** thông báo, trong **30 ngày** tới (`pickReminders.ts`).

## Plan

Chỉ sửa tài liệu, không đổi code. Giữ cách viết hiện tại (Mermaid, tiếng Việt, ngắn).

- [x] 1. `index.md`: dòng trạng thái → "theo code v5.0.1 (hết S5)", bỏ "(chưa code)"; sơ đồ tổng quan thêm Storage + Edge Function; bảng "API đến từ đâu" ghi Edge Function `send-bug-report` + đủ hàm SQL; thêm dòng file `bug-report.md`.
- [x] 2. `database.md`: sơ đồ ER thêm 8 bảng + cột chu kỳ ở `user_settings`; link chi tiết cột S4, S5 `db.md`; bảng nguyên tắc thêm todo (trạng thái xong theo từng lần lặp), giới hạn báo lỗi 5/ngày.
- [x] 3. `user-flow.md`: 4 tab thật (Lịch · Ghi chú · Chi tiêu · Cài đặt), nút + tạo Sự kiện / Todo / Ghi chú / Khoản chi, chu kỳ, báo lỗi, màn "Cần cập nhật".
- [x] 4. `calendar.md`: thêm tải todo + ngày kỳ kinh, link spec S5.
- [x] 5. `reminders.md`: bỏ "(chưa code)"; nguồn = event + todo chưa xong + nhắc kỳ kinh; tải trước rồi mới huỷ (mất mạng giữ nhắc cũ); số đúng code (30 ngày, ≤ 60).
- [x] 6. `google-sync.md`: bỏ "(chưa code)", soát từng bước với `features/google/` (pending, 410, lặp không biểu diễn được → event chỉ xem), sửa chỗ lệch.
- [x] 7. `data-writes.md`: bước xong = đẩy Google + đặt lại nhắc + làm mới cache (bỏ "chưa code").
- [x] 8. `conflicts.md`: thêm test `rls_s4`, `rls_s4_colour`, `rls_s5`. `traffic.md`: dung lượng DB dẫn sang [Spec tổng §3](../docs/specs/index.md#mục-tiêu-tải) (không chép số), thêm link test tải S4, S5.
- [x] 9. Tạo `bug-report.md`: sơ đồ gửi báo lỗi (insert → ảnh lên Storage → Edge Function gửi Gmail, gửi lại không trùng, 5/ngày).
- [x] 10. `docs/overview.md` + `.html`: sửa "≤ 64" → "≤ 60 trong 30 ngày tới"; bỏ mục "Lưu ý: tài liệu kiến trúc đã cũ", thay bằng link sang `specs/architecture/`.
- [x] 11. Kiểm tra: grep không còn "chưa code"; link đúng file; Mermaid đúng cú pháp (chạy `npx @mermaid-js/mermaid-cli` nếu có, không thì soát tay).
- [x] 12. Cập nhật file này + `wip/index.md` · commit `docs: update architecture to v5.0.1` + push.

Không làm: `errors.md` (S6 sẽ đổi cách xử lý lỗi, sửa cùng S6) · `supabase-plans.md` (không lệch code).

## Kết quả
- 2026-10-14 — Bước 1–4: `index.md` (trạng thái v5.0.1, Storage + Edge Function, hàm SQL, link overview + bug-report), `database.md` (+8 bảng, cột chu kỳ, 5 nguyên tắc), `user-flow.md` (vẽ lại 4 tab, màn Cần cập nhật), `calendar.md` (todo, kỳ kinh, ±1 ngày, prefetch).
- 2026-10-14 — Bước 5–8: `reminders.md` (viết lại: nguồn event + todo chưa xong + kỳ kinh, tải trước rồi huỷ, 30 + 7 ngày, ≤ 60) · `google-sync.md` (bỏ "chưa code"; **sửa lệch:** code không gọi `session_active()` trước khi đồng bộ — RLS chặn; thêm 429 chờ tối đa 4 lần, 404/410 insert lại, 403 giữ bản Google, pushPending, năm mới kéo lại, xoá ẩn trước) · `data-writes.md` (onSuccess 3 việc, upsert) · `conflicts.md` (+3 test RLS) · `traffic.md` (dung lượng dẫn sang Spec tổng §3, test tải S4/S5, index todos/expenses).
- 2026-10-14 — Bước 9: tạo [bug-report.md](../docs/specs/architecture/bug-report.md) (sơ đồ tuần tự + 5 quy tắc).
- 2026-10-14 — Bước 10: overview md + html: nhắc "≤ 60 trong 30 ngày tới"; **sửa thêm:** thứ tự đúng là tải dữ liệu → chọn mốc → huỷ → đặt lại (trước ghi huỷ trước); mục "tài liệu kiến trúc đã cũ" → "Đọc thêm" trỏ sang `specs/architecture/`.
- 2026-10-14 — Bước 11: không còn "chưa code" · link nội bộ đúng file · dựng 18 sơ đồ Mermaid bằng `@mermaid-js/mermaid-cli` 11.4.2: 17 OK, 1 lỗi (`;` trong `bug-report.md`) → sửa → OK · sơ đồ tổng quan `index.md` rối (đường Gmail cắt OAuth) → gom nhóm Google, bỏ nút Gmail (Gmail đã có ở `bug-report.md` + bảng) · chụp overview.html phần nhắc đúng.
- 2026-10-14 — Bước 12: commit `docs: update architecture to v5.0.1` + push.
