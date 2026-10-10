# 2026-10-09 — Sprint 1: thiết kế (design system + mockup) — ✅ xong

**Đã chốt:** phong cách dễ thương, pastel. Không chép sticker, icon hay hình của app gốc.

- [x] Viết `docs/specs/design-system.md`, dùng chung cho mọi sprint, gạch đầu dòng ngắn:
  - **Màu:**
    - màu chính pastel, màu nền, màu chữ;
    - 6 màu event (S3 dùng);
    - màu báo thành công, lỗi, cảnh báo;
    - chỉ làm theme sáng, chế độ tối để sau.
  - **Chữ:**
    - 1 font sans bo tròn, hỗ trợ đủ tiếng Việt (vd Nunito);
    - cỡ chữ cho tiêu đề, nội dung, chú thích.
  - **Khoảng cách và bo góc:** bước 4px; bo góc lớn cho thẻ và nút.
  - **Icon:** một bộ có sẵn trong Expo (`@expo/vector-icons`), kiểu nét tròn.
  - **Thành phần dùng chung:** nút chính và nút phụ, thẻ, thanh tab có nút `+` nổi, toast, hộp xác nhận, dòng cài đặt.
  - **Logo tạm:** chữ "Daynest" kèm 1 icon đơn giản. Logo thật làm trước khi lên store.
- [x] Vẽ mockup `docs/specs/sprint-1/design/mockups.html`:
  - 1 file HTML gồm 8 màn S1, đặt trong khung điện thoại 360×780 (Android), theo `screens.md`;
  - chữ trên giao diện bằng tiếng Việt;
  - dùng đúng màu, chữ, thành phần trong design system;
  - mở bằng trình duyệt, không cần cài gì.
- [x] `screens.md`: thêm link tới mockup. `docs/index.md`: thêm dòng cho `design-system.md`.
- [x] Kiểm tra:
  - mở `mockups.html` trong trình duyệt, đủ 8 màn, không lỗi hiển thị;
  - không còn link hỏng.
- [x] Gửi bạn xem mockup. Bạn góp ý thì sửa, ok thì sang bước code S1 (todo riêng).
- [x] Commit `docs: add design system and sprint-1 mockups` kèm Co-Authored-By, push.
