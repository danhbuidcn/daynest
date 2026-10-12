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
| 4 | Xem theo Ngày / Tuần / Tháng | Tổng chi của kỳ · danh sách khoản chi theo từng ngày |
| 5 | Thống kê theo nhóm | Trong kỳ đang xem: mỗi nhóm số tiền + % + thanh ngang, xếp nhiều → ít |

**Không làm ở S4:** khoản thu, vay/nợ, nhiều ví, số dư, ngân sách, giao dịch định kỳ, tìm kiếm, nhiều loại tiền, biểu đồ tròn, so sánh các tháng, xuất file, thùng rác.

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
- **Nhóm tự tạo:** tên 1–30 ký tự (không trùng, không phân biệt hoa thường) · chọn 1 trong 6 màu event · icon chung (thẻ tag) · tối đa 30 nhóm tự tạo.
- Đổi tên / đổi màu nhóm tự tạo: bấm vào nhóm trong màn Nhóm.
- Xoá nhóm tự tạo: hộp xác nhận "Xoá nhóm "X"?" · "n khoản chi cũng sẽ bị xoá." (không có khoản chi → chỉ tiêu đề) → xoá nhóm + xoá hẳn mọi khoản chi trong nhóm (1 lệnh DB, xem [db.md](design/db.md)).

## Màn hình

```text
Tab Chi tiêu
├─ [Ngày | Tuần | Tháng]            (mặc định Tháng, nhớ lựa chọn trên máy)
├─ ‹  Tháng 10, 2026  ›              (bấm nhãn → về kỳ hiện tại)
├─ Tổng chi: 4.250.000 ₫
├─ Theo nhóm: icon · tên · thanh % · số tiền · %   (ẩn khi kỳ trống)
├─ Danh sách: tiêu đề ngày ("Hôm nay", "T2, 12/10") + tổng ngày
│              └─ khoản chi: icon nhóm · tên nhóm · ghi chú · số tiền (đỏ)
├─ ⋯ góc trên phải → "Nhóm chi tiêu"
└─ nút + → form Thêm khoản chi
Form khoản chi: số tiền (chữ to, đầu màn) · lưới nhóm (icon + tên, cuộn ngang 2 hàng) · ngày · ghi chú · Lưu  (sửa: thêm "Xoá")
Màn Nhóm chi tiêu: nhóm có sẵn (khoá) · nhóm của bạn (bấm để sửa, ⋯ → Xoá) · "+ Thêm nhóm"
```

- Tuần bắt đầu theo Cài đặt hiện có (`week_start`). Ngày tính theo múi giờ trong Cài đặt.
- Kỳ trống: "Chưa có khoản chi" + nút "Thêm khoản chi".
- Số tiền dài: tổng chi co chữ cho vừa 1 dòng; dòng khoản chi cắt ghi chú, không cắt số tiền.
- Tải dữ liệu: chỉ khoản chi của kỳ đang xem; cache trên máy + tải trước kỳ liền kề như Lịch (bản 3.0.1). Thống kê theo nhóm do app tự cộng từ danh sách đó (không gọi thêm API).
- Lỗi: theo [§5](../index.md#5-xử-lý-lỗi-chung) (mất mạng → khoá Lưu, lưu lỗi → toast, giữ form).

## Thiết kế

- [DB](design/db.md): bảng `expense_categories`, `expenses`, RLS, test tải.
- Mockup: `design/mockups.html` — làm ở bước sau (tab Chi tiêu 3 chế độ, form, màn Nhóm, kỳ trống).

## Xong khi (DoD)

- [ ] Tab hiện "Chi tiêu" (VI) / "Expenses" (EN).
- [ ] Thêm, sửa, xoá khoản chi trên máy thật · bấm Lưu 2 lần / gửi lại khi mạng chập chờn → không tạo trùng · sửa cùng lúc trên 2 máy → hộp "Đã thay đổi ở thiết bị khác".
- [ ] User cũ và user mới đều có 3 nhóm có sẵn, tên đổi theo ngôn ngữ · thêm, đổi tên, xoá nhóm tự tạo → khoản chi trong nhóm bị xoá theo.
- [ ] Ngày / Tuần / Tháng: tổng chi và thống kê theo nhóm khớp tổng các khoản chi trong kỳ · chuyển kỳ ‹ › đúng, tuần theo `week_start`.
- [ ] Test RLS: A không đọc/sửa/xoá được nhóm, khoản chi của B · không gắn khoản chi vào nhóm của B.
- [ ] Test tải đạt (0 lỗi, p95 < 1 s) · đo dung lượng DB thật → cập nhật [§3](../index.md#mục-tiêu-tải).
- [ ] Hàm thuần (khoảng ngày của kỳ, cộng theo nhóm, định dạng / đọc số tiền) có test Jest.
- [ ] `npm run typecheck && npm run lint && npm test` qua.
- [ ] Cuối sprint: release theo [Spec tổng §4](../index.md#cuối-sprint-mọi-sprint).
