# 2026-10-10 — S2 code bước 9: Notes (F5) — 🔄 đang làm

## Input

- Lộ trình: [bước 8 xong](2026-10-10-s2-code-step-8-reminders-settings.md). Bước 9: Notes — xem [lộ trình](2026-10-09-s2-code-roadmap-step-3-lunar-month.md).
- Spec: [F5-notes.md](../docs/specs/sprint-2/F5-notes.md), [screens.md](../docs/specs/sprint-2/design/screens.md) màn 8, 15–20, [db.md](../docs/specs/sprint-2/design/db.md#notes), [mockups.html](../docs/specs/sprint-2/design/mockups.html).
- DB đã có (bước 4): `note_categories`, `notes` (`search_text`, `pinned`, `deleted_at`, `checklist jsonb`), hàm `delete_note_categories(ids)`.
- App hiện: tab Quản lý là màn trống; pop-up `+` → Ghi chú chỉ toast "Đang phát triển"; Toast chưa có nút Hoàn tác.
- Theo yêu cầu trước: không viết test mới, kiểm tra trực tiếp trên emulator `pwvault-test`.

## Output

- Tab Quản lý: danh sách note (lưới 2 cột, ghim lên đầu, chip lọc danh mục, tìm không dấu, tải 30/trang), `⋯` thẻ: Xoá · Di chuyển đến.
- Editor: tự lưu (Back, nền, 2 giây ngừng gõ), checklist, ghim, danh mục, xung đột `updated_at`, note trống.
- Màn Danh mục (thêm/sửa/chọn để xoá) + Thùng rác (khôi phục, xoá vĩnh viễn, xoá tất cả).

## Plan

- [ ] 1. `lib/notes/`: `searchText` (bỏ dấu, `đ` → `d`), `isEmptyNote`, nhãn "2/5 mục", xem trước nội dung.
- [ ] 2. `features/notes/api.ts` + hooks (React Query): danh sách keyset 30/trang + tìm + lọc danh mục, đọc 1 note, tạo/sửa (khoá lạc quan), xoá vào thùng rác / hoàn tác, thùng rác, danh mục CRUD + `delete_note_categories`.
- [ ] 3. Toast thêm nút hành động (Hoàn tác). Icon mới: pin, folder, checklist, restore.
- [ ] 4. Màn 16 `(tabs)/manage`: tiêu đề + `⋯` (Danh mục, Thùng rác) · ô tìm (300 ms) · chip · lưới 2 cột thẻ note · `⋯` thẻ · trống.
- [ ] 5. Màn 17 `note/[id]`: chip danh mục · `⋯` (Ghim, Danh mục, Xoá) · tiêu đề · nội dung · checklist · thanh dưới; tự lưu; hộp xung đột (màn 15); "Xoá note trống?"; lưu lỗi → hỏi khi Back.
- [ ] 6. Màn 18, 18b, 18c, 19 `note/categories`; màn 20, 20b `note/trash`.
- [ ] 7. Pop-up `+` → Ghi chú mở editor mới (danh mục = chip đang lọc).
- [ ] 8. i18n EN + VI.
- [ ] 9. `npm run typecheck && npm run lint && npm test` · emulator: tạo/sửa/tự lưu, checklist, ghim, tìm "ke hoach", danh mục, xoá + hoàn tác, thùng rác.
- [ ] 10. Commit `feat(app): notes`, push. Không release.

## Kết quả

## Việc tiếp

- Bước 10: Đồng bộ Google 2 chiều (F4).
