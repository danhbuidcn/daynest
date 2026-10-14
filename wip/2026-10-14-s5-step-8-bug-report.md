# 2026-10-14 — S5 bước 8: Báo lỗi — 🔄 đang làm

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · spec [§ Báo lỗi](../docs/specs/sprint-5/index.md#báo-lỗi) · [db.md](../docs/specs/sprint-5/design/db.md#báo-lỗi) · [mockup](../docs/specs/sprint-5/design/mockups.html) màn Báo lỗi.

## Input

- Bạn: "bạn tự làm cho tôi" · tài khoản Gmail gửi = nhận = `danhbuidcn@gmail.com` (đã có trong `developer_emails`).
- DB, bucket, trigger 5/ngày đã có từ bước 1.

## Plan

- [x] 1. Thêm `expo-image-picker`, `expo-image-manipulator` (`npx expo install`).
- [x] 2. Hàm thuần `lib/bugReport/` (kiểm nội dung 10–2000 ký tự, cỡ ảnh thu nhỏ cạnh dài ≤ 1600) + test.
- [x] 3. `features/bugReport/`: chọn ảnh (≤ 3), thu nhỏ JPEG, insert báo cáo (id app sinh) → upload ảnh → gọi function · lỗi `rate_limited` → hộp "Đã gửi đủ 5 báo cáo hôm nay".
- [x] 4. Màn `settings/bug-report.tsx` + dòng "Báo lỗi" trong nhóm Ứng dụng · mất mạng khoá Gửi · i18n VI/EN.
- [x] 5. Edge Function `supabase/functions/send-bug-report/` (SMTP Gmail 465, ảnh đính kèm, lỗi mail vẫn 200) · lệnh `supabase/db functions` (đặt secret từ `supabase/.env` + deploy).
- [ ] 6. **Bạn**: tạo mật khẩu ứng dụng Gmail → dán vào `supabase/.env` dòng `GMAIL_APP_PASSWORD=` (tôi không đọc, không in ra).
- [ ] 7. Deploy function · typecheck/lint/test · build · máy ảo: gửi 1 báo cáo có ảnh → mail tới · commit `feat(app): bug report` + push.

## Kết quả
- 2026-10-14 — Bạn: "bạn tự làm cho tôi" → làm luôn. Việc 1–5 xong:
  - Thêm `expo-image-picker`, `expo-image-manipulator`.
  - `lib/bugReport/` + 4 test (223/223 ✓) · `features/bugReport/api.ts` · màn `settings/bug-report.tsx` · dòng "Báo lỗi" (icon bug) trong nhóm Ứng dụng · i18n VI/EN.
  - Edge Function `supabase/functions/send-bug-report/` (nodemailer, SMTP 465) đã deploy lên project thật. Chưa có mật khẩu Gmail → mail lỗi, báo cáo vẫn lưu (đúng spec).
  - `supabase/db functions`: đặt secret Gmail qua file tạm + deploy · README + `.env.example` thêm `GMAIL_USER`, `GMAIL_APP_PASSWORD`.
  - Sự cố: khi thêm `GMAIL_USER` vào `supabase/.env`, file thiếu xuống dòng cuối nên dính vào dòng `SUPABASE_DB_PASSWORD`; lệnh kiểm tra lỡ in 2 ký tự đầu mật khẩu DB ra chat. Đã tách dòng, `supabase/db status` vẫn kết nối được. Nên đổi mật khẩu DB nếu bạn muốn chắc chắn.
- 2026-10-14 09:28 — Build (8 phút 50 giây), cài máy ảo, thử: màn Báo lỗi đúng mockup · Gửi khoá khi nội dung < 10 ký tự · chọn 1 ảnh qua trình chọn ảnh của Android (không cần quyền) → thu nhỏ, hiện ô ảnh có ✕, "Ảnh (1/3)" · Gửi → quay lại Cài đặt. Mail chưa đi vì chưa có mật khẩu Gmail (function trả 200, đúng spec).
  - Chưa kiểm được dòng `bug_reports` + ảnh trên DB thật: hệ thống chặn tôi đọc DB thật. Báo cáo thử "Test bao loi tu may ao…" còn trên DB (app không xoá được).
- Còn lại: việc 6 (bạn dán mật khẩu ứng dụng) → `supabase/db functions` → gửi thử lại, xem mail tới.
