# 2026-10-10 — S2 code bước 6: Event (F2) — ✅ xong

## Input

- Lộ trình: [bước 5 xong](2026-10-10-s2-code-step-5-device-limit.md). Bước 6: hàm lặp dương + âm + ngoại lệ, form, chi tiết, pop-up ngày, pop-up `+`, thanh event trên lưới tháng.
- Spec: [F2-event.md](../docs/specs/sprint-2/F2-event.md), [F1-calendar.md](../docs/specs/sprint-2/F1-calendar.md), [db.md](../docs/specs/sprint-2/design/db.md), [screens.md](../docs/specs/sprint-2/design/screens.md) màn 7–15, [mockups.html](../docs/specs/sprint-2/design/mockups.html).
- Bạn yêu cầu thêm trong lúc test:
  - "Pop-up ngày … tôi muốn pop up lớn hơn" → hộp cách mép 12, cao tối đa 85%.
  - "Click vào ngày nào đó ở lịch thì hiển thị icon cộng ở giữa. Click icon cộng đó mới hiển thị pop up. Nếu có event ở ngày thì hiển thị luôn pop up" (theo app lịch cài sẵn).
  - "Áp dụng các quy tắc pattern thiết kế code, chia nhỏ file nếu nội dung quá dài."

## Plan

- [x] 1. Thư viện `@tanstack/react-query`, `@react-native-community/datetimepicker` (+ plugin trong `app.config.ts`), `QueryClientProvider` trong `app/_layout.tsx`.
- [x] 2. `lib/recurrence/` — `expandRule` (none/daily/weekly/monthly/yearly/lunar_yearly) + `applyExceptions`; test đủ trường hợp biên F2.
- [x] 3. `lib/calendar/eventBars.ts` — tối đa 3 thanh, lễ xếp đầu, "+N" (test).
- [x] 4. `features/events/api.ts` — CRUD, `id` sinh ở app, khoá lạc quan `updated_at` → `ConflictError`, mã `42501` → `ForbiddenError` → `AuthProvider.recheckSession()` (nối nốt việc còn lại của bước 5). Test bằng mock Supabase.
- [x] 5. `features/events/useEvents.ts` (TanStack Query) + `occurrences.ts` (trải lần lặp, dịch giờ theo múi giờ, áp ngoại lệ) + test.
- [x] 6. Ô tháng hiện thanh event + lễ (`EventBar`); ô trống đang chọn hiện `+` giữa ô.
- [x] 7. Pop-up ngày (cỡ lớn) + pop-up `+` nối FAB (Ghi chú → toast "Đang phát triển").
- [x] 8. Form `app/event/edit.tsx` + `RepeatPicker` + `ReminderPicker` + picker ngày/giờ hệ điều hành + màu.
- [x] 9. Chi tiết `app/event/[id].tsx` + menu `⋯` + hỏi "Chỉ lần này / Tất cả" + hộp xung đột.
- [x] 10. i18n EN + VI (thêm `lunar.stems/branches` cho can chi, `common.cancel/done/am/pm`).
- [x] 11. Tách file theo quy ước layout: logic thuần `eventFormState.ts`, `format.ts` (có test); hook `useEventFormSave`, `useEventDelete`; UI con `form/FormRow|DateTimeRows|ReminderSection|ColorPicker`; `components/ActionMenu|PopupHeader|BottomSheet` tách khỏi `Dialog.tsx`. `edit.tsx` 524 → 153 dòng.
- [x] 12. Cập nhật spec + mockup: F1 (luồng bấm ô, cỡ pop-up), screens.md màn 7, sprint-2/index.md luồng tổng, mockups.html (màn 7a mới + màn 7 cỡ lớn).
- [x] 13. `npm run typecheck && npm run lint && npm test` → xanh (105/105 test, lint chỉ còn 3 cảnh báo i18n có từ trước).
- [x] 14. Build release (keystore thật) cài emulator, test tay: chọn ô trống → `+` → pop-up → tạo event có giờ, màu → thanh hiện trên ô · ô có event → pop-up mở ngay · Chi tiết (ngày âm + can chi, nhắc) · Sửa → lặp "Năm (âm lịch)" (gợi ý 1/9 âm đúng) → lần 2027 rơi đúng 30/9/2027 (1/9 Đinh Mùi) · xoá "Chỉ lần này" lần 2027 → 2027 trống, 2026 vẫn còn · ngày lễ 20/10 hiện thanh đỏ.
- [x] 15. Commit + push. Không release.

## Lỗi tìm thấy khi test (đã sửa)

- Mốc nhắc mặc định 15 phút không có chữ (hiện `events.reminderOptions.15`) — thêm key + test locale kiểm mọi mốc đều có tên.
- Thiếu toast "Đã lưu" sau khi lưu (spec F2) — đã thêm; "Tải bản mới" ở hộp xung đột không báo "Đã lưu".
- Lưu lỗi (mạng…) trước đây đóng form — sai spec "Lưu lỗi → toast, giữ form"; giờ toast + giữ form.
- Lỗi "kết thúc trước bắt đầu" dùng chữ "giờ" cả với event cả ngày — đổi thành "Phải kết thúc sau khi bắt đầu."

## Việc còn lại

- Test hộp "Đã thay đổi ở thiết bị khác" và ghi bị từ chối (42501) trên **2 máy thật** — làm ở DoD cuối sprint (không sửa DB thật bằng tay theo `supabase/README.md`); logic đã có unit test.
- Xem Tuần / Ngày / Danh sách → bước 7. Đặt nhắc hệ điều hành + mẹo pin → bước 8. Ghi chú → bước 9. Google → bước 10.
- Bản debug không đăng nhập Google được (khác SHA-1) → test bằng bản release, build lại chỉ `./gradlew assembleRelease` (~30 s).
