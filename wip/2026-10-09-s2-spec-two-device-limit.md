# 2026-10-09 — S2 spec: 1 account tối đa 2 thiết bị — ✅ xong

**Bạn chốt:** đăng nhập trên máy thứ 3 → tự đăng xuất máy **đăng nhập sớm nhất**, có thông báo.

**Đề xuất cách làm:**

| Việc | Cách làm |
| --- | --- |
| Nhận diện máy | Mỗi lần cài app sinh 1 `device_id` (uuid) lưu trên máy + tên máy (vd "Samsung SM-A556E") |
| Ghi máy lúc đăng nhập | Bảng `user_devices` (`user_id`, `device_id`, `device_name`, `session_id`, `signed_in_at`, `last_seen_at`) · đăng nhập xong gọi hàm DB `register_device()` |
| Đá máy cũ | `register_device()` (chạy quyền DB, trong 1 transaction có khoá theo user → 2 máy đăng nhập cùng lúc vẫn đúng) : quá 2 máy → xoá máy `signed_in_at` sớm nhất + xoá phiên Supabase của máy đó (`auth.sessions`) |
| Máy bị đá dừng ngay | RLS mọi bảng thêm điều kiện: phiên hiện tại (`session_id` trong token) phải còn trong `user_devices` → máy cũ gọi API là bị từ chối, không đợi token hết hạn |
| Thông báo máy bị đá | Lần gọi API kế tiếp (mở app, về foreground, lưu…) bị từ chối → app đăng xuất, hiện hộp "Bạn đã bị đăng xuất vì tài khoản vừa đăng nhập trên thiết bị khác (tối đa 2 thiết bị)." |
| Thông báo máy mới | Hộp ngay sau đăng nhập: "Đã đăng xuất <tên máy cũ>" · "Mỗi tài khoản đăng nhập tối đa 2 thiết bị. <Tên máy cũ> (đăng nhập 01/10) đã bị đăng xuất." · nút **Đã hiểu** |
| Màn xem thiết bị (bạn yêu cầu thêm màn) | Cài đặt → Tài khoản → **Thiết bị đăng nhập** (`settings/devices`): 2 dòng (tên máy · "Đăng nhập 01/10 · Dùng lần cuối hôm nay" · nhãn "Máy này") + chú thích "Tối đa 2 thiết bị. Đăng nhập máy thứ 3 sẽ đăng xuất máy đăng nhập sớm nhất." |
| Tự đăng xuất | Xoá dòng của máy mình trong `user_devices` |
| Đăng nhập lại trên cùng máy | Cùng `device_id` → cập nhật dòng cũ, không tính thêm máy |

- Hạn chế: không có server push → máy bị đá chỉ biết khi app mở/gọi API, không báo lúc app đang đóng.
- Thêm cuối danh sách §6 "Trước khi lên Google Play": không đổi.

**Plan:**

- [x] 1. Viết `docs/specs/sprint-2/F7-device-limit.md` (mục tiêu, logic như bảng trên, luồng, mô tả, test) + thêm dòng F7 vào `sprint-2/index.md` (phạm vi, luồng, DoD: "đăng nhập máy thứ 3 → máy sớm nhất bị đăng xuất, thấy hộp thông báo; máy mới thấy toast").
- [x] 2. `design/db.md`: bảng `user_devices`, hàm `register_device()`, điều kiện RLS mới cho mọi bảng; `rls_s2.sql` thêm test máy bị đá không đọc/ghi được.
- [x] 3. `design/screens.md` + `mockups.html`: màn 23 hộp "Bạn đã bị đăng xuất…" (máy cũ, trên màn Đăng nhập) · màn 24 hộp "Đã đăng xuất <máy cũ>" (máy mới) · màn 25 "Thiết bị đăng nhập" · Cài đặt thêm dòng "Thiết bị đăng nhập" (nhóm Tài khoản).
- [x] 4. `docs/specs/index.md` §2: thêm dòng "Thiết bị: 1 account tối đa 2 thiết bị".
- [x] 5. Kiểm tra link + chụp mockup. Commit `docs: limit two devices per account`, push.
