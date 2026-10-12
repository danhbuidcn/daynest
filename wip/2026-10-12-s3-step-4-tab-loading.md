# 2026-10-12 — S3 bước 4: bấm tab mượt + loading trong nội dung — ✅ đã duyệt, chưa làm

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

- [ ] 1. `useEventsInRange`: giữ dữ liệu cũ khi đổi khoảng ngày (`placeholderData: keepPreviousData` của React Query) → lưới không nhấp nháy trống, event mới thay vào khi về.
- [ ] 2. Lịch: chưa có dữ liệu lần nào (lần đầu mở, mạng chậm) → vòng loading nhỏ ở đầu phần nội dung (dưới thanh chế độ xem), không che lưới, không chặn tab bar. Đang tải lại có dữ liệu cũ → không hiện vòng loading.
- [ ] 3. `npm run typecheck && npm run lint && npm test`.
- [ ] 4. Thử trên máy: bấm qua lại 4 tab + đổi tháng → vẫn đổi ngay. Mạng chậm: tôi tắt Wi-Fi để máy dùng 4G (`adb shell svc wifi disable`, xong bật lại) → thấy vòng loading lần đầu, đổi tháng giữ dữ liệu cũ. _Nếu bạn không muốn tôi tắt Wi-Fi trên máy, bạn tự thử bước này._
- [ ] 5. Commit `fix(app): calendar keeps old events and shows loading while fetching` + push.

## Kết quả

- 2026-10-12 11:30 — Bạn duyệt plan, cho phép tôi tắt/bật Wi-Fi trên máy để thử mạng chậm (bước 4).
