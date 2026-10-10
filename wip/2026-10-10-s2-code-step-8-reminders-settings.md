# 2026-10-10 — S2 code bước 8: Nhắc nhở + Cài đặt Thông báo, Lịch (F3, F6) — ✅ xong

## Input

- Lộ trình: [bước 7 xong](2026-10-10-s2-code-step-7-week-day-list.md). Bước 8: nhắc nhở + Cài đặt Thông báo + Lịch — xem [lộ trình](2026-10-09-s2-code-roadmap-step-3-lunar-month.md).
- Spec: [F3-reminders.md](../docs/specs/sprint-2/F3-reminders.md), [F6-settings.md](../docs/specs/sprint-2/F6-settings.md), [screens.md](../docs/specs/sprint-2/design/screens.md) màn 9, 11, 11b, 21, [mockups.html](../docs/specs/sprint-2/design/mockups.html).
- DB đã có (bước 4): `user_settings.notifications_enabled`, `show_lunar`, `show_holidays`, `time_zone`; `events.reminder_minutes`, `event_exceptions.reminder_minutes`.
- Form event đã có mục nhắc (công tắc, mốc, sheet chọn mốc) từ bước 6; thiếu icon `!` (màn 11b) và chú thích "Thông báo đang tắt trong Cài đặt".
- Theo yêu cầu trước: không viết test mới, kiểm tra trực tiếp trên emulator `pwvault-test`.
- Bạn yêu cầu thêm trong lúc làm:
  - Màn 3 (Ngày): "kéo xuống để đồng bộ là như nào?" → chức năng có trong spec F1/F4 (bước 10), chỉ bỏ dòng chữ gợi ý trên mockup.
  - Màn 4 (Danh sách): bỏ nút `+` trên ngày đang chọn.
  - Màn 3 (Ngày): bấm 1 khung giờ → mở form event (màn 9, giữ nguyên form) điền sẵn ngày + giờ; bấm dòng "Cả ngày" → form, Cả ngày bật.

## Output

- Event có nhắc → thông báo trên máy đúng giờ, kể cả khi app đóng; bấm → mở Chi tiết đúng lần lặp.
- Cài đặt có nhóm Thông báo và Lịch (Tuần bắt đầu từ, Múi giờ, Định dạng 24 giờ, Hiện ngày âm, Hiện ngày lễ), đổi là áp dụng ngay, lưu DB, lỗi thì trả về giá trị cũ + toast.
- Nhóm Google Calendar để bước 10.

## Plan

- [x] 1. Thư viện `expo-notifications` (+ plugin trong `app.config.ts`).
- [x] 2. Cài đặt: `UserSettings` thêm `notificationsEnabled`, `showLunar`, `showHolidays`; `authService.saveSettings(patch)`; `AuthProvider.saveSettings` đổi ngay, lỗi → trả về cũ.
- [x] 3. `lib/timezones/`: danh sách IANA cố định, tên VI/EN, nhãn "Tên (GMT±h)", lọc theo ô tìm.
- [x] 4. Màn Cài đặt (màn 21): tách `features/settings/` — nhóm Thông báo (công tắc + cảnh báo bị chặn + Mở cài đặt máy), nhóm Lịch (hộp chọn tuần, hộp chọn múi giờ có tìm kiếm, 3 công tắc).
- [x] 5. Lịch theo cài đặt: tắt ngày âm → ẩn số âm (tháng, tuần, danh sách, ngày); tắt ngày lễ → ẩn lễ.
- [x] 6. `lib/notifications/pickReminders.ts` (thuần): lần lặp + mốc → `{thời điểm, eventId, ngày lần lặp}`, cả ngày tính từ 9:00, 30 ngày tới, tối đa 60, bỏ mốc đã qua.
- [x] 7. `lib/notifications/` + `features/reminders/`: kênh "Nhắc sự kiện" (mức cao), xin quyền, huỷ hết → đặt mới; đặt lại khi mở app / về foreground, lưu/xoá event, đổi công tắc, đăng nhập; đăng xuất → huỷ hết. Bấm thông báo → Chi tiết event.
- [x] 8. Form event: icon `!` → hộp mẹo tối ưu pin (Để sau · Loại trừ → mở cài đặt pin Android); chú thích "Thông báo đang tắt trong Cài đặt"; lần đầu lưu event có nhắc mà chưa có quyền → xin quyền.
- [x] 9. i18n EN + VI. Mockup: thêm hộp chọn múi giờ.
- [x] 10. `npm run typecheck && npm run lint && npm test` · emulator: nhắc khi app đóng, bấm mở Chi tiết, tắt công tắc → không nhắc, từ chối quyền → cảnh báo, đổi các mục Lịch.
- [x] 11. Commit `feat(app): reminders and notification, calendar settings`, push. Không release.

## Kết quả

- Code mới: `lib/notifications/` (`pickReminders` thuần, `scheduler` bọc expo-notifications), `lib/timezones/`, `features/reminders/` (đặt lại thông báo, bấm thông báo, quyền, hộp mẹo pin), `features/settings/` (nhóm Thông báo, nhóm Lịch, hộp chọn múi giờ có tìm kiếm). `dayInfo.ts` thêm `DayDisplay` (ẩn ngày âm / ngày lễ).
- Màn Ngày: bấm giờ trống / dòng Cả ngày → form điền sẵn (`event/edit?date&hour` / `&allDay=1`). Danh sách: bỏ `+`. Mockup: 3b, 3c (form điền sẵn), 21d (chọn múi giờ); cập nhật `F1-calendar.md`, `screens.md`.
- Sửa lỗi tìm thấy khi thử: Android lưu cache câu trả lời GET của Supabase → mở lại app đọc cài đặt cũ (và có thể đọc event cũ). Thêm header `Cache-Control: no-cache` cho mọi request (`lib/supabase.ts`).
- Thử trên emulator (Android 14, build debug ký khoá release, Metro): bấm giờ 22:00 → form 22:00–23:00 · `!` → hộp mẹo pin → Loại trừ mở màn tối ưu pin · lưu event có nhắc lần đầu → hỏi quyền · thông báo đến đúng 21:00 (nhắc "1 giờ trước") cả khi đã tắt hẳn app; nội dung "Test nha · 22:00 – 23:00" · bấm thông báo (app tắt hẳn và app chạy nền) → mở Chi tiết đúng lần · Cài đặt: Thông báo + Lịch giống mockup, tìm "nhat" → Nhật Bản, tắt Hiện ngày âm → lịch ẩn ngày âm, mở lại app vẫn giữ · thu hồi quyền → dòng cảnh báo + Mở cài đặt máy, không đặt thông báo nào. Chưa thử riêng việc tắt công tắc Cho phép thông báo (dùng chung đường huỷ hết như khi thu hồi quyền). Event thử đã xoá.
- Hạn chế: Android 14 không cho exact alarm mặc định → thông báo có thể trễ vài phút (spec chấp nhận). Icon nhỏ của thông báo dùng `android-icon-monochrome.png`, hiện khá nhỏ — nên làm icon riêng cho thông báo sau.
- Một lần thử, bấm thông báo lại mở form "Sự kiện" ngày 29/10 07:00; thử lại 2 lần (app tắt hẳn / chạy nền) đều mở đúng Chi tiết, không tái hiện được — có thể do thao tác bấm nhầm của mình lúc trước.
- Kiểm tra: typecheck ok · lint 0 lỗi (3 cảnh báo có từ trước) · test 122/122.

## Việc tiếp

- Bước 9: Notes (F5) — xem [lộ trình](2026-10-09-s2-code-roadmap-step-3-lunar-month.md). `/clear` rồi mở `wip/index.md` để tiếp.
