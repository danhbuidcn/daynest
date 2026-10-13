# 2026-10-12 — S4 bước 8: Cuối sprint, release — ✅ xong (máy thật: bạn tự thử sau khi cài)

Thuộc: [S4 lộ trình code](2026-10-12-s4-code-plan.md) · spec [S4](../docs/specs/sprint-4/index.md) · [Spec tổng §4 Cuối sprint](../docs/specs/index.md#cuối-sprint-mọi-sprint).

## Input

- DoD S4 đạt → release.

## Plan

- [x] ~~1. Tick DoD trong `sprint-4/index.md` (kiểm từng dòng trên máy thật).~~ → thay bằng việc 7
- [x] 2. Version trong `app/app.config.ts`: `versionCode` 5 → 6 · `version` 3.0.1 → `4.0.0` (bạn chốt 2026-10-13; đổi sớm ở bước 2 để bản thử không trùng tên 3.0.1).
- [x] 3. Đưa migration 2 (`s4_any_colour`, từ `supabase/pending/` vào `migrations/`) → `supabase/db migrate` → `min_version_code` = 6, bản cũ hiện "Cần cập nhật". Làm **sau** khi APK mới đã sẵn sàng (bước 4 build trước, migrate ngay trước khi phát hành).
- [x] ~~4. `cd app && npm run release` → cài đè máy thật (`adb install -r`) → vẫn đăng nhập · test luồng chính + Chi tiêu + màu bất kỳ + đồng bộ Google. Màu bất kỳ (dồn từ [bước 2](2026-10-12-s4-step-2-any-color.md) việc 7): event + danh mục note màu đậm, màu nhạt lưu được, hiện đúng, chữ đọc được · sửa "chỉ lần này" sang màu hex · event màu hex lên Google thành màu gần nhất, kéo về vẫn giữ hex.~~ → build + máy ảo xong (4a, 4b), máy thật bỏ theo đổi plan
- [x] ~~5. Commit `chore(release): v<version>` → tag + push tag → `gh release create` kèm APK → `gh release view` có `.apk`.~~ → thay bằng việc 8

## Đổi plan (2026-10-13, bạn chốt): bỏ cài máy thật qua USB — bạn tự tải APK từ GitHub Release về cài

- [x] 6. `supabase/db migrate` lên DB thật (2 migration: index + màu bất kỳ → `min_version_code` = 6). Kiểm `supabase/db status` sạch.
- [x] 7. DoD trong `sprint-4/index.md`: tick dòng đã thử trên máy ảo; dòng cần máy thật ghi "bạn tự thử sau khi cài".
- [x] 8. Commit `chore(release): v4.0.0` (gồm chuyển migration, `pending/README.md`, wip) + push → tag `v4.0.0` + push tag → `gh release create v4.0.0 app/dist/daynest-4.0.0-6.apk` → `gh release view` có `.apk`.
- [x] 9. Cập nhật file này + `wip/index.md` → ✅ xong.

## Kết quả

- 2026-10-13 — Việc 3 (phần local): `pending/20261012102237_s4_any_colour.sql` → `migrations/20261013044500_s4_any_colour.sql` (đổi timestamp vì đã có migration index `20261013042021` mới hơn) · `rls_s4_colour.sql` → `tests/` · xoá dòng trong `pending/README.md` · `supabase/db test`: 4 file, 72 test qua. Chưa `db migrate` (đợi APK).
- 2026-10-13 — Việc 4a: `npm run release` OK (11 phút) → `app/dist/daynest-4.0.0-6.apk` + `.aab`.
- 2026-10-13 — Việc 4b: máy ảo `Pixel_5_API_34` (`adb install -r`), vẫn đăng nhập. Đã thử (chưa migrate, nên chưa thử màu hex): tab Chi tiêu trống giống màn 4 · form thêm giống màn 7 (con trỏ sẵn, bàn phím số, "Ăn uống", "Hôm nay, T3 13/10/2026") · gõ 1250000 → "1.250.000" · Lưu → Tháng: tổng 1.250.000 ₫, cột hôm nay đậm, trục 1/5/…/25/31, 6 tháng Th10 đậm, "1,3tr" · Tuần: T2…CN, T3 đậm · bấm cột T3 → Ngày "Thứ Ba, 13/10" · bấm dòng → "Sửa khoản chi" (Xoá trên Lưu) · Xoá → hộp "Xoá khoản chi này?" → về tab, toast "Đã xoá", ngày trống lại · màn Nhóm chi tiêu giống màn 10 · hộp Thêm nhóm giống màn 11 (lưới 6 cột vừa khung). Khoản chi thử đã xoá, không lưu nhóm.
- Còn lại (cần máy thật + `db migrate`): màu hex (event, danh mục note, nhóm chi tiêu, "chỉ lần này", Google), sửa trên 2 máy → hộp xung đột, bấm Lưu 2 lần, xoá nhóm → khoản chi mất theo, bản cũ hiện "Cần cập nhật".

- 2026-10-13 — Việc 6: `supabase/db migrate` lên DB thật: `20261013042021_s4_expense_categories_user_idx` + `20261013044500_s4_any_colour` · `db status`: 7/7 local = remote.
- 2026-10-13 — Việc 7: DoD tick 7/10 · `typecheck` qua · `lint` 0 lỗi (3 cảnh báo cũ) · `npm test` 22 bộ / 162 test qua. 3 dòng chưa tick (thêm/sửa/xoá + xung đột 2 máy, xoá nhóm, màu hex + Google + "Cần cập nhật") ghi "bạn tự thử sau khi cài v4.0.0".
- 2026-10-13 — Việc 8: commit `ce9811f chore(release): v4.0.0` + push · tag `v4.0.0` + push · GitHub Release https://github.com/danhbuidcn/daynest/releases/tag/v4.0.0 có `daynest-4.0.0-6.apk` (109 MB).
