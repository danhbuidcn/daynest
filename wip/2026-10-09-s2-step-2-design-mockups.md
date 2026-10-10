# 2026-10-09 — S2 bước 2: thiết kế (design system bổ sung + mockup) — ✅ xong

**Input:** spec S2 đã ok (`docs/specs/sprint-2/`), danh sách màn ở `design/screens.md` (23 màn), design system S1. Cùng cách làm mockup S1.

- [x] 1. Commit spec S2 trước (tách khỏi mockup): `docs: add sprint-2 spec` (`docs/specs/sprint-2/`, `docs/specs/index.md`, `docs/index.md`, `wip/todo_list.md`) kèm Co-Authored-By, push.
- [x] 2. `docs/specs/design-system.md` — thêm thành phần mới (chỉ token có sẵn, không thêm màu/cỡ chữ):
  - ô lịch tháng (số dương, ngày âm, tên lễ, thanh event, "+N", hôm nay, ngày tháng khác, CN/lễ);
  - thanh event (tháng) + thẻ event (tuần/danh sách/sheet ngày) + khối event (xem ngày);
  - thanh chọn chế độ (segmented: Tháng · Danh sách · Tuần · Ngày);
  - sheet từ đáy (có Huỷ bỏ / tiêu đề / Hoàn tất);
  - công tắc + dòng cài đặt có công tắc;
  - chip danh mục, thẻ note, dòng checklist;
  - icon nhỏ trạng thái event: lặp · nhắc · Google · chờ đồng bộ · chỉ trên Daynest.
- [x] 3. Vẽ `docs/specs/sprint-2/design/mockups.html` — 1 file, khung điện thoại 360×780, chữ tiếng Việt, mở bằng trình duyệt; chia 4 nhóm:
  - **Lịch:** màn 1–7 (tháng có ngày âm + lễ + event mẫu; tuần; ngày; danh sách; chọn chế độ; chọn tháng/năm; sheet ngày);
  - **Event:** màn 8–15 (sheet `+`, form tạo, chọn lặp có "Hằng năm (âm lịch)", sheet mốc nhắc, mẹo pin, chi tiết, hỏi lần lặp, xung đột);
  - **Notes:** màn 16–20 (danh sách, editor có checklist, danh mục, sửa danh mục, thùng rác);
  - **Cài đặt:** màn 21–22 (Cài đặt có nhóm Thông báo / Lịch / Google Calendar ở cả trạng thái tắt và bật; tiến độ đồng bộ).
  - Màn 12 (picker ngày/giờ hệ điều hành): không vẽ.
- [x] 4. `design/screens.md` + `sprint-2/index.md`: thêm link mockup, bỏ chữ "bước 2 (chưa làm)"; `F6-settings.md`: bỏ ghi chú "thêm vào design-system ở bước 2".
- [x] 5. Kiểm tra: mở `mockups.html` (chụp màn bằng trình duyệt headless) — đủ màn, không vỡ bố cục; chỉ dùng token trong design system; không link hỏng.
- [x] Góp ý của bạn (đã sửa): màn 7, 8 → pop-up giữa màn như màn 6; bỏ chữ "(ngày giỗ)" trong dòng gợi ý lặp âm.
- [x] 6. Gửi bạn xem. Góp ý thì sửa; ok thì commit `docs: add sprint-2 mockups` (1 dòng, không body, không Co-Authored-By), push → sang bước code (todo riêng, chia nhiều bước nhỏ).
