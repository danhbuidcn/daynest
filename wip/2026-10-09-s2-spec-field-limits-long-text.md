# 2026-10-09 — S2 spec: giới hạn ký tự mọi field + cách hiển thị chữ dài — ✅ xong

Bạn yêu cầu: field nào cũng có giới hạn ký tự; chữ dài hiện hết hoặc 1 phần để không vỡ giao diện.

**Giới hạn (nhập trong app):**

| Field | Giới hạn | Đã có trong spec? |
| --- | --- | --- |
| Tên hiển thị (S1) | 1–50 | Có |
| Tiêu đề event | 1–100 | Có |
| Chi tiết event | ≤ 2000 | Có |
| Tiêu đề note | ≤ 200 | Có |
| Nội dung note | ≤ 20.000 | Có |
| Mục checklist | ≤ 200 / mục, ≤ 100 mục | Có |
| Tên danh mục | 1–30 | Có |
| Ô tìm kiếm note | ≤ 100 | **Mới** |
| Số N lặp | 1–99 | Có |

- Ô nhập dùng `maxLength` (dán chữ dài → tự cắt). Gõ tới ≥ 80% giới hạn → hiện bộ đếm "85/100" dưới ô; chạm giới hạn → đếm màu `error`.
- Cắt khoảng trắng 2 đầu trước khi lưu; chỉ toàn khoảng trắng = trống.
- DB `check` cùng giới hạn để chặn ghi sai từ API.
- **Event từ Google** (không theo giới hạn của app): DB cho tiêu đề ≤ 1000, chi tiết ≤ 8000 (đủ cho gần như mọi event Google); dài hơn → cắt lúc kéo về và đánh dấu chỉ xem (không đẩy bản cắt ngược lên Google). Sửa event Google có tiêu đề > 100 trong app → phải rút gọn ≤ 100 mới lưu được (báo lỗi dưới ô).

**Hiển thị chữ dài:**

| Chỗ hiện | Cách hiện |
| --- | --- |
| Thanh event (ô tháng), tên lễ trong ô | 1 dòng, `…` |
| Thẻ event (tuần, danh sách, pop-up ngày) | Tiêu đề 1 dòng `…` · chi tiết 1 dòng `…` |
| Khối event (xem ngày) | Tiêu đề xuống dòng vừa chiều cao khối, dư thì `…` |
| Chi tiết event, editor note | **Hiện hết**, xuống dòng, cuộn màn |
| Ô tiêu đề trong form event | Tự giãn tối đa 3 dòng, quá thì cuộn trong ô |
| Ô chi tiết event | Tự giãn tối đa 6 dòng, quá thì cuộn trong ô |
| Thẻ note | Tiêu đề 1 dòng `…` · nội dung 3 dòng `…` |
| Mục checklist (editor) | Hiện hết, xuống dòng |
| Chip danh mục, tên danh mục trong dòng | 1 dòng `…`, chip rộng tối đa 140 |
| Tên trong hộp xác nhận (vd "Xoá danh mục …?") | Tối đa 2 dòng `…` |
| Thông báo nhắc (hệ điều hành) | Tiêu đề event cắt 1 dòng do hệ điều hành |
| Toast | Tối đa 2 dòng |

- Chữ không có khoảng trắng (URL, chuỗi dài) cũng phải xuống dòng/cắt, không tràn ngang.

**Plan:**

- [x] 1. `design-system.md`: thêm mục "Chữ dài" (quy tắc chung: 1 dòng `…`, N dòng, hiện hết + cuộn; bộ đếm ký tự; không tràn ngang).
- [x] 2. `sprint-2/design/screens.md`: thêm bảng "Giới hạn ký tự + hiển thị" (2 bảng trên), F2/F5 trỏ tới bảng này thay vì ghi rải rác (bỏ lặp).
- [x] 3. `design/db.md` + `F4-google-calendar.md`: giới hạn DB cho event Google (≤ 1000 / ≤ 8000), cắt + chỉ xem khi dài hơn.
- [x] 4. `mockups.html`: thêm 1 màn "Chữ dài" — ô tháng + thẻ event + thẻ note + chip danh mục với chữ dài, và ô tiêu đề có bộ đếm "92/100".
- [x] 5. Kiểm tra: chụp mockup, không tràn; không link hỏng. Commit `docs: add field limits and long text rules`, push.
