# 2026-10-10 — S2 code bước 5: giới hạn 2 thiết bị (F7) — ✅ xong

## Input

- Lộ trình: [bước 4 xong](2026-10-10-s2-code-step-4-migration.md) (migration `register_device`/`session_active`/...). Tiếp bước 5: đăng ký máy lúc đăng nhập, hộp bị đăng xuất, màn Thiết bị đăng nhập.
- Spec: [F7-device-limit.md](../docs/specs/sprint-2/F7-device-limit.md), [screens.md](../docs/specs/sprint-2/design/screens.md) (màn 23, 24, 25).

## Plan

- [x] 1. Thêm `expo-device`, `expo-crypto`. `features/auth/device.ts`: `getDeviceId()` (AsyncStorage, sinh 1 lần/cài), `getDeviceName()`.
- [x] 2. `authService.ts`: `signIn()` đăng ký máy ngay sau `signInWithIdToken` (trước khi đọc bảng nào — RLS giờ cần `session_active()`), trả kèm `kicked` · `checkSessionActive()`, `touchDevice()`, `listDevices()`, `hasLocalSession()` · `signOut()` gọi `unregister_device` trước.
- [x] 3. `AuthProvider`: mở app / về foreground → `checkSessionActive()` trước khi đọc bảng nào, false → tự đăng xuất + hiện hộp "Bạn đã bị đăng xuất" (màn 23, Đăng nhập). Đăng nhập xong, có máy bị đá → hộp "Đã đăng xuất thiết bị cũ" (màn 24, Tab Lịch).
- [x] 4. `AlertDialog` (1 nút) trong `Dialog.tsx` · icon `devices`/`phone` trong `Icon.tsx`.
- [x] 5. Màn `settings/devices` (route mới, đăng ký trong `_layout.tsx`): danh sách máy, tên + "Đăng nhập dd/mm/yyyy · Dùng lần cuối ...", nhãn "Thiết bị đang dùng", chú thích giới hạn. Cài đặt → dòng "Thiết bị đăng nhập" (giá trị N/2).
- [x] 6. `lib/relativeDate.ts` (thuần, có test): hôm nay/hôm qua/ngày tuyệt đối cho "Dùng lần cuối".
- [x] 7. i18n EN + VI: `settings.devices`, `devices.*`, `kickedDialog.*`, `newDeviceDialog.*`.
- [x] 8. `npm run typecheck && npm run lint && npm test` → xanh (58/58 test).
- [x] 9. Build bản release (keystore thật, cần đúng SHA-1 cho Google Sign-In) cài lên emulator `pwvault-test`, test thật: đăng nhập, Cài đặt hiện 1/2, màn Thiết bị đăng nhập đúng dữ liệu, background/foreground giữ phiên, đăng xuất → đăng nhập lại (cùng máy) không tạo trùng dòng (vẫn 1/2), hộp "Bạn đã bị đăng xuất" hiện đúng khi phiên không active.

## Lỗi tìm thấy khi test (đều đã sửa)

- **DB (`register_device`)**: dùng `offset 2` để tìm máy cũ nhất — sai, trả về máy *mới nhất* trong 3 máy. Sửa: đếm số máy, nếu > 2 thì lấy máy `signed_in_at` nhỏ nhất. Phát hiện nhờ viết test (`rls_s2.sql`) trước khi tin.
- **App (`authService.signIn`)**: gọi `loadProfile()` (đọc bảng `profiles`) trước khi gọi đăng ký máy → bị RLS chặn (`session_active()` chưa có dòng `user_devices`) → "Đăng nhập không thành công". Sửa: đăng ký máy ngay sau `signInWithIdToken`, trước mọi lần đọc bảng khác.
- **App (`AuthProvider` lúc mở app)**: gọi `getSession()` (đọc `profiles`, bị RLS chặn nếu máy bị đá) *trước khi* gọi `checkSessionActive()` để biết lý do → máy bị đá chỉ thấy `profile = null`, không bao giờ thấy hộp "Bạn đã bị đăng xuất". Sửa: thêm `hasLocalSession()` (chỉ đọc JWT cục bộ, không qua RLS) để kiểm tra có phiên trước, rồi mới `checkSessionActive()`, rồi mới đọc `profiles`.
- Cả 2 lỗi app chỉ lộ ra khi build thật + bấm tay trên emulator — test tự động (pgTAP, Jest) không bắt được vì không mô phỏng đúng thứ tự gọi API thật.

## Việc còn lại

- Dòng "Ghi bị từ chối (42501) → cũng hỏi lại session" (F7) chưa gắn được — chưa có luồng ghi dữ liệu nào (events/notes) để test; nối khi làm các bước đó.
