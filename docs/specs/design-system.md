# Design system

Thuộc: [Spec tổng](index.md). Dùng chung cho mọi sprint.

- Phong cách: dễ thương, pastel, bo tròn.
- Không chép sticker, icon, hình minh hoạ của app gốc.
- Chỉ làm theme sáng. Chế độ tối để sau.
- Mockup áp dụng: [Sprint 1](sprint-1/design/mockups.html), [Sprint 2](sprint-2/design/mockups.html), [Sprint 3](sprint-3/design/mockups.html), [Sprint 4](sprint-4/design/mockups.html).

## Màu

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `primary` | `#5BBE98` | Nút `+`, tab đang chọn, nút chính, điểm nhấn |
| `primaryDark` | `#3E9E7A` | Nút chính khi bấm, chữ link |
| `primarySoft` | `#E3F5EC` | Nền ô được chọn, nền chip |
| `bg` | `#FAF8F5` | Nền màn hình (trắng ngà) |
| `surface` | `#FFFFFF` | Thẻ, thanh tab, hộp thoại |
| `border` | `#EFEAE3` | Viền thẻ, đường kẻ |
| `text` | `#2F2D33` | Chữ chính |
| `textMuted` | `#8C8794` | Chữ phụ, tab chưa chọn |
| `success` | `#5BBE98` | Báo thành công (trùng `primary`) |
| `error` | `#E9787B` | Báo lỗi, nút Đăng xuất |
| `warning` | `#F2B45C` | Cảnh báo |

**6 màu event (từ S2; dùng cả cho danh mục note, nhóm chi tiêu):**

| Token | Giá trị |
| --- | --- |
| `event.mint` | `#7FD1B0` |
| `event.sky` | `#8CC8EE` |
| `event.lavender` | `#B9A6EC` |
| `event.pink` | `#F4A6C0` |
| `event.peach` | `#F7BE8A` |
| `event.lemon` | `#F2D67A` |

- Thanh event: nền màu event, chữ `text` (không dùng chữ trắng trên pastel — khó đọc).
- Từ S4 user chọn được **màu bất kỳ** (mã hex) ngoài 6 màu trên → chữ / icon trên nền màu tự chọn `text` hoặc trắng, cái nào tương phản ≥ 4,5:1.

## Chữ

- Font: **Nunito** (Google Fonts, đủ dấu tiếng Việt). Expo: `@expo-google-fonts/nunito`.
- Đậm: 600 cho nội dung nhấn, 800 cho tiêu đề.

| Token | Cỡ / dòng | Đậm | Dùng cho |
| --- | --- | --- | --- |
| `title` | 22 / 28 | 800 | Tiêu đề màn hình |
| `heading` | 17 / 24 | 700 | Tiêu đề thẻ, nhóm |
| `body` | 15 / 22 | 600 | Nội dung, dòng cài đặt |
| `caption` | 12 / 16 | 600 | Nhãn tab, chú thích, version |
| `micro` | 10 / 12 | 600 | Ngày âm trong ô lịch tháng |

## Khoảng cách và bo góc

- Bước 4px: `4 · 8 · 12 · 16 · 24 · 32`.
- Lề màn hình: 16.
- Bo góc: thẻ 20, nút 16 (nút cao 48), chip 999, hộp thoại 24.
- Bóng: rất nhẹ — `0 4 12 rgba(47,45,51,0.06)`.

## Icon

- Bộ icon riêng, nét tròn, vẽ bằng SVG: `app/src/components/Icon.tsx` (`react-native-svg`). Path giống hệt mockup (`sprint-*/design/mockups.html`) — thêm icon mới thì thêm cả 2 nơi. Không dùng Ionicons.
- Tab đang chọn dùng bản đặc (`filled`).
- Cỡ: 24 (tab, dòng cài đặt), 28 (nút `+`).
- Icon dòng cài đặt đặt trong ô vuông bo 10, nền `primarySoft`.

## Thành phần dùng chung

| Thành phần | Mô tả |
| --- | --- |
| Nút chính | Nền `primary`, chữ trắng 15/700, cao 48, bo 16, rộng hết dòng |
| Nút phụ | Nền `surface`, viền `border`, chữ `text` |
| Nút nguy hiểm | Nền `error` nhạt (`#FCE8E8`), chữ `error` |
| Thẻ | Nền `surface`, bo 20, bóng nhẹ, padding 16 |
| Thanh tab | Nền `surface`, cao 64, 4 tab + nút `+` tròn 56 nổi giữa, nền `primary` |
| Toast | Viên thuốc nền `text`, chữ trắng, hiện đáy màn (trên thanh tab), tự ẩn 2 giây; lỗi có chấm `error` |
| Hộp xác nhận | Nền mờ `rgba(47,45,51,0.4)`, hộp `surface` bo 24, tiêu đề + mô tả + 2 nút (Huỷ / hành động) |
| Dòng cài đặt | Icon ô `primarySoft` + icon `primaryDark` (dòng nguy hiểm: `error` nhạt + `error`) + nhãn + giá trị/`›` bên phải, cao 56, kẻ `border` giữa các dòng |
| Ảnh đại diện mặc định | Hình tròn nền `primary`, chữ cái đầu màu trắng |
| Thanh tiêu đề màn con | Nút quay lại `‹` bên trái + tiêu đề `title` ở giữa |
| Ô nhập | Nhãn `caption` ở trên, ô cao 48 bo 16 nền `surface` viền `border` (đang nhập: viền `primary`), gợi ý `caption` `textMuted` ở dưới · ô khoá: nền `bg`, chữ `textMuted`, icon khoá |
| Hộp chọn | Cùng kiểu Hộp xác nhận (nền mờ, hộp giữa màn bo 24) · tiêu đề + danh sách lựa chọn cao 56, mục đang chọn nền `primarySoft` + dấu ✓ `primary` · bấm là chọn + đóng, không có nút xác nhận |

### Thành phần thêm ở S2

| Thành phần | Mô tả |
| --- | --- |
| Thanh chọn chế độ | Segmented cao 40, nền `border`, bo 16 · 4 mục Tháng · Danh sách · Tuần · Ngày · mục chọn nền `primary` chữ trắng 700, mục khác chữ `text` |
| Header lịch | `‹` · tiêu đề `title` ("Tháng 10, 2026") bấm được · `›` · bên phải nút "Hôm nay" (chip `primarySoft`, chữ `primaryDark`) |
| Ô lịch tháng | Không viền ngoài, kẻ `border` giữa các ô · ngày âm `micro` `textMuted` hàng trên cùng, căn phải · số dương `body` hàng dưới, căn trái (mùng 1 / rằm: `primaryDark`) · tên lễ `caption` `error` 1 dòng · tối đa 3 thanh event + "+N" `caption` `textMuted` |
| Trạng thái ô | Hôm nay: số trong vòng tròn 24 nền `primary` chữ trắng · đang chọn: nền ô `primarySoft` · ngày tháng khác: mờ 40% · CN + ngày lễ: số `error` |
| Thanh event | Cao 16, bo 6, nền màu event, chữ `caption` `text` 1 dòng, padding ngang 4 |
| Thẻ event | Nền `surface`, bo 16, vạch trái 4 màu event · tiêu đề `body` · giờ `caption` `textMuted` · icon trạng thái bên phải |
| Khối event (xem ngày) | Như thẻ event, cao theo thời lượng (1 giờ = 56), nền màu event nhạt 30% |
| Icon trạng thái event | Cỡ 14, `textMuted`: lặp, nhắc, Google, chờ đồng bộ, chỉ trên Daynest (vẽ theo mockup S2) |
| Sheet từ đáy | Nền mờ như hộp thoại · tấm `surface` bo trên 24, thanh kéo 36×4 `border` · đầu tấm: Huỷ bỏ (`textMuted`) · tiêu đề `heading` · Hoàn tất (`primaryDark` 700) · dùng cho chọn mốc nhắc |
| Pop-up có tiêu đề | Như hộp chọn (giữa màn, bo 24) · đầu hộp: ✕ bên trái · tiêu đề `heading` giữa · nút `+` tròn `primary` bên phải (nếu có) · dùng cho pop-up ngày, pop-up `+`, chọn tháng/năm |
| Công tắc | 44×26, bo 999 · bật nền `primary`, tắt nền `border` · nút tròn trắng 22 có bóng nhẹ |
| Dòng cài đặt có công tắc | Như dòng cài đặt, bên phải là công tắc thay cho giá trị/`›` |
| Dòng cảnh báo | Nền `warning` nhạt (`#FDF1DE`), chữ `text`, icon `warning`, bo 16 |
| Chip danh mục | Cao 32, bo 999, viền `border`, chấm màu danh mục 8 trước chữ · đang chọn: nền `primary` chữ trắng |
| Thẻ note | Thẻ bo 20, padding 12, vạch trái 4 màu danh mục (không danh mục: `border`) · tiêu đề `heading` 1 dòng · nội dung `body` `textMuted` 3 dòng hoặc "2/5 mục" · ngày sửa `caption` · icon ghim `primaryDark` góc phải trên |
| Dòng checklist | Cao 44 · tay nắm ⋮⋮ 18 `textMuted` bên trái (giữ để kéo đổi thứ tự) · ô tick **vuông** 22 bo 6 viền `primary` (xong: nền `primary` + ✓ trắng, chữ gạch ngang `textMuted`) · chữ `body` · ✕ `textMuted` |
| Lưới giờ | Cột giờ 44 `caption` `textMuted` · kẻ `border` mỗi giờ · vạch giờ hiện tại 2px `error` + chấm tròn |

### Thành phần thêm ở S4

| Thành phần | Mô tả |
| --- | --- |
| Thanh chọn kỳ | Như thanh chọn chế độ S2, 3 mục Ngày · Tuần · Tháng |
| Header kỳ | `‹` · nhãn `title` bấm được (mở hộp chọn kỳ) · `›` · không có chip "Hôm nay" — nút về kỳ hiện tại nằm trong hộp chọn |
| Hộp chọn kỳ | Như hộp chọn · Tháng: lưới 3×4 tháng + `‹ ›` năm · Tuần / Ngày: lịch nhỏ 7 cột, tuần đang chọn nền `primarySoft` cả hàng, ngày đang chọn vòng tròn `primary` · nút phụ "Tháng này" / "Tuần này" / "Hôm nay" ở đáy |
| Ô icon nhóm | Vuông 34 bo 10, nền màu nhóm, icon 20 màu chữ theo độ sáng nền |
| Dòng thống kê nhóm | Ô icon · tên `body` · số tiền `body` 700 bên phải · dưới tên: thanh % cao 6 bo 999 (nền `border`, phần đầy màu nhóm) · % `caption` `textMuted` bên phải |
| Biểu đồ cột | 1 chuỗi, 1 màu: `primary` nhạt 55%, cột đang chọn / hiện tại `primaryDark` · đầu cột bo 4, cách nhau 2 · chỉ ghi số gọn ("2,5tr", "510k") `micro` trên cột cao nhất · nhãn trục `caption` `textMuted` · bấm cột → mở kỳ đó, bấm giữ → hiện số tiền |
| Số tiền | Luôn màu `text` (không đỏ — `error` chỉ cho lỗi) · dạng "50.000 ₫" · ô nhập số tiền: `title` giữa màn, gạch chân `primary` |
| Lưới chọn icon | 6 cột, ô 40 bo 12 nền `bg`, icon 22 · đang chọn: nền màu nhóm + viền 2 `text` cách 2 · cuộn trong ô (cao 3 hàng) |
| Hàng màu | 6 chấm màu event 28 + chấm "Màu khác" (vòng cầu vồng có dấu `+`; đã chọn màu khác → chấm hiện màu đó) · đang chọn: viền 2 `text` cách 3 |
| Hộp chọn màu | Như hộp chọn · ô sáng/đậm cao 150 bo 16 · thanh màu cao 16 bo 999 · ô màu 48 + ô nhập hex + chip "Aa" xem trước chữ · nút Huỷ / Chọn |

## Chữ dài

- Mọi ô nhập có giới hạn ký tự (`maxLength`; dán chữ dài → tự cắt). Gõ tới ≥ 80% giới hạn → bộ đếm `caption` `textMuted` dưới ô bên phải ("85/100"); chạm giới hạn → đếm màu `error`.
- Cắt khoảng trắng 2 đầu trước khi lưu; chỉ toàn khoảng trắng = trống.
- Chỗ chật (dòng, thẻ, chip, ô lịch): cắt theo số dòng cố định, cuối dòng `…` (`numberOfLines`).
- Chỗ đọc chính (chi tiết, editor): hiện hết, xuống dòng, cuộn màn.
- Ô nhập nhiều dòng: tự giãn tới số dòng tối đa, quá thì cuộn trong ô.
- Chuỗi không có khoảng trắng (URL…) vẫn phải xuống dòng/cắt, không tràn ngang.
- Bảng chi tiết từng field: [S2 screens.md](sprint-2/design/screens.md#giới-hạn-ký-tự-và-hiển-thị-chữ-dài).

## Câu chữ

- Lịch sự, trang trọng vừa phải, đơn giản, dễ hiểu. Tiếng Việt và tiếng Anh cùng giọng.
- Ngắn: tiêu đề hộp là câu hỏi ngắn ("Tắt đồng bộ?"); mô tả tối đa 1 câu, chỉ nói điều người dùng cần biết; không lặp ý của tiêu đề.
- Không dùng khẩu ngữ, từ suồng sã: "cho nhau", "về" (thay "được chuyển sang"), "luôn", "nha", "nhé", "xịn".
- Không dùng từ kỹ thuật với người dùng: "sync token", "pending", "server", "API".
- Dùng "được" cho kết quả trung tính/tốt ("được giữ", "được chuyển"), "bị" cho kết quả không mong muốn ("bị xoá", "bị đăng xuất").
- Tên nút là động từ rõ việc: "Xoá", "Tắt", "Đã hiểu" — không dùng "OK", "Có/Không".

## Quy tắc đồng bộ

- Mọi màn chỉ dùng token ở file này: màu, cỡ chữ (22 / 17 / 15 / 12), khoảng cách, bo góc. Không dùng mã màu hay cỡ chữ khác (trừ chữ logo).
- Cùng 1 loại thành phần → cùng kiểu ở mọi màn (tiêu đề màn, thẻ, dòng cài đặt, hộp thoại, toast).
- Màu điểm nhấn chung là `primary`. Không gán mỗi tab/mục một màu riêng.
- Màu event (và màu user tự chọn) chỉ dùng cho event, danh mục note, nhóm chi tiêu và chấm hồng trong logo.
- Màu `error` chỉ cho lỗi và hành động nguy hiểm (Đăng xuất, Xoá).
- Màn form (sửa, tạo mới): nút hành động chính cố định ở đáy màn, nội dung cuộn phía trên; mở bàn phím thì nút nằm trên bàn phím. Code: `FormScreen`.
- Màn con: vuốt từ mép trái sang phải để quay lại.

## Logo tạm

- Icon: ô vuông bo tròn nền `primary`, hình **sổ ghi chú** trắng đứng, gáy lò xo bên trái, 3 dòng kẻ `primary`, chấm tròn `event.pink` ở góc phải dưới — vẽ SVG đơn giản.
- Chữ: "Daynest" Nunito 800, cỡ 30 (riêng logo), màu `text`.
- Logo thật làm trước khi lên store.
