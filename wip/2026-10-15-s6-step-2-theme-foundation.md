# 2026-10-15 — S6 bước 2: Giao diện — nền móng — ⏸ chờ duyệt

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §8](../docs/specs/sprint-6/index.md) · [db.md](../docs/specs/sprint-6/design/db.md) (bước 1 đã xong, cột `theme`… có sẵn trên DB).

## Input

- 8 bộ màu + Theo hệ thống + Tự chọn · 6 font + cỡ chữ · chưa có màn chọn (bước 3). Bộ Bạc hà phải trông y như cũ.
- Hiện trạng: `@/theme` xuất hằng số `colors`/`fonts`/`type`/`shadow`; 87 file import, 80 file có `StyleSheet.create` chạy 1 lần lúc nạp, ~440 chỗ dùng `colors.` / `fonts.` / `type.` ngoài style (inline). Chỉ có font Nunito.

## Plan

- [ ] 1. Thư viện: `@expo-google-fonts/be-vietnam-pro`, `quicksand`, `baloo-2`, `itim`, `patrick-hand`, `expo-haptics` (haptics dùng ở bước 7, cài luôn để build 1 lần) · `userInterfaceStyle: 'automatic'` trong `app.config.ts`.
- [ ] 2. Hàm thuần `src/lib/theme/`: bảng 8 bộ (token như mockup + `toast`; id khớp DB: `mint, rose, sky, lavender, clay, lemon, slate, dark`) · `contrast()` · `buildCustomTheme(primary, dark)` (primaryDark chỉnh tới tương phản ≥ 4,5:1) · `resolveTheme(settings, systemScheme)`.
- [ ] 3. `src/theme/`: `ThemeProvider` + `useTheme()` (token + font + `scale`) + `makeStyles((t) => …)` (nhớ theo bộ màu, không tạo lại mỗi lần vẽ) · `fontFamilies` 6 font × 3 độ đậm (thiếu → gần nhất) · cỡ chữ nhân với `WIDE_SCALE` · `AppText` đọc font/màu từ theme · màu cố định trên nền màu event (`#2F2D33`).
- [ ] 4. Lưu: AsyncStorage đọc cùng lúc với font/ngôn ngữ trong `_layout.tsx` trước khi ẩn splash (không nháy màu) · ghi vào `user_settings` (cột bước 1) khi đổi, ghi hàng đợi khi mất mạng · tải về khi đăng nhập/mở app, máy chủ thắng khi khác.
- [ ] 5. Thanh trạng thái (`StatusBar` sáng/tối), `SplashView`, nền màn chờ theo bộ màu.
- [ ] 6. Đổi toàn bộ `src/` sang hook, **mỗi thư mục 1 commit**: `components/` → `app/` → `features/<từng feature>`. Bỏ export hằng `colors`/`fonts`/`type`/`shadow` cũ khi xong (typecheck bắt sót).
- [ ] 7. Kiểm: `npm run typecheck && npm run lint && npm test` · chạy máy ảo, bộ Bạc hà so với mockup/ảnh trước khi đổi (không khác) · đổi tạm `theme` trong DB sang `dark` và `custom` xem các màn chính không vỡ.
- [ ] 8. Ghi kết quả · tick lộ trình · commit từng bước + push.

## Cần bạn quyết

1. **Test Jest:** memory ghi "không viết test Jest mới, thử trên máy ảo", nhưng spec S6 §8 yêu cầu test hàm tương phản + bộ màu tự chọn. Đề xuất: **vẫn viết test cho 2 hàm thuần này** (`colors.test.ts` kiểu cũ, ngắn), phần UI thử trên máy ảo. Được không?
2. **Id bộ màu:** DB dùng `rose` cho "Hồng đào" (mockup ghi `peach`, trùng tên màu event). Giữ `rose`.

## Kết quả
