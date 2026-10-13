# 2026-10-13 — S5 bước 6: Chu kỳ — dữ liệu + màn — ✅ xong

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · spec [§ Chu kỳ kinh nguyệt](../docs/specs/sprint-5/index.md#chu-kỳ-kinh-nguyệt) · [db.md](../docs/specs/sprint-5/design/db.md#chu-kỳ--period_days-cột-trong-user_settings) · [mockup](../docs/specs/sprint-5/design/mockups.html) màn Kỳ kinh, Cài đặt.

## Input

- Hàm thuần `lib/cycle/`: gom ngày có kinh thành kỳ · độ dài chu kỳ (TB tối đa 6 kỳ gần nhất, bỏ khoảng < 15 hoặc > 60 ngày, chưa đủ 2 kỳ → số trong Cài đặt) · độ dài kỳ kinh (TB các kỳ đã ghi, chưa có → Cài đặt) · 3 kỳ dự đoán · quá ngày dự đoán → dời về hôm nay, "Trễ N ngày" · tick 1 ngày không sát kỳ nào → tự tick đủ độ dài kỳ, không vượt hôm nay.
- Dữ liệu: API `period_days` (tải 12 tháng gần nhất, lưu = xoá ngày bỏ tick + upsert ngày mới), hook cache như event, 6 cột chu kỳ trong `user_settings`.
- Cài đặt: nhóm "Chu kỳ kinh nguyệt" (sau nhóm Lịch): Theo dõi chu kỳ · Ghi ngày có kinh › · Độ dài chu kỳ 21–45 · Độ dài kỳ kinh 2–10 · Nhắc trước kỳ kinh (+ pop-up 1–7 ngày, giờ:phút bước 5) · chú thích "Dữ liệu chu kỳ chỉ bạn xem được."
- Màn **Kỳ kinh**: lịch cuộn dọc theo tháng, ô tròn tick, chỉ ≤ hôm nay, nút Lưu · bật lần đầu → mở luôn màn với "Chạm vào ngày bắt đầu kỳ kinh gần nhất".
- Chưa làm ở bước này: hiện trên Lịch và đặt nhắc (bước 7).

## Plan

- [x] 1. `lib/cycle/` (gom kỳ, độ dài, dự đoán, trễ, tự tick) + `__tests__/cycle.test.ts`.
- [x] 2. `features/cycle/`: kiểu, API `period_days`, hook cache · cột chu kỳ vào kiểu + API `user_settings`.
- [x] 3. Màn Kỳ kinh `app/src/app/settings/period.tsx` (+ i18n VI/EN).
- [x] 4. Cài đặt: nhóm Chu kỳ, hộp chọn độ dài, pop-up nhắc trước, bật lần đầu → màn Kỳ kinh.
- [x] 5. `npm run typecheck && npm run lint && npm test` → `npm run release` → cài và thử trực tiếp trên điện thoại đã kết nối (bật/tắt, ghi, bỏ ngày, tự tick, lưu, mở lại còn nguyên) · dọn dữ liệu thử · commit `feat(app): menstrual cycle data and period screen` + push.

## Kết quả
- 2026-10-13 — Bạn `ok`. Việc 1–4 xong: `lib/cycle/` (16 test) · `features/cycle/` (API `period_days`, hook) · màn `settings/period.tsx` · nhóm Cài đặt "Chu kỳ kinh nguyệt" (độ dài chu kỳ / kỳ kinh, pop-up nhắc trước) · 6 cột `user_settings` · icon `cycle`, `ruler`. Test 214/214 ✓.
- Việc 5: đã build APK và cài lên điện thoại (R5CX924PQ1V). Chờ bạn thử: bật Theo dõi chu kỳ (lần đầu mở màn Kỳ kinh) → tick ngày (tự tick 5 ngày) → Lưu → mở lại còn nguyên · đổi độ dài chu kỳ / kỳ kinh · pop-up nhắc trước · tắt công tắc ẩn các dòng. Sau đó tôi dọn dữ liệu thử và commit.
- Ghi nhận: `npm run typecheck` báo lỗi route kiểu cũ (`/todo/...`, `/settings/period`) vì file route tự sinh chưa cập nhật; `lint` còn 1 lỗi resolver `@tanstack/query-async-storage-persister` (có từ trước).
- 2026-10-13 — Bạn yêu cầu bỏ hết chú thích thừa (chu kỳ, thiết bị, danh mục, todo lặp, tự lưu): đã xoá chuỗi VI/EN + code. Build lại, cài lên R5CX924PQ1V, tôi thử trực tiếp: bật công tắc mở màn Kỳ kinh · tick 1 ngày tự tick 5 ngày · bỏ tick · Lưu, mở lại còn nguyên · đổi độ dài chu kỳ 28→30→28 · pop-up nhắc trước · tắt công tắc ẩn các dòng. Đã dọn dữ liệu thử. Test 214/214 ✓.
- Chưa làm (chờ bạn quyết): pop-up báo khi đạt giới hạn (danh mục, nhóm, thiết bị).
