# 2026-10-12 — S3: Lịch phản hồi dưới 500 ms — ✅ xong

Thuộc: [S3 lộ trình](2026-10-12-s3-plan.md) · spec [S3 mục 2](../docs/specs/sprint-3/index.md) · chặn [bước 7 release](2026-10-12-s3-step-7-release-3-0-0.md).

## Input

- Bạn (2026-10-12 12:10): màn Lịch và nội dung tháng… vẫn lag. Yêu cầu: **độ trễ < 500 ms**; API chậm thì hiện loading trong phần nội dung. Đo và test lại.

## Investigation

### Finding

1. `todayIn`, `timeOfDayIn`, `tzOffsetMinutesAt` ([timeZone.ts](../app/src/lib/calendar/timeZone.ts)) tạo **mới** `Intl.DateTimeFormat` mỗi lần gọi. Trên Hermes (máy JS của app Android) tạo `Intl.DateTimeFormat` tốn cỡ 0,1–1 ms/lần.
2. Chế độ Tháng gọi các hàm này rất nhiều: mỗi ô (42 ô) chạy `occurrencesOnDay` → lọc **toàn bộ** event trong tháng, mỗi event gọi `todayIn` ×2 + `timeOfDayIn` ×1. Tháng 10 có ~20 lần event → ~42 × 20 × 3 ≈ **2.500 lần tạo Intl mỗi lần vẽ** → ước 0,3–2,5 s.
3. Các phép tính trên chạy lại ở **mọi** lần vẽ lại màn Lịch, không chỉ khi đổi tháng:
   - `useEventsInRange` tính `occurrences` mới mỗi lần vẽ (không `useMemo`) → `barsForDay` đổi → cả 42 ô tính lại.
   - Bấm 1 ngày (`onPressDay`) gọi thêm `barsForDay` + vẽ lại toàn màn → khớp với lúc thử bước 6: bấm ngày có event, pop-up mở sau ~1 s.
4. Lần đo trước (≤ 170 ms) chỉ đo tab Ghi chú/Cài đặt và đổi sang tháng 11 — tháng **không có event**, nên không lộ lỗi này.

### Evidence

- Code: [timeZone.ts](../app/src/lib/calendar/timeZone.ts) dòng 6–38 · [dayOccurrences.ts](../app/src/features/calendar/dayOccurrences.ts) `occurrenceRange` · [calendar.tsx](../app/src/app/(tabs)/calendar.tsx) `barsForDay`, `onPressDay` · [useEvents.ts](../app/src/features/events/useEvents.ts) `useEventsInRange`.
- Trên máy: pop-up ngày 12/10 mở sau ~1,2 s (ảnh chụp liên tục 2026-10-12 11:43).
- Chưa đo được thời gian từng thao tác (máy mất kết nối USB lúc 12:05) → đo ở bước 1 trước khi sửa.

### Conclusion

Chưa đủ số đo để kết luận chắc. Nguyên nhân rất có thể: tạo `Intl.DateTimeFormat` hàng nghìn lần trên mỗi lần vẽ. API không phải nguyên nhân chính (lưới vẽ lại chậm cả khi dữ liệu đã có).

## Plan

- [x] 1. **Đo trước khi sửa** (bản release đang cài): bật "Hiển thị thao tác chạm" (`settings put system show_touches 1`, xong tắt lại) + quay màn hình (`adb shell screenrecord`), tách khung hình bằng `ffmpeg` tải bản tĩnh vào scratchpad (không cài vào máy tính). Độ trễ = từ khung có chấm chạm → khung nội dung đổi xong. Đo 5 lần mỗi thao tác:
  - a. Từ tab khác bấm sang tab Lịch.
  - b. Tháng: bấm `>` sang tháng sau (tháng có event), `<` về.
  - c. Đổi chế độ Tháng → Danh sách → Tuần → Ngày.
  - d. Bấm 1 ngày có event → pop-up hiện.
  - e. Vuốt đổi tháng.
- [x] 2. Sửa (chỉ chỗ đo thấy chậm, sửa ít nhất):
  - a. `timeZone.ts`: giữ lại `Intl.DateTimeFormat` theo từng múi giờ (cache trong `Map`), không tạo mới mỗi lần.
  - b. `useEventsInRange`: `useMemo` cho `occurrences` (chỉ tính lại khi dữ liệu, khoảng ngày, múi giờ đổi).
  - c. ~~Nếu sau a + b vẫn > 500 ms~~ không cần (đo sau a + b đã < 500 ms): chia event theo ngày **1 lần** cho cả tháng (thay vì mỗi ô lọc lại toàn bộ) — hàm thuần ở `app/src/features/calendar/dayOccurrences.ts` + test Jest.
- [x] 3. Test Jest: kết quả `todayIn` / `timeOfDayIn` không đổi khi dùng cache (2 múi giờ khác nhau) · `typecheck && lint && test`.
- [x] 4. Build release, cài máy, **đo lại** đúng 5 thao tác ở bước 1 → mọi thao tác < 500 ms (ghi bảng trước/sau). Mạng chậm (tắt Wi-Fi, xong bật lại): tab và tháng đổi ngay, loading hiện trong phần nội dung.
- [x] 5. Commit `perf(app): calendar reuses time-zone formatters and memoizes occurrences` + push.
- [ ] 6. Quay lại bước 7 release: bản build 3.0.0 đang chạy nền sẽ bỏ, build lại sau khi sửa.

## Kết quả
- 2026-10-12 12:20 — Bạn duyệt plan.
- 2026-10-12 13:40 — Máy chưa kết nối USB (`lsusb` không thấy Samsung) → chưa đo được bước 1. Làm trước phần sửa 2a + 2b (đo xong mới quyết 2c):
  - `timeZone.ts`: `formatter(kind, timeZone, options)` giữ `Intl.DateTimeFormat` trong `Map`, 3 hàm `todayIn` / `timeOfDayIn` / `tzOffsetMinutesAt` dùng lại. Không còn `new Intl.DateTimeFormat` nào khác trong `src/`.
  - `useEventsInRange`: `occurrences` bọc `useMemo([data, from, to, timeZone])`.
  - Test mới "cached formatters" (2 múi giờ xen kẽ). typecheck + lint (0 lỗi) + test 127/127 qua.
  - Bản build 3.0.0-4 cũ đã chuyển ra scratchpad (bỏ). `ffmpeg` bản tĩnh đang tải vào scratchpad (mạng chậm).
- 2026-10-12 14:00 — Bước 1 xong (bản đang cài 2.0.0-3, Wi-Fi). Bạn báo thêm: tab Lịch và Ghi chú chậm, tab khác ổn.
  - Cách đo (đổi so với plan): `screenrecord` **không ghi chấm chạm** → mỗi lần quay chạm 1 thao tác mốc (tab Cài đặt, nhanh), các thao tác sau cách đúng 2–2,5 s trong cùng 1 lệnh shell trên máy. Độ trễ = lúc màn đổi − (lúc mốc đổi + khoảng cách). Mốc kiểm: Cài đặt → Thống kê ≈ 100 ms. Sai số ≈ ±50 ms. Script: `measure`/`chain2.sh` trong scratchpad, `ffmpeg` bản tĩnh.
  - Kết quả **trước khi sửa** (thời gian tới khung màn đổi):

| Thao tác | Trước |
| --- | --- |
| Tab Lịch (từ tab khác, Lịch đã mở sẵn) | 0,15–0,3 s · **1,2–1,5 s** khi Lịch vừa có dữ liệu mới |
| Tháng sau `>` (tháng 11, không event) | 0,12 s |
| Tháng trước `<` (tháng 10, có event) | **1,5 s** |
| Vuốt đổi tháng | **1,7–2,1 s** |
| Bấm ngày → pop-up | **1,85 s** |
| Đóng pop-up (Back) | **1,9 s** |
| Chế độ Tháng | **1,9 s** |
| Chế độ Tuần / Ngày / Danh sách | 0,36 / 0,36 / 0,24 s |
| Tab Ghi chú lần đầu sau khi mở app | 0,06–**1,3 s** (1,3 s khi Lịch đang vẽ lại cùng lúc) |
| Tab Ghi chú lần sau | 0,1–0,24 s |

  - Kết luận: mọi chỗ chậm do **vẽ lại chế độ Tháng ≈ 1,5–1,9 s** (đúng nguyên nhân ở Investigation). Trong lúc đó máy JS bận → tab khác (Ghi chú) cũng phải chờ. Không phải do API: tháng không có event đổi trong 0,12 s.
- 2026-10-12 14:20 — Sửa đổi cách đo: lệnh `sleep` trên máy trôi ~80 ms mỗi bước → số đo cũ cộng dồn sai. Script giờ ghi `date +%s.%N` trên máy ngay trước mỗi lần chạm, mốc tính theo thời điểm thật (kiểm: tab nhanh đo ra ±50 ms). Đo lại "trước" bằng bản 3.0.0-4 build lúc 12:05 (code chưa sửa; máy không cho hạ về 2.0.0-3).
- 2026-10-12 14:20 — Bước 2 (a + b) + 4 xong. Kết quả trên máy (Wi-Fi, 2 lần đo mỗi bản, thời gian tới khung màn đổi xong):

| Thao tác | Trước | Sau |
| --- | --- | --- |
| Tab Lịch | 0,02 – **1,99 s** | ≤ 0,12 s |
| Tháng sau `>` (không event) | 0,02 s | ≤ 0,05 s |
| Tháng trước `<` (có event) | **1,46 – 1,49 s** | 0,08 – 0,25 s |
| Tab Ghi chú | **1,1 – 2,0 s** (chờ Lịch vẽ xong) | ≤ 0,17 s · lần đầu sau mở app ≤ 0,3 s |
| Bấm ngày → pop-up | **1,72 – 1,76 s** | 0,31 – 0,35 s |
| Đóng pop-up | **~2,0 s** | 0,27 – 0,28 s |
| Chế độ Tuần / Ngày | ≤ 0,05 s | ≤ 0,07 s |
| Chế độ Tháng | **1,46 s** | 0,06 – 0,09 s |
| Vuốt đổi tháng | **1,1 – 1,6 s** | 0,09 – 0,26 s |

  - Mạng chậm (4G, tắt Wi-Fi, **đã bật lại**): mở app → lưới tháng hiện ngay + vòng loading, event hiện sau ~0,6 s · tab Lịch / Ghi chú / đổi tháng / Tuần / Tháng đổi trong ≤ 0,22 s · Ghi chú: khung màn ngay, danh sách sau ~0,27 s.
  - Kết luận: mọi thao tác < 500 ms (cao nhất: mở pop-up ngày ~0,35 s). Không cần bước 2c.
  - "Hiển thị thao tác chạm" đã tắt lại (screenrecord không ghi chấm chạm nên không dùng).
- 2026-10-12 14:25 — Commit + push (bước 5).
