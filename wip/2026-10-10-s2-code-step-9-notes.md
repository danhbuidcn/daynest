# 2026-10-10 — S2 code bước 9: Notes (F5) — ✅ xong (trừ kéo đổi thứ tự checklist)

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

- [x] 1. `lib/notes/`: `searchText` (bỏ dấu, `đ` → `d`), `isEmptyNote`, nhãn "2/5 mục", xem trước nội dung.
- [x] 2. `features/notes/api.ts` + hooks (React Query): danh sách keyset 30/trang + tìm + lọc danh mục, đọc 1 note, tạo/sửa (khoá lạc quan), xoá vào thùng rác / hoàn tác, thùng rác, danh mục CRUD + `delete_note_categories`.
- [x] 3. Toast thêm nút hành động (Hoàn tác). Icon mới: pin, folder, checklist, restore.
- [x] 4. Màn 16 `(tabs)/manage`: tiêu đề + `⋯` (Danh mục, Thùng rác) · ô tìm (300 ms) · chip · lưới 2 cột thẻ note · `⋯` thẻ · trống.
- [x] 5. Màn 17 `note/[id]`: chip danh mục · `⋯` (Ghim, Danh mục, Xoá) · tiêu đề · nội dung · checklist · thanh dưới; tự lưu; hộp xung đột (màn 15); "Xoá note trống?"; lưu lỗi → hỏi khi Back.
- [x] 6. Màn 18, 18b, 18c, 19 `note/categories`; màn 20, 20b `note/trash`.
- [x] 7. Pop-up `+` → Ghi chú mở editor mới (danh mục = chip đang lọc).
- [x] 8. i18n EN + VI.
- [x] 9. `npm run typecheck && npm run lint && npm test` · emulator: tạo/sửa/tự lưu, checklist, ghim, tìm "ke hoach", danh mục, xoá + hoàn tác, thùng rác.
- [x] 10. Commit `feat(app): notes`, push. Không release.

## Kết quả

- `lib/notes/` (bỏ dấu, `search_text`, note trống, "2/5 mục", mẫu `ilike`) · `features/notes/`: `api.ts` (keyset 30/trang theo `(pinned, updated_at, id)`, tìm, thùng rác keyset `(deleted_at, id)`, upsert lần lưu đầu theo id, khoá lạc quan, danh mục + `delete_note_categories`), `useNotes.ts` (React Query, xoá → toast + Hoàn tác), `NoteCard`, `NoteGrid` (2 cột, `⋯` thẻ: Di chuyển đến · Xoá), `CategoryChips`, `SearchBox`, `CategoryPickerDialog`, `CategoryEditDialog`, `newNote.ts` (id sinh trước, danh mục = chip đang lọc), `editor/useNoteEditor.ts` (tự lưu 2 s / Back / nền, lưu tuần tự, xung đột), `editor/ChecklistBlock.tsx`.
- Màn: `(tabs)/manage.tsx` (16), `note/[id].tsx` (17), `note/categories.tsx` (18, 18b, 18c, 19), `note/trash.tsx` (20, 20b). Pop-up `+` → Ghi chú mở editor mới.
- Chung: Toast có nút hành động · `ActionMenu` nhận `top/right` · `ConfirmDialog` cho phép chỉ tiêu đề · hộp thoại tránh bàn phím · `Button` thêm `dangerSoft` · icon pin, checklist, folder, restore · i18n `notes.*` EN + VI.
- Thử trên emulator (`pwvault-test`, bản debug + Metro): tạo note từ nút trống và từ `+` · gõ tiêu đề, nội dung, checklist (Enter thêm mục, tick gạch ngang) · chọn danh mục + thêm danh mục ngay trong hộp chọn · ghim · Back → tự lưu, thẻ có viền màu, ghim, "1/2 mục" · tìm "HOACH" → 1 kết quả, "HOACHx" → không tìm thấy · `⋯` thẻ (menu dưới nút) → Xoá → toast + Hoàn tác → note về lại · thùng rác: khôi phục, xoá tất cả → trống, ẩn nút · danh mục: đổi tên trùng → "Tên này đã có", chọn để xoá → "Xoá 1 danh mục?" · "1 ghi chú bên trong cũng sẽ bị xoá." → note vào thùng rác, không còn danh mục · note trống mới: Back không lưu · note cũ xoá hết chữ → "Xoá ghi chú trống?" → Xoá.
- Sửa khi thử: thẻ hiện nội dung **hoặc** "n/m mục" (đúng spec + mockup) · vòng làm mới chỉ hiện khi kéo xuống · hộp Thêm/Sửa danh mục bị bàn phím che → đẩy lên · ẩn chú thích khi đang chọn để xoá.
- Bỏ dấu kiểm bằng node: "Kế Hoạch Tuần Đi chợ" → "ke hoach tuan di cho" (adb không gõ được chữ có dấu).
- Chưa thử được: xung đột 2 máy (dùng chung hộp + luồng với event), tải trang 2 (cần > 30 note), tự lưu 2 s khi app bị tắt.
- typecheck ok · lint 0 lỗi · test 122/122.
- **Chưa làm:** kéo đổi thứ tự mục checklist — cần thư viện kéo-thả hoặc tự viết bằng gesture-handler; chờ bạn chọn.

## Sau bước 9

- Bước 10: Đồng bộ Google 2 chiều (F4).
