# Design system

Thuộc: [Spec tổng](index.md). Dùng chung cho mọi sprint.

- Phong cách: dễ thương, pastel, bo tròn — tinh thần giống Cute Calendar.
- Không chép sticker, icon, hình minh hoạ của app gốc.
- Chỉ làm theme sáng. Chế độ tối để sau.
- Mockup áp dụng: [Sprint 1](sprint-1/design/mockups.html).

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

**6 màu event (S3):**

| Token | Giá trị |
| --- | --- |
| `event.mint` | `#7FD1B0` |
| `event.sky` | `#8CC8EE` |
| `event.lavender` | `#B9A6EC` |
| `event.pink` | `#F4A6C0` |
| `event.peach` | `#F7BE8A` |
| `event.lemon` | `#F2D67A` |

- Thanh event: nền màu event, chữ `text` (không dùng chữ trắng trên pastel — khó đọc).

## Chữ

- Font: **Nunito** (Google Fonts, đủ dấu tiếng Việt). Expo: `@expo-google-fonts/nunito`.
- Đậm: 600 cho nội dung nhấn, 800 cho tiêu đề.

| Token | Cỡ / dòng | Đậm | Dùng cho |
| --- | --- | --- | --- |
| `title` | 22 / 28 | 800 | Tiêu đề màn hình |
| `heading` | 17 / 24 | 700 | Tiêu đề thẻ, nhóm |
| `body` | 15 / 22 | 600 | Nội dung, dòng cài đặt |
| `caption` | 12 / 16 | 600 | Nhãn tab, chú thích, version |

## Khoảng cách và bo góc

- Bước 4px: `4 · 8 · 12 · 16 · 24 · 32`.
- Lề màn hình: 16.
- Bo góc: thẻ 20, nút 16 (nút cao 48), chip 999, hộp thoại 24.
- Bóng: rất nhẹ — `0 4 12 rgba(47,45,51,0.06)`.

## Icon

- Bộ `Ionicons` trong `@expo/vector-icons`, kiểu nét (`-outline`); tab đang chọn dùng bản đặc.
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

## Quy tắc đồng bộ

- Mọi màn chỉ dùng token ở file này: màu, cỡ chữ (22 / 17 / 15 / 12), khoảng cách, bo góc. Không dùng mã màu hay cỡ chữ khác (trừ chữ logo).
- Cùng 1 loại thành phần → cùng kiểu ở mọi màn (tiêu đề màn, thẻ, dòng cài đặt, hộp thoại, toast).
- Màu điểm nhấn chung là `primary`. Không gán mỗi tab/mục một màu riêng.
- Màu event chỉ dùng cho event (S3+) và chấm hồng trong logo.
- Màu `error` chỉ cho lỗi và hành động nguy hiểm (Đăng xuất, Xoá).

## Logo tạm

- Icon: ô vuông bo tròn nền `primary`, hình **sổ ghi chú** trắng đứng, gáy lò xo bên trái, 3 dòng kẻ `primary`, chấm tròn `event.pink` ở góc phải dưới — vẽ SVG đơn giản.
- Chữ: "Daynest" Nunito 800, cỡ 30 (riêng logo), màu `text`.
- Logo thật làm trước khi lên store.
