# 2026-10-09 — App icons match the mockups — ✅ xong

**Input:** you decided every icon in the app must match the mockups (option b). The app uses Ionicons today; mockups draw their own rounded-stroke SVGs, so several icons look different (Calendar and Stats tabs most visibly).

- [x] 1. `npx expo install react-native-svg` (Expo-supported; needed to draw the mockup SVGs).
- [x] 2. New `app/src/components/Icon.tsx`: `<Icon name size color filled? />`, paths copied 1:1 from the mockup icon set (`docs/specs/sprint-2/design/mockups.html`, which contains the S1 set). Only icons the app uses now (tabs, plus, back, chevron, check, pencil, camera, lock, logout, mail, globe, info, Google…); later sprints add theirs from the same file.
- [x] 3. Replace every Ionicons usage (9 files: `TabBar`, `SettingRow`, `ScreenHeader`, `Dialog`, `EmptyState`, `TextField`, `login`, `settings`, `settings/account`) with `Icon`. Remove `@expo/vector-icons` if nothing else uses it.
- [x] 4. `docs/specs/design-system.md` § Icon: replace "Ionicons" with "own SVG set in `components/Icon.tsx`; mockups use the same paths; new icon → add to both".
- [x] 5. Check: `npm run typecheck && npm run lint && npm test`; run on emulator, screenshot tab bar, Settings, Login, Edit account and compare with the S1 mockup.
- [x] 6. Commit `feat(app): use mockup svg icons`, push. No release (ships with S2 `1.1.0`).
- Kết quả: typecheck ok, lint 0 lỗi (3 cảnh báo i18n có từ trước), test 9/9. Emulator (bản release build tại chỗ, không ghi đè `dist/`): Đăng nhập, thanh tab, Lịch trống, Cài đặt giống mockup S1. Chưa xem tận mắt màn Sửa tài khoản (icon camera, khoá).
