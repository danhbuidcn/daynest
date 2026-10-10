# 2026-10-09 — S2 code: lộ trình + bước 3 (lịch âm, ngày lễ, lưới tháng) — ✅ bước 3 xong

## Lộ trình code S2 (mỗi bước 1 todo riêng, chạy được trên máy sau mỗi bước)

| Bước | Nội dung | Spec |
| --- | --- | --- |
| **3** | Lịch âm + ngày lễ + lưới tháng (chưa có event) | F1 |
| 4 | Migration S2: mọi bảng mới, RLS + `session_active`, hàm thiết bị, test RLS | db.md |
| 5 | Giới hạn 2 thiết bị (đăng ký máy, hộp bị đăng xuất, màn Thiết bị đăng nhập) | F7 |
| 6 | Event: hàm lặp (dương + âm) + ngoại lệ, form, chi tiết, pop-up ngày, pop-up `+`, thanh event trên lưới tháng | F2 |
| 7 | Xem tuần / ngày / danh sách | F1 |
| 8 | Nhắc nhở + Cài đặt Thông báo + Lịch | F3, F6 |
| 9 | Notes: danh sách, editor, checklist, danh mục, tìm kiếm, thùng rác | F5 |
| 10 | Đồng bộ Google 2 chiều | F4 |
| 11 | Test tải 100 user, rà chữ dài, DoD → release `1.1.0` | index |

## Bước 3 — Input

- Spec: [F1](../docs/specs/sprint-2/F1-calendar.md) (lịch âm, ngày lễ, xem tháng), mockup màn 1, 6.
- App hiện: tab Lịch là màn trống; `user_settings.week_start` đã có từ S1 (chưa đọc lên app).

## Bước 3 — Output

- Tab Lịch hiện lưới tháng đúng ngày âm + ngày lễ, đổi tháng được, trên máy thật.

## Bước 3 — Plan

- [x] 1. `src/lib/lunar/`: `toLunar`, `toSolar`, `lunarMonthLength`, `canChiYear` — thuật toán Hồ Ngọc Đức, múi giờ +7, năm 1900–2100, hàm thuần.
- [x] 2. `src/lib/holidays/`: danh sách lễ dương + âm trong F1 (tên EN + VI), `holidaysOn(date)`.
- [x] 3. `src/lib/calendar/monthGrid.ts`: 42 ngày của tháng theo tuần bắt đầu Thứ 2 / CN.
- [x] 4. Test (Jest): Tết 2020–2030 đúng ngày; tháng nhuận 2020 (4), 2023 (2), 2025 (6); đổi dương ↔ âm khớp nhau mọi ngày 1900–2100; lễ âm 2024–2027; Giao thừa tháng Chạp thiếu/đủ; lưới tháng 2 năm nhuận, tuần bắt đầu T2/CN.
- [x] 5. Màn Lịch — Tháng (`(tabs)/calendar.tsx` + `src/features/calendar/`): header `‹ Tháng 10, 2026 ›` + chip Hôm nay · thanh chọn chế độ (chỉ Tháng chạy; Tuần/Ngày/Danh sách → toast "Đang phát triển" tới bước 7) · hàng thứ · lưới 6×7 (số dương, ngày âm, mùng 1/rằm kèm tháng, tên lễ, hôm nay, CN/lễ màu `error`, ngày tháng khác mờ) · vuốt trái/phải đổi tháng · bấm tiêu đề → hộp chọn tháng/năm (màn 6) · bấm ô → chọn ngày (pop-up ngày làm ở bước 6).
- [x] 6. Đọc `week_start` từ `user_settings` khi đăng nhập (cùng chỗ đọc `language`); chưa có cài đặt hiện ngày âm/lễ (bước 8) → luôn hiện. "Hôm nay" tính theo múi giờ `Asia/Ho_Chi_Minh` (cột `time_zone` có ở bước 4 → khi đó đọc từ DB).
- [x] 7. i18n EN + VI cho chữ mới (tên tháng, thứ, tên lễ, Hôm nay…).
- [x] 8. Kiểm tra: `npm run typecheck && npm run lint && npm test`; emulator: tháng 10/2026 khớp mockup màn 1 (ngày âm, 20/10 lễ), vuốt qua tháng 2/2026 thấy Tết 17/2, đổi ngôn ngữ EN ↔ VI.
- [x] 9. Commit `feat(app): lunar month calendar`, push. Không release.

## Bàn giao (2026-10-10, session bị clear giữa chừng)

Đã viết, **chưa commit** (xem `git status`):

- `lib/calendar/timeZone.ts` `todayIn(tz)` — mặc định `Asia/Ho_Chi_Minh`, có test `timeZone.test.ts`. Bỏ `today()` khỏi `monthGrid.ts`.
- `features/auth`: `getLanguage` → `getSettings()` đọc `language, week_start`; `AuthProvider` có `settings.weekStart` (đăng xuất → về mặc định).
- `features/calendar/`: `dayInfo.ts` (+ test), `CalendarHeader`, `ViewModeBar`, `MonthView` (+ `WeekdayRow`), `MonthYearPicker`. `Dialog.tsx` export `DialogShell`.
- `(tabs)/calendar.tsx`: header · thanh chế độ (khác Tháng → toast "Đang phát triển") · lưới tháng · vuốt đổi tháng · bấm tiêu đề → chọn tháng/năm · bấm ô ngày tháng khác → chuyển tháng.
- Locales EN + VI: `calendar.*`, `holidays.*` (21 lễ).

Lần chạy cuối: typecheck ok · lint 1 lỗi (setState trong effect ở `MonthYearPicker`) · test 52/53 (dynamic import trong `holidays.test.ts`). **Đã sửa cả 2 nhưng chưa chạy lại.**

Việc tiếp:

- [x] `npm run typecheck && npm run lint && npm test` → xanh (2026-10-10: typecheck ok, lint 0 lỗi (3 cảnh báo i18n có từ trước), test 53/53).
- [x] Bản release build tại chỗ (không ghi đè `dist/`) đã cài lên emulator `pwvault-test` (AVD `Pixel_5_API_34` không còn). Emulator chưa có tài khoản Google → chờ người dùng đăng nhập trên emulator.
- [x] Mục 8: emulator (`pwvault-test`) — tháng 10/2026 khớp mockup màn 1 (ngày âm, 20/10 "Phụ nữ Việt Nam", khoanh hôm nay 10/10) · vuốt/chọn tháng tới 2/2026 thấy Tết đúng 17/2 (+ Giao thừa 16/2, mùng 1–3) · đổi ngôn ngữ VI ↔ EN (menu, tháng, thứ, tên lễ đổi đúng) · hộp chọn tháng/năm hoạt động đúng. Đã sửa: debug log tạm thêm lúc dò lỗi input-timing (tap quá sớm lúc app mới mở làm 1-2 lần test nhận nhầm sự kiện chạm) — đã gỡ, không phải lỗi code thật.
- [x] Mục 9: commit `feat(app): lunar month calendar`, push. Không release.
