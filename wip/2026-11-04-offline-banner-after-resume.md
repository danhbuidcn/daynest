# Sửa lỗi: quay lại app báo "mất wifi" sai

## Input
- Dùng Daynest → chuyển sang app khác → quay lại: banner "mất wifi" hiện, dù mạng vẫn tốt.
- Cần build lại trên Ubuntu sau khi sửa.

## Điều đã đọc (2026-11-04)
- [useConnectionMonitor.ts](../app/src/features/network/useConnectionMonitor.ts) đọc mạng 1 lần lúc mở app, sau đó chỉ nghe sự kiện `addNetworkStateListener`.
- Không có `AppState` nào đọc lại mạng khi app quay về foreground.
- Giả thuyết (chưa kiểm chứng): khi app ở nền, Android báo mạng tạm "không có" hoặc bỏ lỡ sự kiện; `online` kẹt ở `false`, không ai đọc lại.

## Handoff (2026-11-04)
- Người dùng sẽ tự xử lý. Mới điều tra bằng đọc code, chưa chạy gì, chưa sửa code, chưa `npm install`.
- Bước tiếp theo: kiểm chứng giả thuyết trên máy thật (bước 1), rồi sửa. Không cần viết test (người dùng đã bỏ).
- File liên quan: [useConnectionMonitor.ts](../app/src/features/network/useConnectionMonitor.ts), [connection.ts](../app/src/lib/connection.ts), [OfflineBanner.tsx](../app/src/components/OfflineBanner.tsx).

## Plan
- [ ] 1. Kiểm chứng giả thuyết: `npm install` (thiếu `node_modules`), chạy app, log trạng thái mạng lúc quay lại.
- ~~2. Viết test~~ — bỏ theo yêu cầu, test trực tiếp trên app.
- [x] 3. Sửa: khi `AppState` thành `active`, gọi `getNetworkStateAsync()` rồi `setDeviceOnline(...)`.
- [x] 4. `npm run typecheck && npm run lint && npm test`.
- [ ] 5. Build APK trên Ubuntu, cài máy thật, thử lại kịch bản.
- [x] 6. Commit `fix(app): ...` + push.

## Kết quả
- 2026-11-04: thêm `AppState` vào `useConnectionMonitor.ts` — khi app quay về `active` thì đọc lại mạng bằng `getNetworkStateAsync()`.
- typecheck, lint, test (272) đều qua.
- Chưa làm: bước 1 (kiểm chứng trên máy thật) và bước 5 (build APK, thử lại kịch bản).
