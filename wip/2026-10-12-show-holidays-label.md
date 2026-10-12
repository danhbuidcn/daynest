# 2026-10-12 — Cài đặt: "Hiện …" → "Hiển thị …" — ✅ xong (chờ xem trên máy ở bản build S4 bước 3)

## Input

- Bạn (2026-10-12): "Hiện ngày lễ" → "Hiển thị ngày lễ" ở màn Cài đặt.

## Plan

- [x] 1. Đổi `showHolidays` trong `app/src/locales/vi.json` · spec [F6-settings.md](../docs/specs/sprint-2/F6-settings.md) · [mockup S3](../docs/specs/sprint-3/design/mockups.html). Giữ tiếng Anh, mockup S2 (bản cũ).
- [ ] 2. `typecheck && lint && test` → xem trên máy (gộp vào bản build bước 3 S4).
- [x] 3. Commit `fix(app): settings label "Hiển thị ngày lễ"` + push.

## Câu hỏi

- Đổi luôn "Hiện ngày âm lịch" → "Hiển thị ngày âm lịch" cho đồng bộ? → Bạn: "Hiện → Hiển thị" (đổi cả 2).

## Kết quả
- 2026-10-12 18:40 — Đổi 2 nhãn "Hiển thị ngày âm lịch", "Hiển thị ngày lễ" ở `vi.json`, F6-settings.md (3 chỗ), mockup S3 · typecheck + lint (0 lỗi, 3 cảnh báo cũ) + test 131/131. Bước 2 (xem trên máy) gộp vào bản build S4 bước 3. Commit + push.
