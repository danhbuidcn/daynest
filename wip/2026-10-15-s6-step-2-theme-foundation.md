# 2026-10-15 — S6 bước 2: Giao diện — nền móng — 🔄 đã code, chờ xem trên máy

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §8](../docs/specs/sprint-6/index.md) · [db.md](../docs/specs/sprint-6/design/db.md) (bước 1 đã xong, cột `theme`… có sẵn trên DB).

## Input

- 8 bộ màu + Theo hệ thống + Tự chọn · 6 font + cỡ chữ · chưa có màn chọn (bước 3). Bộ Bạc hà phải trông y như cũ.
- Hiện trạng: `@/theme` xuất hằng số `colors`/`fonts`/`type`/`shadow`; 87 file import, 80 file có `StyleSheet.create` chạy 1 lần lúc nạp, ~440 chỗ dùng `colors.` / `fonts.` / `type.` ngoài style (inline). Chỉ có font Nunito.

## Plan

- [x] 1. Thư viện: `@expo-google-fonts/be-vietnam-pro`, `quicksand`, `baloo-2`, `itim`, `patrick-hand`, `expo-haptics` (haptics dùng ở bước 7, cài luôn để build 1 lần) · `userInterfaceStyle: 'automatic'` trong `app.config.ts`.
- [x] 2. Hàm thuần `src/lib/theme/`: bảng 8 bộ (token như mockup + `toast`; id khớp DB: `mint, rose, sky, lavender, clay, lemon, slate, dark`) · `contrast()` · `buildCustomTheme(primary, dark)` (primaryDark chỉnh tới tương phản ≥ 4,5:1) · `resolveTheme(settings, systemScheme)`.
- [x] 3. `src/theme/`: `ThemeProvider` + `useTheme()` (token + font + `scale`) + `makeStyles((t) => …)` (nhớ theo bộ màu, không tạo lại mỗi lần vẽ) · `fontFamilies` 6 font × 3 độ đậm (thiếu → gần nhất) · cỡ chữ nhân với `WIDE_SCALE` · `AppText` đọc font/màu từ theme · màu cố định trên nền màu event (`#2F2D33`).
- [x] 4. Lưu: AsyncStorage đọc cùng lúc với font/ngôn ngữ trong `_layout.tsx` trước khi ẩn splash (không nháy màu) · ghi vào `user_settings` (cột bước 1) khi đổi, ghi hàng đợi khi mất mạng · tải về khi đăng nhập/mở app, máy chủ thắng khi khác.
- [x] 5. Thanh trạng thái (`StatusBar` sáng/tối), `SplashView`, nền màn chờ theo bộ màu.
- [x] 6. Đổi toàn bộ `src/` sang hook, **mỗi thư mục 1 commit**: `components/` → `app/` → `features/<từng feature>`. Bỏ export hằng `colors`/`fonts`/`type`/`shadow` cũ khi xong (typecheck bắt sót).
- [x] 7. Kiểm: `npm run typecheck && npm run lint && npm test` · chạy máy ảo, bộ Bạc hà so với mockup/ảnh trước khi đổi (không khác) · đổi tạm `theme` trong DB sang `dark` và `custom` xem các màn chính không vỡ.
- [ ] 8. Ghi kết quả · tick lộ trình · commit từng bước + push.

## Cần bạn quyết

1. **Test Jest:** memory ghi "không viết test Jest mới, thử trên máy ảo", nhưng spec S6 §8 yêu cầu test hàm tương phản + bộ màu tự chọn. Đề xuất: **vẫn viết test cho 2 hàm thuần này** (`colors.test.ts` kiểu cũ, ngắn), phần UI thử trên máy ảo. Được không?
2. **Id bộ màu:** DB dùng `rose` cho "Hồng đào" (mockup ghi `peach`, trùng tên màu event). Giữ `rose`.

## Kết quả

- 2026-10-15: bạn `ok` (viết test 2 hàm thuần · giữ id `rose`).
- Đã code + commit (chưa push): nền móng, 87 file đổi sang `useTheme` / `makeStyles` bằng codemod (13 commit theo thư mục). `typecheck` chỉ còn 15 lỗi route cũ (có từ trước), `npm test` 28 file 223 qua (thêm `theme.test.ts`).
- Khác kế hoạch: `@/theme` chỉ còn token tĩnh (`@/theme/tokens`) + hook; Itim và Patrick Hand chỉ có 1 độ đậm; splash gốc có bản tối (`#17171B`).
- **Chưa làm / chưa xem:** bước 7 (thử trên máy). Không có máy ảo cho Daynest (chỉ có AVD `pwvault-test`) và điện thoại thật đang `unauthorized` → chưa chạy app. Cần dựng lại bản native (thêm font, `expo-haptics`, splash tối).
- Chưa có màn chọn giao diện (bước 3) nên đổi thử bằng cách sửa cột `theme` trong DB.
- 2026-10-15 (máy ảo `pwvault-test`, đăng nhập tài khoản của bạn): build debug chạy được. Bộ Bạc hà giống bản cũ (Lịch, Chi tiêu). Ép tạm (không ghi DB, đã hoàn lại): `dark` → Lịch, Ghi chú, Chi tiêu, Cài đặt đều đọc được, màu event giữ nguyên · `custom #FF7A59` + font Itim + cỡ chữ 1,15 → áp dụng được.
- **Lỗi thấy được, để bước 3 / bước 10:** cỡ chữ Lớn (1,15) làm ô Lịch Tháng cắt chữ (+N, tên thanh event) vì ô cố định chiều cao. Chưa thử Be Vietnam Pro, Quicksand, Baloo 2, Patrick Hand; chưa thử "Theo hệ thống" (cần đổi chế độ tối của máy ảo); chưa đồng bộ lên `user_settings` (chưa có màn chọn để đổi).
- Còn lại: chạy `npm run release`-kiểu build thật và cài lên điện thoại thì mới xem splash tối.
