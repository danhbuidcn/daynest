# 2026-10-13 — S4: thử v4.0.0 trên máy thật — ✅ xong (3 dòng DoD đạt · 2 finding chờ bạn quyết)

Thuộc: [S4 bước 8](2026-10-12-s4-step-8-release.md) · DoD [S4](../docs/specs/sprint-4/index.md) (3 dòng chưa tick).

## Input

- Máy thật `R5CX924PQ1V` đã cắm USB, đang chạy v3.0.1 (versionCode 5).
- DB thật đã có `min_version_code` = 6.

## Plan

- [x] 1. Mở app v3.0.1 trên máy thật → chụp màn hình → kiểm hiện "Cần cập nhật".
- [x] 2. `adb install -r app/dist/daynest-4.0.0-6.apk` (cài đè, giữ đăng nhập) → mở app.
- [x] 3. Mình tự thử bằng adb (bạn chốt 2026-10-13 13:30), dữ liệu thử đặt tên "Test S4", xoá hết khi xong:
  - Thêm, sửa, xoá khoản chi · bấm Lưu 2 lần → không trùng · sửa cùng lúc máy thật + máy ảo → hộp "Đã thay đổi ở thiết bị khác".
  - 3 nhóm có sẵn (đổi ngôn ngữ thấy tên đổi) · thêm, đổi tên, xoá nhóm → khoản chi trong nhóm mất theo.
  - Màu bất kỳ: event, danh mục note, nhóm chi tiêu · hiện đúng ở Lịch, Ghi chú, Chi tiêu · chữ đọc được · event màu hex lên Google thành màu gần nhất.
- [x] 4. Tick 3 dòng DoD trong `sprint-4/index.md` (dòng lỗi → ghi lỗi, không tick) · cập nhật file này + `wip/index.md` · commit `docs:` + push.

## Kết quả

- 2026-10-13 13:24 — Bước 1: v3.0.1 hiện "Cần cập nhật · Phiên bản này đã cũ. Vui lòng cài phiên bản mới nhất để tiếp tục." ✅
- 2026-10-13 13:24 — Bước 2: `adb install -r` OK → versionName 4.0.0, mở vào Lịch, vẫn đăng nhập. ✅
- 2026-10-13 13:33 — Bước 3: thêm nhóm "Test S4" màu `#1E3A8A` qua "Màu khác" → icon trắng trên nền xanh đậm, đọc được · thêm khoản chi 50.000 ₫, bấm Lưu 2 lần cách 80 ms → tab Ngày chỉ 1 dòng, tổng 50.000 ₫, thanh nhóm màu hex đúng. ✅
- 2026-10-13 13:36 — Bước 3: sửa cùng lúc (máy ảo lưu 60.000 trước, máy thật lưu 70.000 sau) → máy thật hiện "Đã thay đổi ở thiết bị khác" · "Tải bản mới" → 60.000 · sửa thường → 80.000 · thêm 20.000 → tổng 100.000 · Xoá → hộp "Xoá khoản chi này?" → còn 80.000. ✅
- 2026-10-13 13:38 — Bước 3: user cũ có 3 nhóm có sẵn · đổi sang English → Food / Transport / Bills, "BUILT-IN" · đổi tên "Test S4" → "Test S4 B" · xoá nhóm (hộp chỉ tiêu đề, đúng spec) → tab Chi tiêu "No expenses yet", máy ảo mở lại cũng trống (đã xoá trên server). ✅
- 2026-10-13 13:42 — Bước 3: event "Test S4 event" lặp hằng ngày, màu `#8B1E3F` → đúng màu ở Tháng, Danh sách, Tuần (viền trái), Ngày (nền pha trong + viền, đúng code `DayTimeline`) · chữ trắng trên nền đậm · sửa "This occurrence only" ngày 22/10 sang `#FFE08A` → chỉ 22/10 vàng nhạt chữ tối, các ngày khác giữ màu. ✅
- 2026-10-13 13:44 — Bước 3: danh mục note "Test S4" màu `#0F5132` → chấm màu ở chip lọc + viền trái thẻ note đúng màu. ✅
- Google: máy thật đang **tắt** "Sync with Google Calendar" lúc bắt đầu → hỏi bạn trước khi bật.
- 2026-10-13 13:49 — Google: bạn chốt "bật, thử, rồi tắt lại" → bật sync, "Last synced 13:49" · event lên Google Calendar chính, `colorId` 8 (Graphite `#616161`), khớp `toGoogleColorId('#8B1E3F')`. ✅ theo code.
  - **Finding (chưa sửa):** "màu gần nhất" dùng khoảng cách RGB thô (`lib/colors` `distance`) → đỏ đậm `#8B1E3F` ra **xám** (7409) thay vì Tomato đỏ (10345); vàng nhạt `#FFE08A` ra **Flamingo hồng** (11154), sát Banana vàng (11170). Đúng spec chữ, nhưng nhìn không "gần". Hướng sửa (nếu bạn muốn): so theo hue/độ sáng (vd. khoảng cách trong Lab/HSL) — việc riêng, cần duyệt.
- 2026-10-13 13:50 — Google: lần 22/10 ("chỉ lần này") lên Google `colorId` 4, các ngày khác 8 · "Sync now" kéo về → app vẫn giữ `#8B1E3F` và `#FFE08A` (không đổi thành màu tên). ✅
- 2026-10-13 13:53 — Dọn: xoá event thử "All occurrences" (hộp báo "cũng xoá trên Google") → Google không còn event · xoá danh mục note "Test S4" (note trong đó xoá theo) · tắt sync (hộp "Turn off sync?") · ngôn ngữ về Tiếng Việt. Nhóm + khoản chi thử đã xoá ở trên.
  - Lưu ý: lúc bật sync, app kéo event thật trên Google của bạn về Daynest (vd. "Vào…" 5–11/10). Tắt sync không xoá gì ở cả 2 phía (đúng F4), nên các event này **vẫn ở trong Daynest**.
- 2026-10-13 13:53 — Bước 4: tick 3 dòng DoD trong `sprint-4/index.md` (link về file này).

## Finding chờ bạn quyết (chưa sửa)

1. **Màu gần nhất lên Google trông sai**: `toGoogleColorId` (`app/src/lib/google/mapping.ts:39`) so theo khoảng cách RGB thô → `#8B1E3F` đỏ đậm ra Graphite xám, `#FFE08A` vàng nhạt ra Flamingo hồng. Sửa: đổi cách đo (vd. theo hue / Lab) + thêm test.
2. **Chữ tiếng Anh sai số ít**: "1 notes" ở màn Categories và hộp xoá — `app/src/locales/en.json:375` (`count`), `:381` (`confirmText`) thiếu dạng `_one`.
