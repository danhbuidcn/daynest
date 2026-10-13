# 2026-10-12 — S4 bước 8: Cuối sprint, release — ⏳ chờ duyệt

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · [Spec tổng §4 Cuối sprint](../docs/specs/index.md#cuối-sprint-mọi-sprint).

## Input

- DoD S4 đạt → release.

## Plan

- [ ] 1. Tick DoD trong `sprint-4/index.md` (kiểm từng dòng trên máy thật).
- [x] 2. Version trong `app/app.config.ts`: `versionCode` 5 → 6 · `version` 3.0.1 → `4.0.0` (bạn chốt 2026-10-13; đổi sớm ở bước 2 để bản thử không trùng tên 3.0.1).
- [ ] 3. Đưa migration 2 (`s4_any_colour`, từ `supabase/pending/` vào `migrations/`) → `supabase/db migrate` → `min_version_code` = 6, bản cũ hiện "Cần cập nhật". Làm **sau** khi APK mới đã sẵn sàng (bước 4 build trước, migrate ngay trước khi phát hành).
- [ ] 4. `cd app && npm run release` → cài đè máy thật (`adb install -r`) → vẫn đăng nhập · test luồng chính + Chi tiêu + màu bất kỳ + đồng bộ Google. Màu bất kỳ (dồn từ [bước 2](2026-10-12-s4-step-2-any-color.md) việc 7): event + danh mục note màu đậm, màu nhạt lưu được, hiện đúng, chữ đọc được · sửa "chỉ lần này" sang màu hex · event màu hex lên Google thành màu gần nhất, kéo về vẫn giữ hex.
- [ ] 5. Commit `chore(release): v<version>` → tag + push tag → `gh release create` kèm APK → `gh release view` có `.apk`.

## Kết quả
