# 2026-10-09 — Bỏ màn Sửa tài khoản (không sửa tên, ảnh) — ✅ xong

**Bạn chốt:** xoá màn Sửa tài khoản; không cho sửa tên, ảnh → tiết kiệm Storage Supabase.

**Đề xuất (cần bạn ok):** tên + ảnh luôn lấy từ Google. Ai đã sửa trước đây → **trả về tên + ảnh Google** (lấy từ `auth.users.raw_user_meta_data`). Không có ảnh Google → ảnh mặc định chữ cái đầu (có sẵn).

**Plan:**

- [x] 1. App:
  - xoá `src/app/settings/account.tsx` + route trong `_layout.tsx`;
  - Cài đặt: thẻ tài khoản chỉ hiển thị (bỏ icon bút, không bấm được);
  - xoá code sửa hồ sơ + tải ảnh (`authService`, `profile.ts`), `validateName.ts` + test, chữ i18n `account.*` (EN + VI);
  - gỡ `expo-image-picker`, `expo-image-manipulator` (chỉ màn này dùng).
- [x] 2. DB — migration mới `supabase/db new drop_profile_edit`:
  - bỏ quyền + policy update `profiles`;
  - bỏ policy Storage `avatars`;
  - trả `display_name`, `avatar_url` về giá trị Google cho mọi user.
  - Xoá file + bucket `avatars`: qua Storage API (Supabase chặn xoá file Storage bằng SQL) — chạy CLI `supabase storage rm` trên project, kiểm tra bucket trống rồi xoá bucket. Nếu CLI không xoá được bucket → nhờ bạn xoá trên Dashboard (1 thao tác).
  - `supabase/tests/rls_s1.sql`: bỏ test ảnh; thêm test "user không update được `profiles`". Chạy `supabase/db test`.
- [x] 3. Docs:
  - S1 `F2-google-sign-in.md` mục "Sửa tài khoản", `screens.md` màn 10, `db.md` Storage `avatars`, `F3` → ghi "Đã bỏ (2026-10-09)", giữ lại để truy vết;
  - S2: `db.md` + `F7` bỏ nhắc `avatars`; `screens.md` bỏ dòng "Tên hiển thị"; Spec tổng §3 bỏ dòng Storage avatar trong "Mục tiêu tải".
  - `supabase/README.md`, `config.toml`: bỏ phần avatars nếu có.
- [x] 4. Kiểm tra: `npm run typecheck && npm run lint && npm test`; `supabase/db test`; emulator: Cài đặt hiện tên + ảnh Google, bấm thẻ không mở gì.
- [x] 5. `supabase/db migrate` lên project thật (bạn ok ở đây là ok bước này) · commit `feat: remove profile editing`, push. Ra máy người dùng ở bản `1.1.0`.
- Kết quả: typecheck ok, lint 0 lỗi, test 2/2 (bỏ test validateName + avatar), `supabase/db test` 11/11. Project thật: đã xoá 1 file ảnh + bucket `avatars` (CLI `storage rm -r`), migration `20261009102301_drop_profile_edit` đã chạy. Emulator: Cài đặt hiện tên + ảnh Google, thẻ không bấm được. DB local vẫn còn bucket rỗng do migration S1 tạo (Supabase chặn xoá bucket bằng SQL) — không ảnh hưởng.
