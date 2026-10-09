# F5 — Notes

Thuộc: [Sprint 2](index.md).

## Mục tiêu

- Ghi chú nhanh: tiêu đề, nội dung, checklist, danh mục, ghim, tìm kiếm, thùng rác.

## Logic

### Trường

| Trường | Quy tắc |
| --- | --- |
| Tiêu đề | Không bắt buộc, ≤ 200 ký tự · trống → danh sách hiện dòng đầu nội dung |
| Nội dung | Text thuần, ≤ 20.000 ký tự |
| Checklist | 0–100 mục dưới nội dung; mỗi mục: chữ (≤ 200), đã xong / chưa · kéo đổi thứ tự |
| Danh mục | 0 hoặc 1 danh mục |
| Ghim | Có / không · note ghim lên đầu danh sách |

- Note "trống" (không tiêu đề, không nội dung, không mục checklist) → không lưu; đang sửa mà xoá hết → hỏi "Xoá note trống?".

### Lưu

- Back / vuốt quay lại / app về nền → **tự lưu** nếu có thay đổi. Không có nút Lưu.
- App tự sinh `id` lúc mở note mới → tự lưu nhiều lần chỉ tạo 1 note.
- Đang sửa: tự lưu ngầm sau 2 giây ngừng gõ (giảm mất dữ liệu khi app bị tắt).
- Gửi kèm `updated_at` đã đọc; không khớp (sửa ở máy khác) → hộp "Đã thay đổi ở thiết bị khác": **Tải bản mới** / **Ghi đè**.
- Lưu lỗi (mất mạng) → giữ nội dung trong editor, toast lỗi, Back hỏi "Chưa lưu được. Thoát và bỏ thay đổi?" ([Spec tổng §5](../index.md#5-xử-lý-lỗi-chung)).

### Danh mục

- User tự tạo: tên (1–30 ký tự, không trùng, không phân biệt hoa thường) + 1 trong 6 màu event.
- Tối đa 30 danh mục. Không có danh mục mặc định.
- Sửa tên/màu; xoá danh mục → note của nó về "Không danh mục" (không xoá note).

### Danh sách, tìm kiếm, phân trang

- Sắp xếp: ghim trước, rồi `updated_at` mới nhất.
- Lọc: chip "Tất cả" + từng danh mục.
- Tìm kiếm theo tiêu đề + nội dung + chữ checklist, không phân biệt hoa thường và dấu (vd "ghi chu" khớp "ghi chú"); gõ xong 300 ms mới tìm.
- Tải 30 note/trang, cuộn tới cuối tải thêm. Không tải toàn bộ.

### Thùng rác

- Xoá note → vào thùng rác (`deleted_at`), không hỏi xác nhận, toast "Đã chuyển vào thùng rác" + nút **Hoàn tác**.
- Thùng rác: Khôi phục · Xoá vĩnh viễn (hỏi xác nhận) · "Dọn thùng rác" (xoá vĩnh viễn hết, hỏi xác nhận).
- Note trong thùng rác không hiện ở danh sách và tìm kiếm.

## Luồng

```text
Tab Quản lý → Notes → danh sách (chip danh mục, ô tìm, ⋯: Danh mục, Thùng rác)
  bấm note → Editor → Back = tự lưu
`+` → Note → Editor mới (danh mục = chip đang lọc)
Editor ⋯ → Ghim · Danh mục · Xoá
```

## Mô tả

- Tab Quản lý (S2 chỉ có Notes; Todo, Diary thêm ở S3, S4): tiêu đề "Quản lý" · ô tìm kiếm · chip danh mục · lưới 2 cột thẻ note ([Cute 46](../../research/cute-calendar/screenshots/46-notes.png)).
- Thẻ note: viền trái màu danh mục · tiêu đề · 3 dòng nội dung hoặc "2/5 mục" · ngày sửa · icon ghim.
- Editor ([Cute 23](../../research/cute-calendar/screenshots/23-create-note.png), [32](../../research/cute-calendar/screenshots/32-note-checklist.png)): ‹ · chip danh mục · ⋯ · ô tiêu đề · ô nội dung · khối checklist (ô tick, ✕, "+ Thêm mục") · thanh dưới: nút "Checklist".
- Trống: "Chưa có ghi chú" + nút tạo.

## Không làm

- Định dạng chữ, ảnh, ghi âm, vẽ tay, nền note, đính kèm, emoji/sticker, khoá note, xuất PDF, chia sẻ, yêu thích, lưu trữ, thẻ, nhắc trong note, chọn nhiều, tự xoá thùng rác sau N ngày.

## Test

- Tự lưu: Back có thay đổi / không thay đổi / note trống; lưu 2 lần cùng `id` → 1 note.
- Xung đột `updated_at` → hộp hiện.
- Tìm kiếm có dấu/không dấu; phân trang không lặp, không sót note.
- Xoá danh mục → note về "Không danh mục"; thùng rác khôi phục / xoá vĩnh viễn.
