# 2026-10-14 — S5 bước 10: Cuối sprint, release v5.0.0 — ✅ xong (nhắc tới đúng giờ: bạn tự xem)

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · spec [S5](../docs/specs/sprint-5/index.md) · [Spec tổng §4 Cuối sprint](../docs/specs/index.md#cuối-sprint-mọi-sprint).

## Input

- 9 bước S5 xong → release **v5.0.0** (versionCode 7).
- Như S4 (bạn chốt 2026-10-13): thử trên máy ảo `emulator-5554`, không cài máy thật qua USB — bạn tự tải APK từ GitHub Release về cài.

## Plan

- [x] 1. Spec tổng §3 dòng "Storage": "Không lưu file" → ảnh báo lỗi trong bucket `bug-reports` (≤ 3 ảnh × ~300 KB/báo cáo, ≤ 5 báo cáo/ngày/user) → vẫn đủ 1 GB.
- [x] 2. `npm run typecheck && npm run lint && npm test` qua.
- [x] 3. `supabase/db status`: mọi migration S5 đã lên DB thật (không có migration mới → không `db migrate`, không tăng `min_version_code`).
- [x] 4. `app/app.config.ts`: `version` 4.0.0 → `5.0.0`, `versionCode` 6 → `7`.
- [x] 5. `cd app && npm run release` → `app/dist/daynest-5.0.0-7.apk`.
- [x] 6. ~~Cài đè lên máy ảo~~ → điện thoại thật `R5CX924PQ1V` (bạn đổi 2026-10-14) (`adb install -r`): vẫn đăng nhập · thử luồng chính + Todo, danh sách todo, chu kỳ, báo lỗi (gửi 1 báo cáo thật → mail tới).
- [x] 7. Tick DoD trong `sprint-5/index.md`: dòng đã thử trên máy ảo; dòng cần máy thật (nhắc đúng giờ) ghi "bạn tự thử sau khi cài v5.0.0".
- [x] 8. Commit `chore(release): v5.0.0` + push → tag `v5.0.0` + push tag → `gh release create v5.0.0 app/dist/daynest-5.0.0-7.apk` → `gh release view` có `.apk`.
- [x] 9. Cập nhật file này, lộ trình S5, `wip/index.md` → ✅ xong.

## Kết quả
- 2026-10-14 — Bạn `ok`. Việc 1: Spec tổng §3 dòng Storage ghi bucket `bug-reports`.
- 2026-10-14 — Việc 2: lần đầu `typecheck` lỗi 3 chỗ (`/settings/bug-report`, `/settings/period`): file kiểu route `.expo/types/router.d.ts` (không commit) cũ từ 13/10, chưa có 2 màn mới → chạy `expo start` 1 lần để sinh lại → `typecheck` qua · `lint` 0 lỗi (3 cảnh báo cũ) · `npm test` 28 bộ / 223 test qua.
- 2026-10-14 — Việc 3: `db status` 8/8 local = remote → không migrate.
- 2026-10-14 — Việc 4: `version` 5.0.0, `versionCode` 7.
- 2026-10-14 10:47 — Việc 5: `npm run release` OK (10 phút 28 giây) → `app/dist/daynest-5.0.0-7.apk` (110 MB) + `.aab`.
- 2026-10-14 — Bạn đổi: tắt process ngầm, thử trên điện thoại. Đã tắt máy ảo, Supabase local, Gradle daemon (giữ container `b2b-dev-*` của project khác). Đã cài đè APK lên điện thoại `R5CX924PQ1V`: `versionName=5.0.0`, `versionCode=7`.
- 2026-10-14 11:07–11:26 — Việc 6 (bạn nhờ tôi tự thử, điều khiển điện thoại qua `adb`): mở app → màn Đăng nhập (máy bị đẩy ra theo F7 "tối đa 2 máy" do các lần đăng nhập máy ảo trước; đăng nhập lại 1 chạm, không phải lỗi v5).
  - Todo: đổi Todo ↔ Sự kiện giữ tiêu đề · 3 việc phụ thêm, sửa chữ, kéo đổi thứ tự (lưu đúng) · nhắc 15 phút trước · lặp hằng ngày → Lưu → thanh có ô tròn mọi ngày từ 14/10 · pop-up ngày tick → 3/3, chỉ lần đó gạch · chi tiết: tick đủ việc phụ → todo tự xong · sửa "Chỉ lần này" (lần 16: tiêu đề mới, bỏ 1 việc → 2/2), lần 17 vẫn gốc · Tuần, Ngày, Danh sách đúng, bỏ tick trên Tuần → 0/3 · xoá "Chỉ lần này" (17 trống) · xoá "Tất cả" → hết, nhắc todo huỷ hết.
  - Nhắc todo: báo thức 08:45 (09:00 − 15 phút) đúng các ngày chưa xong; lần đã xong không đặt. Báo thức có `window=+1h` → Android có thể nhắc trễ tới 1 giờ vì máy chưa cấp quyền "Báo thức chính xác" (dấu ! cạnh nhắc nhở).
  - Danh sách todo (tab Ghi chú): Hôm nay, Sắp tới 7 ngày, Quá hạn (6 lần, mới nhất trên), lần đã xong không hiện · tick dòng quá hạn → 5.
  - Chu kỳ: ghi 9/9 → tự tick 9–13/9 · Lưu → dự đoán dời về hôm nay 14–18/10 + "Trễ 5 ngày" (chu kỳ 30) · kỳ sau 13–17/11 · nhắc đặt 11/11 và 11/12 lúc 09:00 (trước 2 ngày) · tắt theo dõi → giọt mất, nhắc huỷ · bật lại giữ cài đặt. Chưa xem nhắc tới thật (phải đợi tới giờ).
  - Báo lỗi: nội dung + 3 ảnh thử 3000×2000 (đẩy vào máy, không dùng ảnh của bạn) → "Ảnh (3/3)" → Gửi → về Cài đặt · mail `[Daynest] Báo lỗi 5.0.0 (7)` tới 11:18, máy SM-A556E, Android 16, 3 ảnh đính kèm (~47 KB, đã thu nhỏ).
  - Lỗi S4 "1 note": EN → nhóm có 1 ghi chú hiện "1 note" · hộp xoá "Delete 1 category? / 1 note inside will also be deleted." Màu Google: đồng bộ đang tắt → theo test (bước 2).
  - Dọn: todo, nhóm + ghi chú thử (xoá hẳn khỏi thùng rác), 5 ngày kỳ kinh, 3 ảnh thử đã xoá · ngôn ngữ về Tiếng Việt · theo dõi chu kỳ vẫn bật như cũ.
- 2026-10-14 — Việc 7: DoD tick 6/8 dòng (chưa tick "Cuối sprint"). Dòng Chu kỳ chưa tick: còn "nhắc tới đúng giờ trên máy thật" — bạn tự xem. Dòng Todo ghi chú chưa thử Google (đồng bộ đang tắt).
- 2026-10-14 — Việc 8: commit `0fed3a4 chore(release): v5.0.0` + push · tag `v5.0.0` + push · GitHub Release https://github.com/danhbuidcn/daynest/releases/tag/v5.0.0 có `daynest-5.0.0-7.apk` (110 MB). Việc 9: cập nhật file này, lộ trình S5, `wip/index.md`.
