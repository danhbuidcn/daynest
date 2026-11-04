# Sprint 8 — Thu / Chi

Thuộc: [Spec tổng](../index.md) · Chốt phạm vi: [wip](../../../wip/2026-11-04-income-expense-type.md).

## Mục tiêu

Ngoài khoản chi, người dùng ghi được khoản thu (lương, tiền kiếm được…). Ví dụ: đầu tháng chi 1đ vào việc A, sau đó kiếm được 2đ → 1 khoản Chi 1đ + 1 khoản Thu 2đ.

## Đã chốt

| Chủ đề | Chốt |
| --- | --- |
| Loại | 2 loại: **Chi** (`expense`) và **Thu** (`income`) · chọn ở form thêm / sửa · **mặc định Chi** |
| Số tiền | Luôn nhập số dương · loại quyết định dấu |
| Danh mục | Thu dùng **chung** danh mục với Chi |
| Tổng tháng | Hiện **cả hai** tổng: Thu và Chi · biểu đồ 6 tháng tách hai loại |
| Ngân sách | Còn lại = hạn mức + tổng Thu − tổng Chi (Thu làm tăng ngân sách) |
| Khoản lặp lại | Có chọn Thu / Chi (mặc định Chi) · khoản tự ghi mang đúng loại của quy tắc |
| Dữ liệu cũ | Mọi khoản đã có là Chi |
| Bản app cũ | Phải cập nhật (bản cũ sẽ tính khoản Thu thành Chi) → tăng `min_version_code` |

## Phạm vi

| # | Việc | Chi tiết |
| --- | --- | --- |
| 1 | DB | Cột `kind` ở `expenses` và `expense_recurrences` · `generate_due_expenses` chép `kind` · `expense_monthly_totals` trả tổng theo `kind` — [db.md](design/db.md) |
| 2 | Form thêm / sửa | Chọn Thu / Chi (mặc định Chi) ở form khoản chi và form khoản lặp lại |
| 3 | Tổng + danh sách | Màn Chi tiêu: tổng Thu, tổng Chi, danh sách hiện loại (màu + dấu) · tổng theo nhóm và biểu đồ ngày tính theo Chi, có chuyển sang Thu |
| 4 | Ngân sách | `BudgetBar`: còn lại = hạn mức + Thu − Chi |
| 5 | Biểu đồ 6 tháng | Mỗi tháng 2 cột: Thu, Chi |

Mockup: [mockups.html](design/mockups.html) (11 màn) — chờ duyệt. Chi giữ nguyên cách hiện cũ; Thu có dấu `+` và màu `primaryDark`. Thanh chọn Chi | Thu: Chi nền `errorSoft`, Thu nền `primary`.

## Definition of Done

- [ ] Tạo được khoản Thu và khoản Chi; mặc định là Chi.
- [ ] Sửa được loại của khoản đã có.
- [ ] Khoản lặp lại Thu tự ghi đúng loại Thu.
- [ ] Tổng tháng hiện đúng Thu và Chi; ngân sách còn lại = hạn mức + Thu − Chi.
- [ ] Biểu đồ 6 tháng có cột Thu và Chi.
- [ ] Dữ liệu cũ đều là Chi, tổng không đổi so với trước.
- [ ] Bản cũ hơn thấy màn "Cần cập nhật".
- [ ] i18n `en.json` + `vi.json` cùng khoá; `npm run typecheck && npm run lint && npm test` qua.
- [ ] Thử trên máy thật.
