# 2026-10-09 — Sửa chữ bị cắt trên Samsung (nút "Đăng xuất", "Tiếng Việt") — ✅ xong

- **Nguyên nhân:** Samsung đo chiều rộng chữ font Nunito thiếu. Từ cuối bị đẩy xuống dòng 2 rồi bị che. Cỡ chữ hệ thống = 1.0, không phải do cài đặt máy.
- [x] `AppText`: mặc định `textBreakStrategy="simple"` trên Android (cách sửa phổ biến cho lỗi này).
- [x] Chữ chỉ được 1 dòng thì đặt `numberOfLines={1}`: nhãn nút (`Button`), giá trị bên phải dòng cài đặt (`SettingRow`).
- [x] Kiểm tra trên điện thoại thật: hộp Đăng xuất, dòng Ngôn ngữ (VI + EN), nút Lưu. Gộp vào bản build 1.0.1 đang test; commit `fix(app): text clipped on samsung` rồi push.
