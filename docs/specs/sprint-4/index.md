# Sprint 4 — Chi tiêu

Thuộc: [Spec tổng](../index.md) · S4. Chốt phạm vi: [wip](../../../wip/2026-10-12-s4-plan.md#bạn-chọn-2026-10-12-1635) (tham khảo Money Lover).

## Mục tiêu

- Ghi khoản chi nhanh, xem lại chi tiêu theo ngày, tuần, tháng.
- Biết tiền đi vào nhóm nào nhiều nhất trong kỳ.
- **Làm đơn giản nhất:** chỉ khoản chi, 1 loại tiền (VND), không ví, không ngân sách.

## Phạm vi

| # | Việc | Chi tiết |
| --- | --- | --- |
| 1 | Tab "Thống kê" → "Chi tiêu" | VI "Chi tiêu", EN "Expenses" · icon ví |
| 2 | Thêm / sửa / xoá khoản chi | Số tiền · nhóm · ngày · ghi chú (không bắt buộc) |
| 3 | Nhóm chi tiêu | 3 nhóm có sẵn · tự thêm, đổi tên, xoá nhóm của mình |
| 4 | Xem theo Ngày / Tuần / Tháng | Mỗi chế độ chỉ tính khoản chi của kỳ đó · mặc định kỳ hiện tại (hôm nay / tuần này / tháng này) · chọn được kỳ bất kỳ · **Tháng, Tuần chỉ hiện số liệu tổng hợp**, chỉ **Ngày** liệt kê từng khoản chi |
| 5 | Thống kê | Theo nhóm (mọi chế độ): số tiền + % + thanh ngang, xếp nhiều → ít · **theo ngày** (Tháng, Tuần): biểu đồ cột mỗi ngày 1 cột · **theo tháng** (Tháng): biểu đồ cột 6 tháng gần nhất tính tới tháng đang xem |
| 6 | Chọn màu bất kỳ (**toàn app**) | Mọi chỗ chọn màu — màu event, danh mục note, nhóm chi tiêu: 6 màu mặc định + ô "Màu khác" → chọn màu bất kỳ ([chi tiết](#màu-bất-kỳ)) |

**Không làm ở S4:** khoản thu, vay/nợ, nhiều ví, số dư, ngân sách, giao dịch định kỳ, tìm kiếm, nhiều loại tiền, biểu đồ tròn, xuất file, thùng rác.

## Khoản chi

| Trường | Quy tắc |
| --- | --- |
| Số tiền | Bắt buộc · số nguyên VND, 1 → 100.000.000.000 · gõ bằng bàn phím số của máy, tự chèn dấu chấm ngàn khi gõ ("50.000") · hiện "50.000 ₫" (EN cũng VND) |
| Nhóm | Bắt buộc · mặc định nhóm dùng gần nhất (lần đầu: "Ăn uống") |
| Ngày | Bắt buộc · mặc định: hôm nay, hoặc ngày đang xem nếu đang ở chế độ Ngày · chỉ ngày, không giờ |
| Ghi chú | Không bắt buộc · ≤ 200 ký tự, 1 dòng |

- Lưu: như event/note — app sinh `id` 1 lần khi mở form (gửi lại không tạo trùng) · sửa dùng khoá lạc quan ([§3](../index.md#nguyên-tắc-mở-rộng)).
- Xoá: trong form sửa → "Xoá" → hộp xác nhận "Xoá khoản chi này?" → xoá hẳn (không thùng rác) · toast "Đã xoá".

## Nhóm chi tiêu

- **3 nhóm có sẵn** (tạo cho mọi user, cả user cũ): Ăn uống · Di chuyển · Hoá đơn (EN: Food · Transport · Bills). Mỗi nhóm có icon + màu riêng, tên theo ngôn ngữ app (VI/EN). Không sửa, không xoá được.
- **Nhóm tự tạo:** tên 1–30 ký tự (không trùng, không phân biệt hoa thường) · chọn 1 trong **36 icon có sẵn** (ăn uống, mua sắm, nhà, điện nước, đi lại, sức khoẻ, học, công việc, tiền, giải trí…; mặc định thẻ tag; danh sách đúng như [mockup](design/mockups.html) màn 11) · chọn màu như [Màu bất kỳ](#màu-bất-kỳ) · tối đa 30 nhóm tự tạo.
- Đổi tên / icon / màu nhóm tự tạo: bấm vào nhóm trong màn Nhóm.
- Xoá nhóm tự tạo: hộp xác nhận "Xoá nhóm "X"?" (chỉ tiêu đề) → xoá nhóm + xoá hẳn mọi khoản chi trong nhóm (1 lệnh DB, xem [db.md](design/db.md)).

## Màu bất kỳ

- Áp dụng mọi chỗ chọn màu: form event, danh mục note, nhóm chi tiêu — dùng chung 1 thành phần.
- Hàng màu: 6 màu mặc định + ô cầu vồng "Màu khác" → hộp chọn: ô sáng/đậm + thanh màu + ô mã hex (`#RRGGBB`) + ô xem trước "Aa" → "Chọn". Đã chọn màu khác → ô cầu vồng hiện màu đó (bấm lại để đổi).
- Lưu: 6 màu mặc định giữ tên cũ (`mint`…), màu khác lưu mã hex.
- Chữ trên nền màu (thanh event, thẻ event, icon nhóm…): app tự chọn chữ tối (`text`) hoặc trắng theo độ sáng nền, đủ tương phản 4,5:1.
- Đồng bộ Google Calendar: Google chỉ có 11 màu cố định → event màu khác được đẩy lên Google với màu gần nhất; kéo về từ Google giữ cách cũ (map về 6 màu mặc định). Đổi màu trên Google → màu khác trên Daynest bị thay bằng màu Google.
- Bản app cũ không hiểu mã hex → migration S4 tăng `app_config.min_version_code` (bản cũ hiện màn "Cần cập nhật").

## Màn hình

```text
Tab Chi tiêu
├─ [Ngày | Tuần | Tháng]            (mặc định Tháng, nhớ lựa chọn trên máy)
├─ ‹  Tháng 10, 2026  ›              (‹ › kỳ trước/sau · bấm nhãn → hộp chọn kỳ bất kỳ: Tháng = lưới 12 tháng + ‹ › năm · Tuần / Ngày = lịch nhỏ, Tuần chọn cả tuần chứa ngày bấm · nút "Tháng này" / "Tuần này" / "Hôm nay")
├─ Tổng chi: 4.250.000 ₫
├─ Theo ngày (Tháng, Tuần): cột mỗi ngày · bấm cột → chế độ Ngày của ngày đó
├─ 6 tháng gần đây (Tháng): cột mỗi tháng, tháng đang xem đậm · bấm cột → tháng đó
├─ Theo nhóm: icon · tên · thanh % · số tiền · %
├─ Danh sách (chỉ Ngày): khoản chi: icon nhóm · tên nhóm · ghi chú · số tiền · bấm → sửa
├─ nút nhóm (icon thẻ tag) góc trên phải → màn "Nhóm chi tiêu"
└─ nút + ở thanh tab → pop-up sẵn có (Sự kiện, Ghi chú) thêm "Khoản chi" ở dòng dưới → form Thêm khoản chi (từ S6: ở tab Chi tiêu nút + mở thẳng form này; pop-up chỉ còn ở Lịch, Cài đặt — [S6 §11](../sprint-6/index.md#11-nút--theo-tab))
Form khoản chi: số tiền (chữ to, đầu màn) · dòng nhóm (icon + tên ›, bấm → hộp chọn nhóm + "Thêm nhóm") · ngày · ghi chú · Lưu  (sửa: thêm "Xoá")
Màn Nhóm chi tiêu: nhóm có sẵn (khoá) · nhóm của bạn (bấm để sửa, ⋯ → Xoá) · "+ Thêm nhóm"
```

- Tuần bắt đầu theo Cài đặt hiện có (`week_start`). Ngày tính theo múi giờ trong Cài đặt.
- Kỳ trống: "Chưa có khoản chi" + nút "Thêm khoản chi" (ẩn tổng, biểu đồ, theo nhóm).
- Biểu đồ cột: 1 màu (`primary` nhạt, cột đang xem / hôm nay `primaryDark`) · chỉ ghi số trên cột cao nhất ("2,5tr", "510k") · trục ngày: Tuần ghi T2…CN, Tháng ghi 1, 5, 10, 15, 20, 25, ngày cuối · bấm giữ cột → hiện số tiền.
- Số tiền dài: tổng chi co chữ cho vừa 1 dòng; dòng khoản chi cắt ghi chú, không cắt số tiền.
- Tải dữ liệu: chỉ khoản chi của kỳ đang xem; cache trên máy + tải trước kỳ liền kề như Lịch (bản 3.0.1). Theo nhóm + theo ngày do app tự cộng từ danh sách đó · 6 tháng gần đây: 1 lệnh DB cộng sẵn theo tháng ([db.md](design/db.md)).
- Lỗi: theo [§5](../index.md#5-xử-lý-lỗi-chung) (mất mạng → khoá Lưu, lưu lỗi → toast, giữ form).

## Thiết kế

- [DB](design/db.md): bảng `expense_categories`, `expenses`, RLS, test tải.
- [Mockup S4](design/mockups.html) — 16 màn: tab Chi tiêu (Tháng, Tuần, Ngày + hộp chọn kỳ, kỳ trống, nút +), thêm / sửa / xoá khoản chi + chọn nhóm, nhóm chi tiêu.

## Xong khi (DoD)

- [x] Tab hiện "Chi tiêu" (VI) / "Expenses" (EN).
- [x] Thêm, sửa, xoá khoản chi trên máy thật · bấm Lưu 2 lần / gửi lại khi mạng chập chờn → không tạo trùng · sửa cùng lúc trên 2 máy → hộp "Đã thay đổi ở thiết bị khác". — *máy thật: [thử máy thật 2026-10-13](../../../wip/2026-10-13-s4-real-device-test.md)*
- [x] User cũ và user mới đều có 3 nhóm có sẵn, tên đổi theo ngôn ngữ · thêm, đổi tên, xoá nhóm tự tạo → khoản chi trong nhóm bị xoá theo. — *máy thật (user cũ; user mới: test RLS): [thử máy thật 2026-10-13](../../../wip/2026-10-13-s4-real-device-test.md)*
- [x] Ngày / Tuần / Tháng: tổng chi, theo ngày, theo nhóm, 6 tháng gần đây khớp tổng các khoản chi · Tháng, Tuần không liệt kê khoản chi · chuyển kỳ ‹ › đúng, tuần theo `week_start`.
- [x] Màu bất kỳ: chọn được ở form event, danh mục note, nhóm chi tiêu · hiện đúng ở Lịch (tháng, tuần, ngày, danh sách), Ghi chú, Chi tiêu · chữ trên nền màu đậm đọc được · event màu khác đồng bộ lên Google thành màu gần nhất · bản cũ hiện "Cần cập nhật". — *máy thật: [thử máy thật 2026-10-13](../../../wip/2026-10-13-s4-real-device-test.md) · "màu gần nhất" theo RGB thô cho kết quả lạ (đỏ đậm → xám), xem finding*
- [x] Test RLS: A không đọc/sửa/xoá được nhóm, khoản chi của B · không gắn khoản chi vào nhóm của B.
- [x] Test tải đạt (0 lỗi, p95 < 1 s) · đo dung lượng DB thật → cập nhật [§3](../index.md#mục-tiêu-tải).
- [x] Hàm thuần (khoảng ngày của kỳ, cộng theo nhóm / theo ngày, định dạng / đọc số tiền, số gọn "2,5tr") có test Jest.
- [x] `npm run typecheck && npm run lint && npm test` qua.
- [x] Cuối sprint: release theo [Spec tổng §4](../index.md#cuối-sprint-mọi-sprint).
