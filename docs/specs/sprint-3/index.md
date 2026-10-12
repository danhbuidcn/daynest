# Sprint 3 — Hoàn thiện Lịch + Ghi chú

Thuộc: [Spec tổng](../index.md) · S3.

## Mục tiêu

- Lịch và Ghi chú dùng mượt, không lỗi hiển thị.
- Không thêm tính năng mới ngoài phần Ghi chú bạn chọn ở mục 3.
- Không có bảng mới → không test tải.

## Phạm vi

| # | Việc | Chi tiết |
| --- | --- | --- |
| 1 | Chế độ Ngày: chữ event không bị cắt | Event ngắn (< ~40 phút) hiện đủ tiêu đề, không mất nửa dòng chữ |
| 2 | Bấm tab mượt | Bấm tab → chuyển ngay · dữ liệu chưa về → loading trong phần nội dung (không chặn tab bar) · có dữ liệu cũ thì hiện dữ liệu cũ trong lúc tải lại |
| 3 | Tab "Quản lý" → "Ghi chú" | Đổi tên tab (VI "Ghi chú", EN "Notes") · chỉnh Notes theo app Notes trên điện thoại — danh sách thay đổi do bạn chọn ở bước 2 ([wip](../../../wip/2026-10-12-s3-plan.md)), ghi bổ sung vào mục dưới |
| 4 | Phân trang + idempotency | Mọi màn danh sách dài: phân trang **keyset** + "Tải thêm" (Notes, Thùng rác đã có) · mọi thao tác tạo: app sinh `id` 1 lần khi mở form, gửi lại dùng cùng `id` → không tạo trùng (sửa: tạo event, tạo danh mục) — nguyên tắc ở [§3](../index.md#nguyên-tắc-mở-rộng) |

### Thay đổi Ghi chú

Bạn chọn sau khi so sánh với Samsung Notes ([wip](../../../wip/2026-10-12-s3-plan.md#bước-2--kết-quả-2026-10-12-0956)):

| # | Thay đổi | Chi tiết |
| --- | --- | --- |
| A | Hiện số note | Dưới tiêu đề tab: "N ghi chú" (theo chip đang lọc) · chip danh mục kèm số: "Việc nhà · 4" |
| B | Nhóm theo tháng | Note ghim lên đầu (nhóm "Đã ghim") · còn lại chia nhóm theo tháng của `updated_at`: "Tháng 9" (năm nay), "Tháng 9, 2025" (năm khác) · vẫn phân trang keyset như cũ |
| C | Màn soạn note kiểu Samsung Notes (note mới + note cũ) | Tiêu đề nằm trên thanh trên cạnh ‹ · nội dung chiếm cả màn · thanh công cụ ngay trên bàn phím: Checklist, chip danh mục, "Tự lưu" · note mới: con trỏ ở nội dung, bàn phím bật sẵn · danh mục note mới = chip đang lọc ("Tất cả" → không có), đổi bằng chip danh mục (như S2) |

Không làm: hoàn tác/làm lại, lưới thư mục, định dạng chữ, menu ☰.

## Thiết kế

- [Mockup S3](design/mockups.html) — chỉ màn đổi: 16, 16c, 17b, 3b · màn khác giữ như [mockup S2](../sprint-2/design/mockups.html).

**Không làm ở S3:** Chi tiêu (S4). Todo, Diary đã bỏ khỏi sản phẩm.

## Xong khi (DoD)

- [x] Chế độ Ngày: event 15, 30, 45 phút và event chồng giờ hiện đủ chữ trên máy thật.
- [x] Bấm qua lại 4 tab trên máy thật: tab đổi ngay, không khựng · mạng chậm → thấy loading trong nội dung, không màn trắng.
- [x] Tab hiện "Ghi chú" (VI) / "Notes" (EN) · các thay đổi Ghi chú đã chọn chạy đúng.
- [x] Bấm Lưu 2 lần / gửi lại khi mạng chập chờn → không tạo trùng event, note, danh mục.
- [x] Danh sách dài cuộn tới cuối → tải thêm, không lặp, không sót.
- [x] `npm run typecheck && npm run lint && npm test` qua.
- [x] Cuối sprint: release `3.0.0` theo [Spec tổng §4](../index.md#cuối-sprint-mọi-sprint).
