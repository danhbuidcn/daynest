# 2026-10-09 — Cho phép comment code có chọn lọc (tiếng Anh) — ✅ xong (chưa commit)

Đổi quy ước (bạn chốt): **được comment nhưng hạn chế**. Đề xuất tiêu chí: chỉ comment khi giải thích **vì sao** / điều không đọc code mà thấy được, hoặc chia mục trong SQL/script. Không comment lặp lại việc code đã nói. Comment viết tiếng Anh.

- [x] 1. Khôi phục (dịch sang tiếng Anh) các comment đạt tiêu chí:
  - `supabase/migrations/20261009000000_init.sql`: cả 9 comment (link spec, chia mục, lý do quyền/trigger/storage);
  - `supabase/tests/rls_s1.sql`: 4 comment (mục đích, cách chạy, 2 user giả, đóng vai user A);
  - `authService.ts`: mã lỗi `'7'` của Play Services + lỗi supabase-js không phải `Error`; lý do kiểm tra mạng trước khi gửi;
  - `_layout.tsx`: lý do ẩn cảnh báo InteractionManager; vuốt back trên cả Android/iOS;
  - `settings.tsx`: đổi ngôn ngữ ngay, lưu DB lỗi thì báo;
  - `withReleaseSigning.js`: cách keystore được truyền qua `DAYNEST_KEYSTORE_FILE`;
  - `release.sh`: dòng mô tả + SHA-1 là keystore đã đăng ký OAuth;
  - `app.config.ts`, `theme/index.ts`: link tới spec (`build.md`, `design-system.md`).
- [x] 2. **Không khôi phục:** JSDoc mô tả component/hàm (Avatar, Dialog, Toast…), `profile.ts`, `validateName.ts`, `i18n`, `lib/supabase.ts`, `index.tsx`, `eslint.config.js`, tiêu đề mục trong `.gitignore`, `.env.example` (đã sang README), `supabase/config.toml` (comment CLI tự sinh).
- [x] 3. Kiểm tra: typecheck, lint, `npm test`, `bash -n` 2 script, `supabase/db test`.
- [x] 4. Cập nhật Claude memory `code-english-no-comments` theo quy ước mới. Chưa commit.
