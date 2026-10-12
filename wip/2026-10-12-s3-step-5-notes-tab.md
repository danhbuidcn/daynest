# 2026-10-12 — S3 bước 5: tab "Ghi chú" + số note, nhóm theo tháng, màn soạn note kiểu Samsung Notes — ✅ xong (còn xoá danh mục thử TestCat)

Thuộc: [S3 lộ trình](2026-10-12-s3-plan.md) · spec [S3 mục 3](../docs/specs/sprint-3/index.md#thay-đổi-ghi-chú).

## Input

- Bạn chốt: đổi tab "Quản lý" → "Ghi chú" + làm A, B, C (so sánh Samsung Notes).
- Hiện trạng: [manage.tsx](../app/src/app/(tabs)/manage.tsx) tiêu đề `tabs.manage` · `fetchCategories` đã có `noteCount` · editor note mới chưa tự focus.

## Plan

- [x] 1. Đổi tên tab: `tabs.manage` → VI "Ghi chú", EN "Notes" (`vi.json`, `en.json`). Giữ route `manage` (không đổi đường dẫn, tránh vỡ link cũ).
- [x] 2. (A) Số note: dưới tiêu đề "N ghi chú" theo chip đang lọc (truy vấn `count` riêng, `head: true`) · chip danh mục kèm số (dùng `noteCount`; kiểm tra chỉ đếm note ngoài thùng rác).
- [x] 3. (B) Nhóm theo tháng: hàm thuần `groupNotesByMonth` ở `app/src/lib/notes/` (nhóm "Đã ghim" trước, rồi theo tháng `updated_at`, năm khác ghi kèm năm) + test Jest · `NoteGrid` vẽ tiêu đề nhóm. Phân trang keyset giữ nguyên.
- [x] 4. (C) Màn soạn note kiểu Samsung Notes cho cả note mới + note cũ ([mockup 17b–17d](../docs/specs/sprint-3/design/mockups.html)): tiêu đề lên thanh trên · nội dung cả màn · thanh công cụ trên bàn phím (Checklist, chip danh mục, "Tự lưu") · note mới: ô nội dung `autoFocus`; note cũ không tự bật bàn phím · chọn danh mục ngay trong màn soạn: bấm chip → hộp chọn (17d, dùng lại `CategoryPickerDialog`) · logic danh mục giữ như S2.
- [x] 5. i18n đủ khoá ở `en.json` + `vi.json`.
- [x] 6. `npm run typecheck && npm run lint && npm test`.
- [x] 7. Chạy trên máy thật: tạo vài note (có ghim, có danh mục) → xem số, nhóm tháng, tải thêm, bàn phím khi tạo mới. Xoá note thử sau khi xong.
- [x] 8. Commit `feat(app): notes tab with counts, month groups, autofocus` + push.

## Kết quả

- 2026-10-12 11:10 — Code xong 1–5, check qua (typecheck · lint 0 lỗi · test 125/125, thêm `noteGroups.test.ts` 3 test).
  - Tab: `tabs.manage` → "Ghi chú" / "Notes". Route giữ `manage`.
  - (A) `countNotes` (`count: exact, head: true`, ngoài thùng rác, theo chip) → "N ghi chú" dưới tiêu đề · chip danh mục kèm `noteCount`.
  - (B) `app/src/lib/notes/groups.ts` `groupNotesByMonth` → `NoteGrid` vẽ "Đã ghim" + nhóm tháng ("Tháng 9" / "Tháng 12, 2025", dùng lại khoá `calendar.months`, `calendar.monthTitle`).
  - (C) `note/[id].tsx`: tiêu đề lên thanh trên (1 dòng, Enter → xuống nội dung) · chỗ trống dưới nội dung bấm vào = vào nội dung · thanh công cụ: nút Checklist (icon), chip danh mục (bấm → ẩn bàn phím, mở hộp chọn), "Tự lưu" · note mới `autoFocus` ô nội dung.
  - Thêm theo mockup 16c (ngoài plan): thẻ note năm khác ghi ngày kèm năm ("28/12/2025"). Chữ "Tự lưu khi quay lại" → "Tự lưu" (theo spec + mockup; app còn tự lưu sau 2 s).
- 2026-10-12 11:10 — Máy thật (bản release cài đè `adb install -r`):
  - Tab "Ghi chú" · "0/1/2 ghi chú" đổi đúng khi tạo, lọc, xoá · chip "TestCat 1" → "0" khi note vào thùng rác (đếm bỏ qua thùng rác).
  - Nhóm "Đã ghim" (icon ghim) rồi "Tháng 10" — giống mockup 16.
  - Note mới: bàn phím bật sẵn, con trỏ ở nội dung (17b) · đang lọc TestCat → chip tự là TestCat (17c) · bấm chip → bàn phím ẩn, hộp chọn mở, "Thêm danh mục" tạo tại chỗ (17d) · note cũ mở không bật bàn phím · note trống Back → không lưu.
  - Chưa thử trên máy: "Tải thêm" (cần > 30 note; phân trang không đổi) · nhóm năm khác (đã có test Jest).
  - Dọn dữ liệu: 2 note thử đã xoá vĩnh viễn. **Còn danh mục "TestCat"** — đang xoá thì máy có cuộc gọi đến, tôi dừng. Bạn bấm "Xoá" ở hộp đang mở (hoặc ⋯ → Danh mục → Chọn để xoá).
