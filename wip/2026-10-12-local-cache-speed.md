# 2026-10-12 — App mượt hơn: lưu dữ liệu trên máy, tải trước, dùng lại cache — ✅ đã duyệt

## Handoff (2026-10-12 14:55)

- Đang ở: plan đã duyệt, **chưa làm bước nào** (chưa sửa code, chưa cài thư viện). Bắt đầu từ bước 1 (đo trước) trên bản 3.0.0 đang cài trên máy.
- Thư viện cần: `@tanstack/react-query-persist-client@5.104.1`, `@tanstack/query-async-storage-persister@5.104.1` (khớp `@tanstack/react-query` 5.104.1 đang dùng).
- Chỗ sửa: `app/src/app/_layout.tsx` (`QueryClient`) · `app/src/features/auth/AuthProvider.tsx` (`signOut`, `forceSignOut` → xoá cache) · `app/src/features/events/useEvents.ts` (`useEventsInRange`) · `app/src/app/(tabs)/calendar.tsx` + `features/calendar/calendarNav.ts` (`shiftCursor`, `periodRange` cho tải trước) · `app/src/app/event/[id].tsx`, `event/edit.tsx` (hưởng lợi từ bước 5).
- Đo trên máy: cách đo + script ở [todo độ trễ](2026-10-12-s3-calendar-latency.md#kết-quả) (quay màn hình, mốc chạm tab Cài đặt, ghi `date +%s.%N` trên máy trước mỗi lần chạm). Script ở scratchpad phiên cũ sẽ mất → viết lại theo mô tả đó; `ffmpeg` bản tĩnh tải từ johnvansickle.com vào scratchpad.
- Điện thoại: xem Handoff ở [S3 lộ trình](2026-10-12-s3-plan.md) (Galaxy A55, adb `~/Android/Sdk/platform-tools/adb`, chạy ngoài sandbox, có cuộc gọi thì dừng, xoá dữ liệu thử; vòng lặp chạm tự động phải chụp màn kiểm từng bước — lần trước chạm lệch khi danh sách ngắn lại).

Sau release [v3.0.0](2026-10-12-s3-step-7-release-3-0-0.md) · tiếp nối [độ trễ Lịch](2026-10-12-s3-calendar-latency.md).

## Input

- Bạn (2026-10-12 14:50): muốn app mượt hơn nữa → chọn A + B + C + D, "làm luôn bây giờ".
- Hiện trạng: `QueryClient` mặc định (`app/src/app/_layout.tsx`) → không lưu gì trên máy, dữ liệu hết "mới" ngay (`staleTime` 0) nên quay lại tháng/tab nào cũng tải lại.

## Plan

- [ ] 1. Đo trước (bản 3.0.0 đang cài, Wi-Fi + 4G): (a) mở app từ đầu → tới lúc event tháng hiện · (b) mở app → tab Ghi chú → tới lúc danh sách hiện · (c) vuốt sang tháng **chưa tải** → tới lúc event hiện · (d) bấm event → màn Chi tiết hiện đủ.
- [ ] 2. **A — lưu cache xuống máy**: thêm `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` (cùng bản `5.104.1` với react-query) · `PersistQueryClientProvider` với AsyncStorage, giữ tối đa 7 ngày, `buster` = version app (đổi bản → bỏ cache cũ) · không lưu note đang mở (`'one'`, vốn `gcTime: 0`).
  - Đăng xuất / bị đăng xuất (F7) → xoá cache trong bộ nhớ + trên máy (`queryClient.clear()` + xoá bản lưu) để người sau không thấy dữ liệu người trước.
  - Lưu ý: dữ liệu event/note nằm trong bộ nhớ app trên máy (không mã hoá, giống phiên đăng nhập Supabase hiện tại) — app khác không đọc được.
- [ ] 3. **B — `staleTime` 2 phút** mặc định: đổi tháng/tab trong 2 phút không tải lại. Sau khi lưu/xoá vẫn tải lại ngay (đã `invalidateQueries`); kéo xuống / đồng bộ Google vẫn tải lại.
- [ ] 4. **C — tải trước kỳ liền kề**: Lịch đang xem kỳ nào thì tải sẵn kỳ trước + sau (tháng/tuần) · dùng chung hàm tải với `useEventsInRange`.
- [ ] 5. **D — dùng lại dữ liệu đã có**: `useEventsInRange` chưa có dữ liệu cho khoảng ngày → lấy tạm từ query đã tải **bao trùm** khoảng đó (vd. tháng chứa ngày đang xem) → màn Chi tiết event, form sửa, đổi Tháng → Tuần/Ngày hiện ngay. Hàm tìm khoảng bao trùm là hàm thuần + test Jest.
- [ ] 6. `typecheck && lint && test`.
- [ ] 7. Build release, cài máy, **đo lại** a–d (bảng trước/sau) + thử: đăng xuất → đăng nhập lại không thấy dữ liệu cũ nhấp nháy sai · sửa event ở màn Chi tiết rồi quay lại Lịch thấy bản mới. Xoá dữ liệu thử.
- [ ] 8. Commit `perf(app): persist query cache, prefetch adjacent periods, reuse cached events` + push. (Chưa release — gộp vào bản sau, trừ khi bạn muốn release ngay.)

## Kết quả

- 2026-10-12 14:52 — Bạn duyệt ("làm A + B + C + D luôn bây giờ").
