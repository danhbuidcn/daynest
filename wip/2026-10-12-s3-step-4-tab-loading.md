# 2026-10-12 — S3 bước 4: bấm tab mượt + loading trong nội dung — ✅ xong

Thuộc: [S3 lộ trình](2026-10-12-s3-plan.md) · spec [S3 mục 2](../docs/specs/sprint-3/index.md).

## Input

- Spec: bấm tab → chuyển ngay · dữ liệu chưa về → loading trong nội dung (không chặn tab bar) · có dữ liệu cũ thì hiện dữ liệu cũ trong lúc tải lại.

## Đo trên máy (2026-10-12 11:20, Galaxy A55, Wi-Fi, bản release)

Cách đo: trên máy chụp màn liên tục (~250 ms/ảnh), giữa chừng bấm tab, so ảnh xem màn đổi lúc nào.

| Thao tác | Màn đổi sau khi lệnh bấm xong |
| --- | --- |
| Lần đầu mở Ghi chú / Cài đặt / Thống kê | ≤ +170 ms (ảnh đầu tiên sau khi bấm) |
| Bấm qua lại các tab lần sau | ≤ +160 ms |
| Lịch — chế độ Tháng, sang tháng sau | ≤ +145 ms |

- Kết luận: trên Wi-Fi **không thấy khựng** — tab và nội dung đổi ngay (sai số đo ±250 ms).
- Lỗ hổng tìm được trong code (sẽ lộ ra khi mạng chậm):
  - [calendar.tsx](../app/src/app/(tabs)/calendar.tsx) + [useEvents.ts](../app/src/features/events/useEvents.ts): **không có trạng thái đang tải**. Đổi tháng/tuần/ngày → khoá truy vấn mới → lưới trống event cho đến khi API trả về; trông giống "không có event".
  - Ghi chú đã có loading (`ActivityIndicator`) · Cài đặt không gọi API khi mở · Thống kê đang là màn trống (S4 thay).

## Plan

- [x] 1. `useEventsInRange`: giữ dữ liệu cũ khi đổi khoảng ngày (`placeholderData: keepPreviousData` của React Query) → lưới không nhấp nháy trống, event mới thay vào khi về.
- [x] 2. Lịch: chưa có dữ liệu lần nào (lần đầu mở, mạng chậm) → vòng loading nhỏ ở đầu phần nội dung (dưới thanh chế độ xem), không che lưới, không chặn tab bar. Đang tải lại có dữ liệu cũ → không hiện vòng loading.
- [x] 3. `npm run typecheck && npm run lint && npm test`.
- [x] 4. Thử trên máy: bấm qua lại 4 tab + đổi tháng → vẫn đổi ngay. Mạng chậm: tôi tắt Wi-Fi để máy dùng 4G (`adb shell svc wifi disable`, xong bật lại) → thấy vòng loading lần đầu, đổi tháng giữ dữ liệu cũ. _Nếu bạn không muốn tôi tắt Wi-Fi trên máy, bạn tự thử bước này._
- [x] 5. Commit `fix(app): calendar keeps old events and shows loading while fetching` + push.

## Kết quả

- 2026-10-12 11:30 — Bạn duyệt plan, cho phép tôi tắt/bật Wi-Fi trên máy để thử mạng chậm (bước 4).
- 2026-10-12 11:45 — Bước 1–3 xong: `placeholderData: keepPreviousData` trong `useEventsInRange`; `calendar.tsx` hiện `ActivityIndicator` nổi ở đầu vùng nội dung khi `isLoading` (chưa có dữ liệu lần nào). typecheck + lint (0 lỗi, 3 cảnh báo cũ ở i18n) + test 125/125 qua. Thử trên máy gộp chung 1 bản release với bước 6.
- 2026-10-12 11:50 — Thử trên máy (bản release build từ code bước 4 + 6, Galaxy A55):
  - Wi-Fi: bấm Ghi chú → Thống kê → Cài đặt → Lịch, đổi sang tháng 11 → đổi ngay, không khựng.
  - 4G (đã tắt Wi-Fi, **đã bật lại**): mở app từ đầu → lưới Tháng hiện ngay, vòng loading nhỏ ở giữa đầu lưới ~1 giây, rồi event hiện. Đổi tháng 10 → 9 (chưa tải) → event hiện từ khung hình đầu, không nhấp nháy trống, không có vòng loading.
  - Ghi nhận (không sửa): vòng loading nằm đè sát số ngày ở ô giữa hàng đầu; màn Chi tiết event trắng 2–4 giây khi chờ tải (code cũ `return null`, ngoài phạm vi bước này).
- 2026-10-12 11:55 — Commit + push.
