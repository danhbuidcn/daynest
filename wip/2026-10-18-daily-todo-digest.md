# 2026-10-18 — Nhắc todo đầu ngày và cuối ngày — ✅ xong (thử trên máy thật, build v7.0.0 / versionCode 12)

## Input

- Bạn (2026-10-18): đầu ngày có thông báo "hôm nay bạn có X việc", cuối ngày "hôm nay bạn đã hoàn thành X việc"; giờ tự chỉnh; bấm vào thì mở danh sách todo.
- Đã duyệt: sáng mặc định 08:00, tối 21:00, mỗi giờ có công tắc riêng; không có việc thì không gửi; việc xong hết thì tối ghi "cả Y việc"; không thêm chữ giải thích trên màn hình.
- Tôi chọn: mặc định tắt cả hai (không tự bật thông báo mới cho người dùng cũ); thông báo sáng đặt cho 7 ngày tới (giới hạn số thông báo chờ của hệ điều hành), thông báo tối chỉ đặt cho hôm nay (số đã xong chỉ biết lúc app đặt lại thông báo).

## Plan

- [x] Migration thêm 4 cột vào `user_settings` (`daily_morning`, `daily_morning_time`, `daily_evening`, `daily_evening_time`) + grant update; `supabase/db migrate`.
- [x] `authService`: 4 trường mới trong `UserSettings`, đọc/ghi.
- [x] `lib/notifications/dailyDigest.ts`: logic thuần (đếm việc theo ngày, tạo nội dung).
- [x] `reminderSync.ts`: đặt thông báo sáng/tối từ danh sách todo; `useReminderSync` truyền cấu hình.
- [x] Bấm thông báo → mở tab Ghi chú, chế độ Todo, ngày hôm nay.
- [x] Cài đặt: 2 dòng "Nhắc đầu ngày" / "Nhắc cuối ngày" (công tắc + chọn giờ), i18n VI + EN.
- [x] `npm run typecheck && npm run lint && npm test`.
- [x] Thử trên máy thật (Samsung): đặt giờ gần, thấy thông báo, bấm mở đúng màn.

## Kết quả

- Đã `supabase/db migrate` (4 cột, mặc định tắt). `typecheck`, `lint`, `npm test` (270) đạt. Không viết thêm Jest test (theo yêu cầu của bạn).
- Build `app/dist/daynest-7.0.0-12.apk/.aab`, cài lên máy thật `R5CX924PQ1V`. Sáng 11:45 → thông báo "Hôm nay bạn có 7 việc" + 3 tên việc đầu; bấm vào mở Ghi chú › Todo hôm nay ("2/7 xong"). Tối 11:50 → "Hôm nay bạn đã hoàn thành 2/7 việc" (ngày nay chưa tick thêm).
- Máy Samsung trì hoãn báo thức ~2 phút (thông báo sáng 11:45 hiện lúc 11:47); tối đúng giờ. Đã đưa giờ về 08:00 / 21:00 và để cả hai công tắc bật.
- Giới hạn: thông báo tối chỉ đặt khi app đặt lại thông báo trong ngày (mở app, thêm/sửa/tick todo); ngày không mở app thì không có thông báo tối.
