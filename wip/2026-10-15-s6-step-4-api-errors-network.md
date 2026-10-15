# 2026-10-15 — S6 bước 4: Lỗi API, server, mạng — ✅ xong (thử trên máy ảo; chưa thử máy chủ sự cố)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · spec [S6 §3](../docs/specs/sprint-6/index.md) · bước trước: [bước 3](2026-10-15-s6-step-3-appearance-screen.md).

## Input

- Bạn (2026-10-15): "tiếp".

## Plan

- [x] 1. Hàm thuần `src/lib/errors/classifyError.ts`: mất mạng · server lỗi / chậm (hết giờ, 5xx, không nối được khi máy có mạng) · bị đăng xuất (42501, phiên hết hạn) · đổi ở thiết bị khác · khác → khoá i18n của toast · test.
- [x] 2. `lib/supabase.ts`: `fetch` có thời gian chờ (15 s; Edge Function + gửi ảnh báo lỗi 60 s) · quá giờ → lỗi "server chậm".
- [x] 3. TanStack Query: `onlineManager` (expo-network) + `focusManager` (AppState) · đọc thử lại 2 lần · app quay lại → tải lại nếu dữ liệu cũ hơn 2 phút (giữ `staleTime`) · có mạng lại → tự tải lại dữ liệu đang xem.
- [x] 4. Hook `useOnline()` (trả `canWrite`, loại sự cố) + máy chủ sự cố thì thử lại ở nền 30 s/lần, gọi được → mở khoá + tải lại · `OfflineBanner` chung trong khung app ("Không có kết nối mạng." / "Máy chủ đang gặp sự cố.") · i18n VI + EN.
- [x] 5. Khoá mọi thao tác ghi khi `!canWrite`: Lưu, Xoá, tick todo, tick ngày có kinh, Gửi báo lỗi, nút `+` / "Thêm …" · bỏ 5 chỗ tự kiểm tra riêng (`expense/edit`, `todos/api`, `settings/bug-report`, `bugReport/api`, `cycle/api`).
- [x] 6. Toast theo loại lỗi ở mọi chỗ lưu / xoá (bỏ câu chung chung).
- [x] 7. Lỗi khi tải ở Lịch (mọi chế độ), Ghi chú (Todo + Ghi chú), Chi tiêu: có dữ liệu trên máy → dòng nhỏ "Chưa cập nhật được · Thử lại" · chưa có → thẻ lỗi giữa màn (icon, tiêu đề theo loại, "Thử lại") · Lịch hiện không có trạng thái lỗi (lỗi trông như "không có event") → sửa.
- [x] 8. `typecheck` + `lint` + `npm test` · thử trên máy ảo (bật chế độ máy bay; chặn host Supabase để giả lập máy chủ lỗi) · commit + push · tick lộ trình.

## Cần bạn quyết

- Không có điểm mới. Theo bạn đã chốt (không viết thêm Jest cho UI): chỉ hàm phân loại lỗi có test, còn lại thử trên máy ảo.

## Kết quả

- Đã làm: `lib/errors/classifyError.ts` (+ test) · `lib/connection.ts` (kho trạng thái mạng / máy chủ) · `timedFetch` trong `lib/supabase.ts` (15 s, 60 s cho Edge Function + tải file) · `queryClient`: `onlineManager`, `focusManager`, đọc thử lại 2 lần, mọi mutation kiểm `assertCanWrite()` trước khi chạy · `useConnectionMonitor` (thử lại 30 s khi máy chủ sự cố, có lại thì tải lại) · `useOnline()` · `OfflineBanner` · `useErrorToast` (toast theo loại lỗi, thay ~15 chỗ) · `LoadErrorCard` + `StaleLine` ở Lịch, Todo, Ghi chú, Chi tiêu · khoá nút `+`, Lưu (event, todo, khoản chi, nhóm, chu kỳ, báo lỗi), mục Xoá / Di chuyển trong menu ⋯, nút thêm nhóm · bỏ 5 chỗ tự kiểm tra mạng.
- Thử trên máy ảo (chế độ máy bay): banner hiện đúng, không hở khoảng trắng · dữ liệu đã lưu vẫn hiện · nút `+` mờ · tháng chưa có trên máy hiện thẻ "Không có kết nối mạng." + Thử lại · tắt chế độ máy bay → banner ẩn, dữ liệu tự tải lại.
- Lỗi tìm ra khi thử, đã sửa: tháng chưa tải hiện "Chưa có khoản chi" (giữ dữ liệu tháng trước) → coi dữ liệu giữ lại của kỳ trước là chưa có dữ liệu · banner làm hở 1 khoảng trên màn → banner phủ vùng trống phía trên, màn bên dưới dịch xuống đúng bằng 1 dòng.
- **Chưa thử:** máy chủ sự cố (banner "Máy chủ đang gặp sự cố.", thử lại 30 s) · hết 15 s · khoá tick todo / tick ngày có kinh khi mất mạng (chặn ở tầng API, chưa làm mờ) · Ghi chú, Todo ở trạng thái lỗi.

