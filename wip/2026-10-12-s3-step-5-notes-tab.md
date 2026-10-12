# 2026-10-12 — S3 bước 5: tab "Ghi chú" + số note, nhóm theo tháng, màn soạn note kiểu Samsung Notes — ✅ đã duyệt, chưa làm

Thuộc: [S3 lộ trình](2026-10-12-s3-plan.md) · spec [S3 mục 3](../docs/specs/sprint-3/index.md#thay-đổi-ghi-chú).

## Input

- Bạn chốt: đổi tab "Quản lý" → "Ghi chú" + làm A, B, C (so sánh Samsung Notes).
- Hiện trạng: [manage.tsx](../app/src/app/(tabs)/manage.tsx) tiêu đề `tabs.manage` · `fetchCategories` đã có `noteCount` · editor note mới chưa tự focus.

## Plan

- [ ] 1. Đổi tên tab: `tabs.manage` → VI "Ghi chú", EN "Notes" (`vi.json`, `en.json`). Giữ route `manage` (không đổi đường dẫn, tránh vỡ link cũ).
- [ ] 2. (A) Số note: dưới tiêu đề "N ghi chú" theo chip đang lọc (truy vấn `count` riêng, `head: true`) · chip danh mục kèm số (dùng `noteCount`; kiểm tra chỉ đếm note ngoài thùng rác).
- [ ] 3. (B) Nhóm theo tháng: hàm thuần `groupNotesByMonth` ở `app/src/lib/notes/` (nhóm "Đã ghim" trước, rồi theo tháng `updated_at`, năm khác ghi kèm năm) + test Jest · `NoteGrid` vẽ tiêu đề nhóm. Phân trang keyset giữ nguyên.
- [ ] 4. (C) Màn soạn note kiểu Samsung Notes cho cả note mới + note cũ ([mockup 17b–17d](../docs/specs/sprint-3/design/mockups.html)): tiêu đề lên thanh trên · nội dung cả màn · thanh công cụ trên bàn phím (Checklist, chip danh mục, "Tự lưu") · note mới: ô nội dung `autoFocus`; note cũ không tự bật bàn phím · chọn danh mục ngay trong màn soạn: bấm chip → hộp chọn (17d, dùng lại `CategoryPickerDialog`) · logic danh mục giữ như S2.
- [ ] 5. i18n đủ khoá ở `en.json` + `vi.json`.
- [ ] 6. `npm run typecheck && npm run lint && npm test`.
- [ ] 7. Chạy trên máy thật: tạo vài note (có ghim, có danh mục) → xem số, nhóm tháng, tải thêm, bàn phím khi tạo mới. Xoá note thử sau khi xong.
- [ ] 8. Commit `feat(app): notes tab with counts, month groups, autofocus` + push.

## Kết quả

_(chưa làm)_
