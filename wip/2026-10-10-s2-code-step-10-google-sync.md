# 2026-10-10 — S2 code bước 10: Đồng bộ Google 2 chiều (F4) — 🔄 đang làm

## Input

- Lộ trình: [bước 9 xong](2026-10-10-s2-code-step-9-notes.md). Bước 10 — xem [lộ trình](2026-10-09-s2-code-roadmap-step-3-lunar-month.md).
- Spec: [F4-google-calendar.md](../docs/specs/sprint-2/F4-google-calendar.md), [F6 § Google Calendar](../docs/specs/sprint-2/F6-settings.md#google-calendar), [db.md](../docs/specs/sprint-2/design/db.md) (`events.google_*`, `deleted_at`, `event_exceptions.google_status`, `google_sync_state`), mockup màn 13, 21, 21b, 21c, 22.
- DB đã có (bước 4) — không cần migration mới.
- App hiện: Cài đặt chưa có nhóm Google Calendar; màn Chi tiết luôn hiện nhãn "Chỉ trên Daynest"; đăng nhập Google chỉ xin quyền mặc định.
- Theo yêu cầu trước: không viết test mới, kiểm tra trên emulator; kiểm tra phía Google bằng Google Calendar (MCP) — event thử đặt tên "Daynest test …", xoá sau khi thử.

## Output

- Cài đặt: nhóm Google Calendar (công tắc · Đồng bộ ngay · Lần đồng bộ cuối · cảnh báo "Cần kết nối lại Google"), hộp tiến độ (màn 22), hộp "Tắt đồng bộ?" (màn 21c).
- Bật → xin quyền → kéo + đẩy event năm nay và event lặp. Đang bật: lưu/xoá event → đẩy lên Google; mở app / về foreground (> 5 phút) / Đồng bộ ngay → kéo thay đổi.
- Nhãn trên Chi tiết + icon Google / đồng hồ trên thẻ event; hộp xoá ghi "Cũng xoá trên Google Calendar".

## Plan

- [x] 1. `lib/google/`: map 2 chiều (cả ngày +1 ngày, có giờ, màu, nhắc cả ngày −540, `RRULE` đơn giản ↔ Daynest, `COUNT` → ngày kết thúc, phức tạp → chỉ xem), phạm vi năm, id Google từ uuid, id instance.
- [x] 2. `features/google/`: `client.ts` (REST + token `GoogleSignin`, 401 thử lại 1 lần, 429/403 chờ tăng dần), `state.ts` (`google_sync_state`), `pull.ts`, `push.ts`, `sync.ts` (bật, đồng bộ ngay, foreground, sang năm mới, `410`), cấu hình module như `reminderSync`.
- [x] 3. `features/events`: đọc thêm cột `google_*`; sau lưu / xoá / ngoại lệ → đẩy (lỗi → `pending`); xoá event đã liên kết: `deleted_at` → xoá trên Google → xoá hẳn.
- [x] 4. UI: `GoogleSettings` + hộp tiến độ + hộp tắt; icon `google`, `sync`; nhãn Chi tiết (Google · Chờ đồng bộ · Chỉ trên Daynest · Sửa trên Google Calendar, ẩn Sửa khi chỉ xem); icon trên thẻ; chữ hộp xoá; kéo xuống ở Lịch → đồng bộ; nhắc lẻ từ Google có nhãn chung.
- [x] 5. i18n EN + VI.
- [ ] 6. `npm run typecheck && npm run lint && npm test` · emulator: bật → event Daynest lên Google; tạo/sửa/xoá ở Daynest → thấy trên Google; tạo/sửa/xoá trên Google → Đồng bộ ngay → thấy ở Daynest; tắt → độc lập. Xoá event thử.
- [ ] 7. Cập nhật spec/mockup nếu khác thiết kế. Commit `feat(app): google calendar sync`, push. Không release.

## Kết quả

Đã code, **chưa commit** (typecheck ok · lint 0 lỗi · test 122/122):

- `lib/google/`: `types.ts`, `rrule.ts` (tạo/đọc `RRULE`, `COUNT` → ngày kết thúc, phức tạp → null), `mapping.ts` (2 chiều, màu, nhắc cả ngày ±540, cắt chữ dài → chỉ xem), `scope.ts` (phạm vi năm, cửa sổ năm theo múi giờ, id Google = uuid bỏ `-`, id instance). Đã chạy thử nhanh bằng file test tạm (đã xoá): kết quả đúng.
- `features/google/`: `client.ts` (REST, token `GoogleSignin`, 401 thử lại 1 lần, 429/403 chờ 1-2-4-8 s, `requestCalendarAccess` = `addScopes`), `state.ts`, `store.ts` (cột `google_*`), `pull.ts` (upsert theo `google_event_id`, `cancelled` → xoá, lần lặp đổi → ngoại lệ, `RRULE` phức tạp → lưu từng lần chỉ xem, "sửa sau cùng thắng"), `push.ts` (insert id cố định / `409` → patch, `If-Match` + `412`, `404` → tạo lại, `403` → giữ bản Google, ngoại lệ → instance, lỗi → `pending`), `sync.ts` (bật/tắt/đồng bộ ngay/kết nối lại, foreground > 5 phút, `410` → kéo lại năm, sang năm mới → kéo lại), `useGoogleSync.ts`, `GoogleSettings.tsx`, `SyncProgressDialog.tsx`.
- `features/events`: đọc `google_*`; lưu / ngoại lệ → đẩy; xoá event đã liên kết → `deleted_at` → xoá trên Google → xoá hẳn. Nhãn Chi tiết `EventSyncTag` (Google Calendar · Chờ đồng bộ · Sửa trên Google Calendar · Chỉ trên Daynest), ẩn "Sửa" khi chỉ xem, hộp xoá "Cũng xoá trên Google Calendar". `SyncIcon` trên thẻ tuần/danh sách/pop-up ngày. Nhắc từ Google không nằm trong danh sách → nhãn chung ("45 phút trước").
- Lịch: kéo xuống ở Tuần / Danh sách / Ngày → đồng bộ (chỉ khi đang bật). Tháng không cuộn → không có kéo xuống (dùng Đồng bộ ngay / mở app).
- `ConfirmDialog` thêm `tone="warning"` (hộp "Tắt đồng bộ?" màn 21c). Icon `google`, `sync`.

Thử trên emulator (tài khoản `danhpoutch@gmail.com`):

- Cài đặt có nhóm Google Calendar đúng mockup màn 21.
- Bật → Google chặn: **"Access blocked: Daynest has not completed the Google verification process — Error 403: access_denied"** → app đúng luồng từ chối: công tắc về tắt + toast "Cần cho phép truy cập Google Calendar".

- Sau khi bạn cấu hình Google Cloud: bật đồng bộ thành công (màn 21b: Đồng bộ ngay · "Lần đồng bộ cuối: Hôm nay 22:26"). DB: `google_sync_state` có `sync_token`, `synced_year = 2026`.
- Event có sẵn "2. Lịch — …" (9/10) → đã đẩy lên Google (`google_status = synced`, icon G trên thẻ). "Kham rang" lặp âm → không đẩy (đúng spec).
- Tạo "Daynest test 1" (10/10 23:00) → icon G ngay sau lưu; Chi tiết nhãn "Google Calendar"; Xoá → hộp "Cũng xoá trên Google Calendar. Không thể hoàn tác." → dòng DB bị xoá hẳn (Google đã xác nhận xoá).
- Sửa thêm (lỗi có từ trước): event có giờ kết thúc đúng 00:00 (vd 23:00 – 00:00) không còn hiện sang ngày hôm sau.

## ⛔ Chờ bạn: thử phía Google (tài khoản `danhpoutch@gmail.com`)

Calendar MCP của Claude là tài khoản khác → không tự xem/sửa được lịch Google của `danhpoutch`.

1. Mở Google Calendar (`danhpoutch`): thấy "2. Lịch — …" ngày 9/10 13:00, không thấy "Daynest test 1".
2. Tạo "Google test 1" (vd 12/10 9:00, màu bất kỳ) · sửa giờ "2. Lịch — …" · tạo 1 event lặp hằng tuần "Google test 2".
3. Báo "tiếp" → Claude bấm Đồng bộ ngay, kiểm tra 3 thay đổi về Daynest, rồi thử xoá trên Google, tắt đồng bộ, commit.

## Sau bước 10

- Bước 11: test tải 100 user, rà chữ dài, DoD → release `1.1.0`.
