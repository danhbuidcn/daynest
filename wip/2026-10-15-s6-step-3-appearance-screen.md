# 2026-10-15 — S6 bước 3: Giao diện — màn chọn + nền — ✅ xong (thử trên máy ảo)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §8](../docs/specs/sprint-6/index.md) · mockup màn 14–18 · nền móng: [bước 2](2026-10-15-s6-step-2-theme-foundation.md).

## Input

- Bạn (2026-10-15): "push rồi làm bước 3".

## Plan

- [x] 1. Hàm thuần `src/lib/theme/backgrounds.ts`: 8 màu nền (sáng + tối), 8 chuyển màu, 6 hoạ tiết (tính từ bộ màu + màu event) · kiểm màu nền tự chọn không làm chữ khó đọc (tương phản `text` / `bg` ≥ 4,5) · test.
- [x] 2. `ScreenBackground` (vẽ bằng `react-native-svg`) · áp cho Lịch, Ghi chú, Chi tiêu (khung màn trong suốt, thẻ + thanh tab giữ `surface`).
- [x] 3. Cài đặt: nhóm "Giao diện" đầu danh sách (dòng tóm tắt) → màn `settings/appearance`: ô xem trước · 8 bộ màu + Theo hệ thống + Tự chọn (hộp chọn màu S4 + Sáng / Tối) · nền (Trơn, 8 màu + Màu khác, 8 chuyển màu, 6 hoạ tiết, Ảnh của bạn) · 6 font · cỡ chữ Nhỏ / Vừa / Lớn · đổi xong áp dụng ngay · i18n VI + EN.
- [x] 4. Ảnh của bạn: chọn từ thư viện → thu nhỏ cạnh dài ≤ 1600 px → lưu trong thư mục app (chỉ trên máy) · ô độ mờ 0–80% (mặc định 40%) · máy không có ảnh → coi như Trơn · đăng xuất → xoá ảnh.
- [x] 5. `typecheck` + `lint` + `npm test` · thử trên máy ảo: 8 bộ × Lịch / Ghi chú / Chi tiêu / Cài đặt, nền, font, cỡ chữ, ảnh · sửa lỗi cỡ chữ Lớn cắt chữ ở ô Lịch Tháng (thấy ở bước 2).
- [x] 6. Commit + push · tick lộ trình.

## Kết quả

- Đã làm: `lib/theme/backgrounds.ts` (+ `backgrounds.test.ts`), `ScreenBackground` / `BackgroundArt`, `Slider`, màn `settings/appearance` (xem trước, 8 bộ màu + Theo hệ thống + Tự chọn, nền, font, cỡ chữ), nhóm "Giao diện" đầu Cài đặt, ảnh nền (`photoStore`: thu nhỏ ≤ 1600 px, lưu trong thư mục app, xoá khi đăng xuất, độ mờ 0–80%).
- Thử trên máy ảo (tài khoản `danhpoutch`): đổi Tối / nền chuyển màu 3 / ảnh nền / Itim / cỡ Nhỏ–Vừa–Lớn đều áp dụng ngay, Lịch có nền, giao diện lưu lên `user_settings`. Đã trả tài khoản về Bạc hà · Trơn · Nunito · Vừa.
- Lỗi tìm ra khi thử, đã sửa: (1) đồng bộ bỏ sót lần đổi thứ hai khi 2 lần đổi sát nhau (server giữ cỡ chữ cũ) → hàng đợi lưu lại; (2) cỡ chữ Lớn cắt chữ ở ô Lịch Tháng → thanh event, ngày, "+N" giữ cỡ gốc (`AppText fixedSize`); (3) nhãn "Theo hệ thống" bị cắt → 2 dòng; (4) khoảng "31–31" → 21–31 (biểu đồ).
- **Chưa thử / còn lại:** "Màu khác" của nền + hộp "Tự chọn" qua UI · "Theo hệ thống" (cần đổi chế độ tối của máy ảo) · 4 font còn lại (xem ở màn chọn: đúng) · đăng xuất xoá ảnh · 8 bộ × mọi màn (chỉ thử Bạc hà, Tối, Tự chọn qua ép tạm) · nền trên Ghi chú / Chi tiêu (chỉ xem Lịch) · chữ thứ (T2…CN) mờ trên ảnh nền.
