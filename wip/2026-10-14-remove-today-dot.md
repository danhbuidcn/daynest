# 2026-10-14 — Bỏ chấm dưới hôm nay, chỉ đổi màu chữ — 🔄 chờ bạn xem trên máy

## Input

- Bạn (2026-10-14): ở các tab lịch, hôm nay (14/10) có chữ xanh lá + chấm tròn bên dưới. Bỏ chấm, chỉ giữ màu chữ khác, ở mọi tab.

## Điều tra

- Chấm chỉ do 1 component vẽ: `app/src/features/calendar/DayStrip.tsx:45` (`<View style={styles.dot} />`). Màu chữ xanh: dòng 27 (`colors.primaryDark`).
- `DayStrip` dùng ở 2 chỗ: Lịch › Danh sách (`ListView.tsx:62`) và Ghi chú › Todo (`TodoList.tsx:128`) → sửa 1 file là đủ cả 2.
- Lịch › Tuần (`WeekView.tsx:65`): chỉ có chữ xanh, không chấm → không cần sửa.
- Lịch › Tháng (`MonthView.tsx:113`): hôm nay là hình tròn nền xanh, chữ trắng (không phải chấm bên dưới) → không sửa, trừ khi bạn muốn.
- Spec ghi "chỉ chấm dưới hôm nay": `docs/specs/sprint-5/index.md:60,140`, `docs/specs/sprint-2/design/screens.md:10`, `docs/specs/sprint-5/design/mockups.html:590,713,809,813`.

## Plan

- [x] 1. `DayStrip.tsx`: xoá `<View dot>` + style `dot`; sửa comment dòng 10 ("today has its own number colour").
- [x] 2. Spec: đổi "chấm dưới hôm nay" → "hôm nay chữ màu primaryDark" ở 2 file `.md` + ghi chú màn 5, 7 trong `mockups.html`; bỏ `<span class="dot">` ở dòng 590, 713 (thay bằng `&nbsp;`).
- [x] 3. Kiểm: `npm run typecheck && npm run lint && npm test` trong `app/`.
- [x] 4. Commit `fix(app): drop today dot in day strip` + push.

## Kết quả

- 2026-10-14 — `DayStrip.tsx`: bỏ chấm. Hôm nay vẫn chữ `primaryDark` (khi không chọn). Áp dụng cho Lịch › Danh sách và Ghi chú › Todo.
- Spec: sửa 2 file `.md` + `sprint-5/design/mockups.html` (ghi chú màn 5, 7; bỏ chấm trong hình; bỏ CSS `.ds .dot`). Mockup sprint 2, 3 giữ nguyên (lịch sử).
- Kiểm: typecheck OK · lint 0 lỗi (3 warning cũ ở `i18n/index.ts`) · test 223/223 pass.
- Chưa thử trên máy thật — cần bản build mới (dev hoặc release kế tiếp).
