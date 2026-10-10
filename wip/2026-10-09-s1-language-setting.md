# 2026-10-09 — S1: thêm cài đặt ngôn ngữ (Việt / Anh) — ✅ xong

**Đã chốt:**

- Hỗ trợ 2 ngôn ngữ: tiếng Việt và tiếng Anh.
- Mặc định tiếng Anh.
- Lưu lựa chọn trên máy để màn Đăng nhập dùng được. Sau khi đăng nhập, đồng bộ vào `user_settings.language` để đổi máy vẫn giữ.

**Việc cần làm:**

- [x] `F1-app-shell.md`: thêm mục i18n.
  - Dùng `i18next` + `react-i18next`; file chữ `locales/en.json`, `locales/vi.json`.
  - Mở app: đọc ngôn ngữ trên máy (AsyncStorage), chưa có thì dùng `en`.
  - Đăng nhập xong: nếu DB có `language` thì áp dụng và ghi về máy.
  - Đổi trong Cài đặt: đổi ngay, không cần mở lại app; ghi máy + DB.
- [x] `design/db.md`: `user_settings` thêm cột `language text` mặc định `'en'`, chỉ nhận `'en'` hoặc `'vi'`, dùng từ S1.
- [x] `design/screens.md`:
  - Màn 7 (Cài đặt) thêm dòng "Ngôn ngữ".
  - Thêm màn 9: bảng chọn ngôn ngữ, trượt từ dưới lên, có 2 lựa chọn: English, Tiếng Việt.
- [x] `sprint-1/index.md`: thêm dòng vào DoD: "Đổi ngôn ngữ Việt ↔ Anh, chữ đổi ngay; đăng nhập trên máy khác vẫn giữ lựa chọn."
- [x] `specs/index.md` §2 Quyết định chung: thêm dòng "Ngôn ngữ: EN (mặc định) + VI".
- [x] `mockups.html`:
  - Màn Cài đặt thêm dòng Ngôn ngữ, hiển thị "Tiếng Việt" vì mockup đang dùng tiếng Việt.
  - Thêm màn 9 là bảng chọn ngôn ngữ.
  - Các màn khác giữ chữ tiếng Việt.
- [x] `mockups.html`: đổi chữ ở 3 tab trống sang kiểu "đang phát triển", không nhắc số sprint.
  - Lịch: "Lịch đang phát triển".
  - Quản lý: "Việc cần làm, ghi chú, nhật ký đang phát triển".
  - Thống kê: "Thống kê đang phát triển".
  - Dòng mô tả của cả 3 tab: "Tính năng này đang được phát triển. Bạn quay lại sau nhé!"
  - Chip và toast nút `+` đổi từ "Sắp có" thành "Đang phát triển". Cập nhật `screens.md` và `F1-app-shell.md` cho khớp.
- [x] Logo tạm: đổi icon tờ lịch thành **sổ ghi chú**. Mục xoay 180° bỏ, vì đã thay hình.
  - Hình: cuốn sổ trắng đứng, có gáy lò xo (các khoen tròn) bên trái, 3 dòng kẻ màu `primary`, góc phải dưới có chấm tròn nhỏ màu `event.pink` cho dễ thương. Nét bo tròn, đặt trên ô nền `primary` như cũ.
  - `mockups.html`: thay SVG logo ở màn Splash và màn Đăng nhập.
  - `design-system.md` mục Logo tạm: sửa mô tả icon.
- [x] `design-system.md`: thêm thành phần "Bảng chọn từ dưới lên".
- [x] Kiểm tra: chụp mockup bằng Chrome headless, đủ 9 màn; không có link hỏng.
- [x] Gộp vào commit `docs: add design system and sprint-1 mockups` (todo trước, chưa commit) sau khi bạn ok mockup.
