# Bỏ tên gói `com.danhbuidcn.daynest` khỏi trang chính sách

## Input
- Người dùng: tên gói trong trang chính sách quyền riêng tư là thông tin vô nghĩa với người đọc → bỏ.
- Tìm thấy 4 chỗ (2026-11-04):
  - [privacy/vi.html](../docs/site/privacy/vi.html) dòng 4
  - [privacy/en.html](../docs/site/privacy/en.html) dòng 4
  - [delete-account/index.html](../docs/site/delete-account/index.html) dòng 6 (EN) và 16 (VI)

## Plan
- [x] 1. Bỏ `(<code>com.danhbuidcn.daynest</code>)` ở 4 chỗ, giữ nguyên phần còn lại của câu.
- [x] 2. `grep` lại: không còn tên gói trong `docs/site/`.
- [x] 3. Commit `docs: remove package name from privacy and delete-account pages` + push.

## Lưu ý
- Trang xoá tài khoản cũng là URL công khai khai báo với Google Play; Play không đòi tên gói trên trang, nên bỏ được. Nếu bạn chỉ muốn sửa trang chính sách, nói tôi để bỏ bước delete-account.

## Kết quả
Xong 2026-11-04: bỏ ở 4 chỗ; `grep danhbuidcn docs/site` chỉ còn email liên hệ.
