# 2026-10-12 — App mượt hơn: lưu dữ liệu trên máy, tải trước, dùng lại cache — ✅ xong

Sau release [v3.0.0](2026-10-12-s3-step-7-release-3-0-0.md) · tiếp nối [độ trễ Lịch](2026-10-12-s3-calendar-latency.md).

## Input

- Bạn (2026-10-12 14:50): muốn app mượt hơn nữa → chọn A + B + C + D, "làm luôn bây giờ".
- Hiện trạng: `QueryClient` mặc định (`app/src/app/_layout.tsx`) → không lưu gì trên máy, dữ liệu hết "mới" ngay (`staleTime` 0) nên quay lại tháng/tab nào cũng tải lại.

## Plan

- [x] ~~1. Đo trước~~ (bỏ — bạn: "không cần đo", 2026-10-12 15:35) (bản 3.0.0 đang cài, Wi-Fi + 4G): (a) mở app từ đầu → tới lúc event tháng hiện · (b) mở app → tab Ghi chú → tới lúc danh sách hiện · (c) vuốt sang tháng **chưa tải** → tới lúc event hiện · (d) bấm event → màn Chi tiết hiện đủ.
- [x] 2. **A — lưu cache xuống máy**: thêm `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` (cùng bản `5.104.1` với react-query) · `PersistQueryClientProvider` với AsyncStorage, giữ tối đa 7 ngày, `buster` = version app (đổi bản → bỏ cache cũ) · không lưu note đang mở (`'one'`, vốn `gcTime: 0`).
  - Đăng xuất / bị đăng xuất (F7) → xoá cache trong bộ nhớ + trên máy (`queryClient.clear()` + xoá bản lưu) để người sau không thấy dữ liệu người trước.
  - Lưu ý: dữ liệu event/note nằm trong bộ nhớ app trên máy (không mã hoá, giống phiên đăng nhập Supabase hiện tại) — app khác không đọc được.
- [x] 3. **B — `staleTime` 2 phút** mặc định: đổi tháng/tab trong 2 phút không tải lại. Sau khi lưu/xoá vẫn tải lại ngay (đã `invalidateQueries`); kéo xuống / đồng bộ Google vẫn tải lại.
- [x] 4. **C — tải trước kỳ liền kề**: Lịch đang xem kỳ nào thì tải sẵn kỳ trước + sau (tháng/tuần) · dùng chung hàm tải với `useEventsInRange`.
- [x] 5. **D — dùng lại dữ liệu đã có**: `useEventsInRange` chưa có dữ liệu cho khoảng ngày → lấy tạm từ query đã tải **bao trùm** khoảng đó (vd. tháng chứa ngày đang xem) → màn Chi tiết event, form sửa, đổi Tháng → Tuần/Ngày hiện ngay. Hàm tìm khoảng bao trùm là hàm thuần + test Jest.
- [x] 6. `typecheck && lint && test`.
- [x] 6b. **E — mở app hiện cache ngay** (bạn, 2026-10-12 15:45: "mở app là phải nhìn thấy dữ liệu cache ngay, API gọi sau rồi thay"). Hiện tại màn chờ (splash) đợi **3 lần gọi API nối nhau** (`session_active` → `profiles` → `user_settings`, `AuthProvider.tsx`) rồi mới vẽ Lịch → cache có sẵn cũng phải chờ; mất mạng thì `getSession` trả `null` → về màn đăng nhập.
  - Lưu `profile` + `settings` vào AsyncStorage mỗi lần đọc/lưu được (xoá cùng lúc với cache khi đăng xuất / đăng nhập).
  - Mở app: có phiên trên máy + có bản lưu → vẽ app ngay bằng bản lưu; 3 lần gọi API chạy nền, xong thì thay `profile`/`settings` mới; `session_active` = false → đăng xuất + hộp "Bạn đã bị đăng xuất" như cũ (F7).
  - Chưa có bản lưu (lần đầu sau bản này) → chờ API như cũ.
  - Event/note: đã đúng kiểu này (hiện cache, quá 2 phút thì tải nền rồi thay) — không đổi.
- [x] 7. Build release, cài máy, **đo lại** a–d (bảng trước/sau) + thử: đăng xuất → đăng nhập lại không thấy dữ liệu cũ nhấp nháy sai · sửa event ở màn Chi tiết rồi quay lại Lịch thấy bản mới. Xoá dữ liệu thử.
- [x] 8. Commit `perf(app): persist query cache, prefetch adjacent periods, reuse cached events` + push. (Chưa release — gộp vào bản sau, trừ khi bạn muốn release ngay.)

## Kết quả

- 2026-10-12 14:52 — Bạn duyệt ("làm A + B + C + D luôn bây giờ").
- 2026-10-12 15:30 — Bước 2–6 xong:
  - Cache: `app/src/features/cache/queryClient.ts` — `staleTime` 2 phút, `gcTime` 7 ngày (phải ≥ thời gian giữ trên máy), lưu AsyncStorage khoá `daynest.queryCache`, `buster` = version app, bỏ note đang mở. `_layout.tsx` dùng `PersistQueryClientProvider`.
  - Xoá cache (bộ nhớ + máy) khi: đăng xuất, bị đăng xuất (F7), và lúc đăng nhập (phòng phiên cũ hết hạn mà không đăng xuất → cache người trước còn trên máy).
  - Tải trước: `usePrefetchEvents` trong `calendar.tsx`, chạy khi kỳ đang xem tải xong; chế độ Ngày tải tuần trước/sau.
  - Dùng lại: `useEventsInRange` lấy tạm dữ liệu của khoảng đã tải hẹp nhất bao trùm (`lib/calendar/coveringRange.ts` + test). Màn Chi tiết: dữ liệu tạm chưa có event → chờ, không hiện màn trống.
  - typecheck ✓ · lint 0 lỗi (3 cảnh báo cũ ở `i18n/index.ts`) · test 131/131 ✓.
- 2026-10-12 15:40 — Bạn duyệt bước 7–8 ("ok làm đi"). Đang build release (APK 3.0.0-4 cũ chuyển ra scratchpad để không bị ghi đè; bản đó đã có trên GitHub Release).
- 2026-10-12 15:50 — Bạn duyệt bước 6b (chấp nhận: máy bị đăng xuất từ xa thấy dữ liệu cũ ~1 s). Bản đang build (chưa có 6b) sẽ build lại.
- 2026-10-12 16:00 — Bước 6b xong: `features/auth/sessionSnapshot.ts` (khoá `daynest.session`) lưu profile + settings mỗi khi đổi; mở app có bản lưu → vẽ ngay, 3 lần gọi API chạy nền. `getSettings` giờ báo lỗi khi mất mạng (trừ "chưa có dòng" PGRST116) để không ghi đè cài đặt đã lưu bằng mặc định. typecheck ✓ · lint 0 lỗi · test 131/131 ✓. Build lại release.
- 2026-10-12 15:17 — Bước 7 xong (bản 3.0.0-4 build lại, cài đè trên Galaxy A55, không đo theo ý bạn):
  - Tắt hẳn mạng (máy bay + tắt Wi-Fi), đóng app rồi mở: sau 1,5 s Lịch hiện đủ event từ cache (bản cũ: về màn đăng nhập).
  - Tạo event "ZZCACHE" → Lịch hiện ngay · đóng/mở app → vẫn còn · mở Chi tiết: ảnh chụp lúc 0,6 s sau khi chạm đã hiện đủ (không đo độ trễ thật; 0,6 s là lúc chụp, gồm cả hiệu ứng trượt màn) · trước: trắng 2–4 s (theo ghi chép ở [S3 lộ trình](2026-10-12-s3-plan.md), hôm nay không đo lại) · Sửa → form có dữ liệu ngay · đổi tên "ZZCACHEX" → Lịch hiện tên mới · Xoá → Lịch bỏ ngay.
  - Đăng xuất → mở lại app: màn đăng nhập, không có dữ liệu cũ · đăng nhập lại (cùng tài khoản): Lịch tải bình thường.
  - Dữ liệu thử đã xoá (cả trên Google Calendar). Mạng đã bật lại.
  - APK 3.0.0-4 đã phát hành giữ ở scratchpad; `app/dist/daynest-3.0.0-4.apk` giờ là bản thử này (chưa release — gộp vào bản sau).
- 2026-10-12 15:20 — Commit + push (bước 8).
