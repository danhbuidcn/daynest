# 2026-10-10 — Notes: kéo đổi thứ tự mục checklist — ✅ xong

## Input

- F5: mục checklist "kéo đổi thứ tự" — còn thiếu từ bước 9. Bạn chọn: dùng thư viện.
- `react-native-reanimated` 4.7.1 + `gesture-handler` đã có trong bản build native (qua `expo-router`) → thư viện chỉ là JS, không cần build lại native.

## Plan

- [x] 1. Cài `react-native-draggable-flatlist` (`npx expo install`).
- [x] 2. Thiết kế: tay nắm ⋮⋮ 18 `textMuted` bên trái mỗi dòng, giữ và kéo để đổi thứ tự — cập nhật `mockups.html` (màn 17), `design-system.md` (Dòng checklist), `F5-notes.md`.
- [x] 3. Code: icon `grip`; `ChecklistBlock` dùng `NestableDraggableFlatList` (chạm tay nắm → kéo, dòng đang kéo nền `surface` + bóng); editor đổi `ScrollView` → `NestableScrollContainer`.
- [x] 4. `npm run typecheck && npm run lint && npm test`; thử trên emulator.
- [x] 5. Commit + push.

## Kết quả

- Typecheck ok · lint 0 lỗi (3 cảnh báo có từ trước) · test 122/122.
- Emulator: tạo note "Test keo" với 3 mục Mot/Hai/Ba → kéo Mot xuống cuối → Hai/Ba/Mot; quay lại rồi mở lại note vẫn đúng thứ tự (đã lưu). Note thử đã chuyển vào thùng rác.
- Bản debug có cảnh báo vàng từ bên trong thư viện (`[Reanimated] Dependencies should only be used on the web…`, `ref.measureLayout must be called with a ref to a native component`) — chỉ ở bản debug, không ảnh hưởng kéo.
