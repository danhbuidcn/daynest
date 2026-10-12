# 2026-10-12 — Cài đặt: "Hiện ngày âm" → "Hiện ngày âm lịch" — ✅ xong

## Input

- Bạn (2026-10-12 12:25): đổi chữ "Hiện ngày âm" → "Hiện ngày âm lịch".

## Plan

- [x] 1. Đổi chữ ở `app/src/locales/vi.json` (`showLunar`) · chú thích trong `app/src/features/calendar/dayInfo.ts` · spec [F6-settings.md](../docs/specs/sprint-2/F6-settings.md) (2 chỗ) · [mockup S3](../docs/specs/sprint-3/design/mockups.html). Giữ nguyên tiếng Anh ("Show lunar dates") và mockup S2 (bản cũ).
- [x] 2. `typecheck && lint && test` → gộp vào bản build thử độ trễ Lịch, xem trên máy màn Cài đặt.
- [x] 3. Commit `fix(app): settings label "Hiện ngày âm lịch"` + push.

## Kết quả
- 2026-10-12 14:30 — Bạn duyệt. Đổi 5 chỗ như plan · typecheck + lint (0 lỗi) + test 127/127.
- 2026-10-12 14:41 — Máy thật (bản release 3.0.0): Cài đặt → "Hiện ngày âm lịch" hiện đủ 1 dòng. Commit + push.
