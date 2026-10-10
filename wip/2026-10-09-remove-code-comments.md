# 2026-10-09 — Xoá comment code, code toàn tiếng Anh — ✅ xong (chưa commit)

Quy ước mới (bạn chốt): code không comment, mọi chỗ ngoài docs dùng tiếng Anh. Docs giữ tiếng Việt (sau này làm thêm bản tiếng Anh).

**Phạm vi:** `app/`, `supabase/`, `.gitignore`. **Không đụng:** `docs/`, `wip/`, `playbook/` (tài liệu tham khảo), các `README.md` / `AGENTS.md` (là docs), `app/src/locales/vi.json` (bản dịch UI), nhãn `'Tiếng Việt'` trong `i18n/index.ts` (tên ngôn ngữ hiển thị cho user).

- [x] 1. Xoá mọi comment trong ~30 file code: `.ts/.tsx/.js/.sh/.sql`, `supabase/db`, `.gitignore`, `.env.example`, `supabase/config.toml` (~220 dòng comment do Supabase CLI sinh). Giữ shebang `#!`.
- [x] 2. Comment trong 2 file `.env.example` đang là hướng dẫn lấy key → chuyển nội dung sang `app/README.md` / `supabase/README.md` (tiếng Việt) nếu README chưa có, để không mất thông tin.
- [x] 3. Dịch sang tiếng Anh các chuỗi tiếng Việt còn lại trong code:
  - lỗi/log: `withReleaseSigning.js`, `scripts/release.sh`, `supabase/db`, `lib/supabase.ts`;
  - tên test: `__tests__/*.test.ts` (3 file), `supabase/tests/rls_s1.sql`.
- [x] 4. Kiểm tra: `grep` không còn comment + không còn chữ tiếng Việt ngoài phạm vi loại trừ; `npm run lint`, `npx tsc --noEmit`, `npm test` trong `app/`; `bash -n` 2 script.
- [x] 5. Lưu quy ước vào Claude memory (để session sau tuân theo). Chưa commit — chờ bạn bảo.
