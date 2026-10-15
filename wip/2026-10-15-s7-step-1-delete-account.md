# 2026-10-15 — S7 bước 1: Xoá tài khoản (Edge Function + màn trong app) — ⏳ chờ bạn duyệt

Thuộc: [lộ trình code S7](2026-10-15-s7-code-plan.md) bước 1 · [db.md S7](../docs/specs/sprint-7/design/db.md#xoá-tài-khoản--edge-function-delete-account) · [mockup](../docs/specs/sprint-7/design/mockups.html) màn 2–3c.

## Input

- Bạn (2026-10-15): `ok, viết todo bước 1`.
- Play bắt buộc: app tạo tài khoản phải cho xoá tài khoản + dữ liệu ngay trong app (+ trang web yêu cầu xoá — đã có).

## Output

- Cài đặt có "Xoá tài khoản" → xoá được tài khoản **và** mọi dữ liệu trên server, về màn đăng nhập, máy sạch dữ liệu.
- Edge Function `delete-account` chạy trên Supabase thật.

## Context (đã xem code)

| Phần | Hiện trạng | Hướng làm |
| --- | --- | --- |
| Hàm server | Chỉ có `supabase/functions/send-bug-report/index.ts` (xác thực bằng `Authorization`, service role) | `delete-account/index.ts` cùng khung |
| Deploy | `supabase/db functions` đặt secret Gmail rồi deploy `send-bug-report` | Thêm dòng deploy `delete-account` (không cần secret mới); tách để không bắt `GMAIL_*` khi chỉ deploy hàm này nếu dễ, không thì giữ nguyên |
| Đăng xuất | `authService.signOut()` (gỡ thiết bị, `supabase.auth.signOut`, `GoogleSignin.signOut`) · `AuthProvider.signOut()` gọi rồi `clearLocalData()` (cache query, snapshot, ảnh nền) | `deleteAccount()` trong `authService` + `AuthProvider`, dùng lại `clearLocalData()` |
| Google | Token **không lưu** (F4), SDK giữ trong máy | `GoogleSignin.revokeAccess()` trước khi gọi hàm, lỗi thì bỏ qua |
| Thông báo đã hẹn | `cancelAll()` ở `lib/notifications/scheduler.ts` | Gọi sau khi xoá xong |
| Màn Cài đặt | `(tabs)/settings.tsx`: thẻ "Đăng xuất" riêng ở cuối | Thêm dòng "Xoá tài khoản" vào cùng thẻ, dưới "Đăng xuất" · thêm dòng "Chính sách quyền riêng tư" vào nhóm Ứng dụng |
| Màn con | `src/app/settings/*.tsx` (bug-report, devices…) dùng `ScreenHeader` + `Card` | `src/app/settings/delete-account.tsx` |
| Dialog | `ConfirmDialog` đã có · chưa chắc có kiểu "đang xử lý khoá nút" | Xem `components/Dialog`; thiếu thì thêm biến thể `busy` |
| Gói Pro | Chưa có (bước 4) | Dòng cảnh báo huỷ gói chỉ vẽ khi có `isPro` — bước này chừa chỗ, bước 4 nối |

## Plan

- [ ] 1. **Edge Function `delete-account`** (`supabase/functions/delete-account/index.ts`): đọc user từ `Authorization` (không có / sai → 401; không đọc body) · liệt kê rồi xoá mọi file trong bucket `bug-reports` thư mục `<user_id>/` (thư mục trống bỏ qua) · `auth.admin.deleteUser(id)` (lỗi "không tìm thấy" coi như xong) · trả `{ ok: true }` · lỗi → 500 để app thử lại; chạy lại được.
- [ ] 2. **Test tay trên Supabase local** (ghi lệnh + kết quả vào "Kết quả"; không viết Jest): tạo 2 user + dữ liệu đủ bảng (events, exceptions, notes, categories, expenses, recurrences, budgets, todos, period_days, bug_reports, user_devices, user_settings, google_sync_state, profiles) + 1 ảnh trong `bug-reports` → gọi hàm bằng token user A → A không còn dòng nào ở mọi bảng, không còn ảnh, user B còn nguyên · gọi không token → 401 · gọi lần 2 (token A đã chết) → 401, không lỗi lạ · ép lỗi giữa chừng (vd. hàm dừng sau bước xoá ảnh) rồi gọi lại → xong.
- [ ] 3. **Deploy:** thêm `delete-account` vào `supabase/db functions` (+ `supabase/README.md` nếu có liệt kê hàm) · deploy lên project thật · gọi thử bằng 1 tài khoản Google phụ (không dùng tài khoản của bạn) — **cần bạn cho tài khoản phụ hoặc tự tạo**; không có thì test trên máy thật ở bước 6 bằng tài khoản phụ.
- [ ] 4. **App — logic:** `authService.deleteAccount()`: `GoogleSignin.revokeAccess()` (bỏ qua lỗi) → `supabase.functions.invoke('delete-account')` → lỗi thì ném `AuthError` kiểu mạng / máy chủ (dùng phân loại lỗi S6) → xong thì `supabase.auth.signOut()` cục bộ · `AuthProvider.deleteAccount()`: gọi service, `clearLocalData()`, `cancelAll()` thông báo, xoá snapshot, `setProfile(null)` · không chạy khi mất mạng (khoá nút như các nút ghi khác ở S6).
- [ ] 5. **App — giao diện** (mockup 1–3c): Cài đặt: "Xoá tài khoản" (chữ đỏ, mũi tên) cùng thẻ với "Đăng xuất", đặt dưới cùng; "Chính sách quyền riêng tư" ở nhóm Ứng dụng mở `https://danhbuidcn.github.io/daynest-site/privacy/{vi|en}.html` theo ngôn ngữ app · màn `settings/delete-account`: biểu tượng, câu hỏi, email, danh sách dữ liệu bị xoá, nút đỏ cố định ở đáy (`FormScreen`) · hộp xác nhận "Xoá tài khoản?" · hộp đang xoá (khoá mọi nút, không đóng được) · hộp lỗi "Chưa xoá được" (Đóng / Thử lại) · key i18n mới cùng tên ở `en.json` và `vi.json`, câu chữ theo `design-system.md` § Câu chữ · màu, chữ chỉ từ `@/theme` / `AppText`.
- [ ] 6. **Thử trên máy ảo + máy thật (tài khoản phụ):** xoá xong về màn đăng nhập, máy sạch (cache, ảnh nền, thông báo) · đăng nhập lại cùng tài khoản Google → như người mới (không còn dữ liệu cũ) · **tài khoản đang đăng nhập ở 2 máy**: xoá ở máy A, máy B thành đăng xuất (xem rủi ro) · mất mạng → nút khoá · lỗi giữa chừng → "Chưa xoá được", thử lại được · dữ liệu trong DB thật của tài khoản phụ hết sạch.
- [ ] 7. `npm run typecheck && npm run lint && npm test` qua → commit + push (`feat(app): delete account`, `chore(supabase): delete-account function`).

## Rủi ro

- **Máy thứ 2 sau khi xoá:** `checkSessionActive` coi lỗi là "còn hoạt động" (fails open) → máy B có thể còn hiện cache tới khi token hết hạn. Khi thử bước 6 xem máy B có tự đăng xuất không; không thì thêm: gặp lỗi xác thực "user không còn" → `forceSignOut`.
- **Xoá không thể hoàn tác** + tài khoản duy nhất của bạn: **chỉ thử bằng tài khoản phụ.**
- Gói Pro không tự huỷ khi xoá (Play giữ gói) — cảnh báo nối ở bước 4.

## Cần bạn quyết

1. Bạn có tài khoản Google phụ để thử xoá thật không (cần 1 cái đăng nhập vào app, có thể thêm 1 máy nếu muốn thử 2 máy)? Nếu chưa, tôi dừng ở bước 5 và chờ bạn tạo.

## Kết quả

- Chưa bắt đầu.
