# F7 — Giới hạn 2 thiết bị / tài khoản

Thuộc: [Sprint 2](index.md).

## Mục tiêu

- Mỗi tài khoản đăng nhập tối đa **2 thiết bị** cùng lúc.
- Đăng nhập trên máy thứ 3 → máy **đăng nhập sớm nhất** tự bị đăng xuất; cả 2 máy đều được báo.

## Logic

### Nhận diện máy

- Lần đầu mở app sau khi cài: sinh `device_id` (uuid), lưu AsyncStorage. Gỡ app cài lại → máy mới.
- Tên máy: `expo-device` (vd "Samsung SM-A556E").

### Ghi máy lúc đăng nhập

- Đăng nhập Supabase xong → gọi hàm DB `register_device(device_id, device_name)` ([db.md](design/db.md#user_devices)).
- Hàm chạy trong 1 transaction, khoá theo user (2 máy đăng nhập cùng lúc vẫn đúng):
  1. Cùng `device_id` đã có → cập nhật `session_id`, `signed_in_at`; không tính thêm máy.
  2. Chưa có → thêm dòng.
  3. Còn > 2 dòng → xoá dòng `signed_in_at` sớm nhất + xoá phiên Supabase của máy đó (`auth.sessions` → refresh token hết hiệu lực).
  4. Trả về tên + ngày đăng nhập của máy bị đăng xuất (nếu có).
- Có máy bị đăng xuất → máy mới hiện hộp "Đã đăng xuất <tên máy>".

### Máy bị đăng xuất dừng ngay

- RLS mọi bảng (cả bảng S1) thêm điều kiện: phiên hiện tại (`session_id` trong token) còn trong `user_devices` → máy cũ không đọc/ghi được nữa, không đợi token hết hạn.
- App hỏi `session_active()` khi: mở app, về foreground, trước khi đồng bộ Google. Ghi bị từ chối (`42501`) → cũng hỏi lại.
- `false` → đăng xuất (xoá phiên trên máy, huỷ thông báo nhắc — [F3](F3-nhac-nho.md)) → màn Đăng nhập + hộp "Bạn đã bị đăng xuất".
- `last_seen_at` cập nhật mỗi lần `session_active()` trả `true` (tối đa 1 lần / 5 phút).

### Đăng xuất

- Tự đăng xuất (Cài đặt) → xoá dòng của máy mình → `signOut()`.

### Hạn chế

- Không có server push → máy bị đăng xuất chỉ biết khi app mở/gọi API. App đang đóng → thông báo nhắc đã đặt trên máy đó vẫn có thể kêu tới lần mở app kế tiếp.

## Luồng

```text
Máy C đăng nhập (A, B đang đăng nhập; A sớm nhất)
  → register_device → xoá A + phiên A → C thấy hộp "Đã đăng xuất A"
Máy A mở app / về foreground → session_active() = false
  → đăng xuất → màn Đăng nhập + hộp "Bạn đã bị đăng xuất"
Cài đặt → Tài khoản → Thiết bị đăng nhập → xem 2 máy
```

## Mô tả

- Máy cũ (màn 23): hộp trên màn Đăng nhập · icon thiết bị · "Bạn đã bị đăng xuất" · "Tài khoản vừa đăng nhập trên thiết bị khác. Mỗi tài khoản dùng tối đa 2 thiết bị." · nút **Đã hiểu**.
- Máy mới (màn 24): hộp trên Tab Lịch ngay sau đăng nhập · "Đã đăng xuất <tên máy>" · "Mỗi tài khoản dùng tối đa 2 thiết bị. <Tên máy> (đăng nhập 01/10/2026) đã bị đăng xuất." · nút **Đã hiểu**.
- Thiết bị đăng nhập (màn 25, `settings/devices`): mỗi máy 1 dòng — icon · tên máy · "Đăng nhập 01/10/2026 · Dùng lần cuối hôm nay 9:20" · nhãn "Thiết bị đang dùng" · chú thích "Tối đa 2 thiết bị. Khi đăng nhập trên thiết bị thứ 3, thiết bị đăng nhập sớm nhất sẽ được đăng xuất."
- Cài đặt → nhóm Tài khoản thêm dòng "Thiết bị đăng nhập" · giá trị "2/2" · `›`.

## Không làm

- Tự chọn máy để đăng xuất, đăng xuất từ xa bằng tay, đổi số máy tối đa trong app, push báo máy cũ ngay lập tức.

## Test

- `rls_s2.sql`: 3 phiên giả cùng user → phiên sớm nhất bị xoá, không đọc/ghi được bảng nào; 2 phiên còn lại vẫn được.
- Gọi `register_device` cùng lúc từ 2 phiên → vẫn đúng tối đa 2 dòng.
- Đăng nhập lại cùng `device_id` → không đá máy khác.
- Máy thật (2 máy + emulator): đăng nhập máy thứ 3 → máy sớm nhất thấy hộp khi mở app; máy mới thấy hộp "Đã đăng xuất".
