# 2026-10-15 — S6 bước 15: Cuối sprint — release v6.0.0 — ✅ xong (v6.0.0, bạn thử trên máy thật rồi ok)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · [Spec tổng §4 Cuối sprint](../docs/specs/index.md) · bước trước: [bước 14](2026-10-15-s6-step-14-load-test.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau bước 14).

## Hiện trạng

- Code S6 xong ở bước 1–14. App đang `version 5.0.1`, `versionCode 8`. Lộ trình đã chốt **v6.0.0, versionCode 9**.
- Migration `s6_budget_recurring_appearance` **đã có trên DB thật** (bước 1, `supabase/db status` khớp) → không cần `migrate` nữa. Migration chỉ thêm, không đổi `min_version_code`.
- Việc cần **bạn làm trên máy thật** (tôi không làm được): thử rung, độ mượt Lịch Tháng, mất mạng / máy bay, 2 máy cùng ngân sách + khoản chi lặp, ảnh nền.

## Plan

- [x] 1. Tick DoD trong `docs/specs/sprint-6/index.md` các mục tôi đã thử trên máy ảo / test; mục cần máy thật để trống cho bước 5.
- [x] 2. `app/app.config.ts`: `version` 6.0.0, `versionCode` 9.
- [x] 3. `npm run typecheck && npm run lint && npm test` → `npm run release` → `app/dist/daynest-6.0.0-9.apk` (chỉ APK).
- [x] 4. `adb install -r` lên máy thật (R5CX924PQ1V) → mở app, kiểm vẫn đăng nhập.
- [x] 5. **Bạn thử** theo DoD S6 (danh sách mục còn trống) → báo kết quả; tôi sửa nếu có lỗi (build lại, cài lại).
- [x] 6. Bạn ok → tick nốt DoD · commit `chore(release): v6.0.0` · `git tag v6.0.0 && git push origin main v6.0.0`.
- [x] 7. `gh release create v6.0.0 app/dist/daynest-6.0.0-9.apk --title v6.0.0 --notes "<tóm tắt S6>"` → `gh release view v6.0.0` thấy `.apk`.
- [x] 8. Cập nhật `wip/index.md`, lộ trình S6 (tick bước 15), Spec tổng §2 (S6 hoàn thành).

## Cần bạn quyết

- Phiên bản: quy tắc chung là +MINOR (sẽ ra 5.1.0), nhưng lộ trình đã ghi **6.0.0** vì S6 đổi nhiều (giao diện, 3 tính năng). Giữ 6.0.0?

## Kết quả

- v6.0.0 (versionCode 9): `typecheck`, `lint` (0 lỗi), 271 test qua · `npm run release` → `daynest-6.0.0-9.apk` · cài đè máy thật OK · bạn thử và `ok` · commit, tag `v6.0.0`, GitHub Release kèm APK.
