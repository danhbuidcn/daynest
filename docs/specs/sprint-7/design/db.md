# Sprint 7 — DB và Edge Function

Thuộc: [Spec S7](../index.md). Cùng quy ước với [S6 db.md](../../sprint-6/design/db.md).

## Tóm tắt

- **Không thêm bảng, không đổi cột.** Trạng thái Pro nằm ở RevenueCat (nguồn đúng), app chỉ giữ bản nhớ trên máy để ẩn banner ngay khi mở app.
- **Thêm 1 Edge Function:** `delete-account` (xoá tài khoản ngay trong app).
- Không đổi RLS, không tăng `min_version_code` (bản cũ chạy bình thường; thiếu nút xoá tài khoản thôi).

## Xoá tài khoản — Edge Function `delete-account`

Play bắt buộc: app có tạo tài khoản phải cho xoá tài khoản + dữ liệu ngay trong app, kèm 1 trang web yêu cầu xoá (URL công khai).

| Bước | Việc | Ghi chú |
| --- | --- | --- |
| 1 | Xác thực | Đọc user từ `Authorization` (như `send-bug-report`); không có → 401. Body rỗng; xoá **chỉ tài khoản của người gọi**. |
| 2 | Xoá ảnh báo lỗi | Bucket `bug-reports`, thư mục `<user_id>/` (Storage không xoá theo khoá ngoại) · liệt kê rồi `remove`. |
| 3 | Xoá user | `auth.admin.deleteUser(id)` (service role, chỉ trong Edge Function) → mọi bảng có `user_id references auth.users on delete cascade` tự xoá: events, exceptions, notes, categories, expenses, recurrences, budgets, todos, period_days, bug_reports, user_devices, user_settings, google_sync_state, profiles. |
| 4 | Trả `{ ok: true }` | Lỗi bước 2 / 3 → 500, user thử lại (hàm chạy lại được: bước 2 bỏ qua thư mục trống, bước 3 lỗi "không tìm thấy" coi như xong). |

- App sau khi nhận `ok`: đăng xuất, xoá cache + dữ liệu trên máy (kể cả ảnh nền, token Google trong SecureStore, thông báo đã hẹn), về màn đăng nhập.
- Quyền Google: token lưu trên máy, không lưu ở server → app gọi thu hồi token Google (`revoke`) trước khi gọi hàm, lỗi mạng thì bỏ qua.
- RevenueCat: gói đang đăng ký **không tự huỷ** khi xoá tài khoản (gói nằm ở Google Play) → hộp xác nhận nói rõ "Hãy huỷ gói trong Google Play" nếu đang có Pro; mở được trang quản lý gói.
- Trang web yêu cầu xoá: hướng dẫn xoá trong app (Cài đặt › Tài khoản › Xoá tài khoản) + địa chỉ email để gửi yêu cầu khi không còn dùng được app; xử lý trong 30 ngày.

## Pro (RevenueCat)

- `app_user_id` của RevenueCat = `auth.users.id` → 2 máy cùng tài khoản dùng chung quyền lợi, cài lại app thì "Khôi phục giao dịch".
- Quyền lợi (entitlement) tên `pro` · 3 sản phẩm Play: `pro_monthly` 29.000đ, `pro_yearly` 299.000đ, `pro_lifetime` 599.000đ.
- App giữ `isPro` trong AsyncStorage (chỉ để ẩn banner nhanh); mỗi lần mở app / quay lại, hỏi RevenueCat rồi ghi đè.
- Không webhook, không bảng. Nếu sau này cần Pro ở server (vd. web), thêm webhook → bảng `entitlements` ở sprint sau.

## Quảng cáo

- Không lưu gì ở DB. Lần đồng ý UMP lưu bởi SDK trên máy.
- Trên máy (AsyncStorage): ngày cài app (đếm 3 ngày đầu), giờ lần cuối hiện toàn màn hình (giới hạn 5 phút), giờ hết hạn "tắt quảng cáo 24 giờ". Không đồng bộ giữa 2 máy; đổi giờ máy để lách chỉ ảnh hưởng chính người đó.

## Test

- **RLS:** không đổi → không thêm test RLS.
- **Edge Function:** test tay trên Supabase local: tạo user + dữ liệu đủ các bảng + 1 ảnh báo lỗi → gọi hàm → không còn dòng nào, không còn ảnh · gọi không có token → 401 · user A không xoá được user B.
- **Tải:** không có bảng mới / truy vấn mới → không chạy lại `supabase/db load`.
