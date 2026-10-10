# Đăng nhập + phiên

Thuộc: [Kiến trúc](index.md).

Spec: [S1 F2](../sprint-1/F2-google-sign-in.md) · [S2 F7](../sprint-2/F7-device-limit.md).

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant A as App
  participant G as Google Sign-In
  participant SA as Supabase Auth
  participant DB as Postgres

  U->>A: Bấm Đăng nhập với Google
  A->>A: Kiểm tra mạng (offline thì báo ngay)
  A->>G: signIn()
  G-->>A: idToken
  A->>SA: signInWithIdToken(idToken)
  SA->>DB: Lần đầu: tạo auth.users
  DB->>DB: Trigger tạo profiles + user_settings
  SA-->>A: Phiên (JWT có session_id + refresh token)
  A->>A: Lưu phiên vào AsyncStorage
  Note over A,DB: Phải gọi trước mọi lệnh đọc bảng,<br/>vì RLS cần session_active()
  A->>DB: rpc register_device(device_id, device_name)
  DB-->>A: Máy bị đá (nếu có)
  A->>DB: Đọc profiles, user_settings
  A-->>U: Tab Lịch (+ hộp Đã đăng xuất thiết bị cũ)
```

Vòng đời phiên trên 1 máy:

```mermaid
stateDiagram-v2
  [*] --> ChuaDangNhap
  ChuaDangNhap --> DangHoatDong: Đăng nhập + register_device
  DangHoatDong --> DangHoatDong: Về foreground, session_active() = true<br/>touch_device (≤ 1 lần / 5 phút)
  DangHoatDong --> BiDangXuat: Máy thứ 3 đăng nhập<br/>(dòng user_devices + auth.sessions bị xoá)
  BiDangXuat --> ChuaDangNhap: Mở app / ghi bị từ chối 42501<br/>→ session_active() = false → hộp báo
  DangHoatDong --> ChuaDangNhap: Tự đăng xuất<br/>unregister_device + signOut
```


## Giới hạn 2 thiết bị

Cùng 1 tài khoản, tối đa 2 máy. Máy thứ 3 đăng nhập → máy đăng nhập sớm nhất bị đăng xuất.

```mermaid
sequenceDiagram
  autonumber
  participant MA as Máy A (sớm nhất)
  participant MB as Máy B
  participant MC as Máy C (mới)
  participant DB as Postgres

  MC->>DB: register_device(C)
  activate DB
  DB->>DB: Khoá dòng profiles của user (FOR UPDATE)
  Note right of DB: 2 máy đăng nhập cùng lúc<br/>phải xếp hàng → luôn ≤ 2 dòng
  DB->>DB: Upsert user_devices (C)
  DB->>DB: Còn 3 dòng → xoá dòng A<br/>+ xoá auth.sessions của A
  DB-->>MC: kicked = A
  deactivate DB
  MC->>MC: Hộp Đã đăng xuất thiết bị cũ

  MB->>DB: Đọc / ghi bình thường
  DB-->>MB: OK (phiên B vẫn còn)

  MA->>DB: Mở app → session_active()
  DB-->>MA: false
  MA->>MA: Đăng xuất, huỷ thông báo nhắc<br/>Hộp Bạn đã bị đăng xuất
```

- Không có push từ server → máy A chỉ biết khi mở app hoặc khi gọi API bị từ chối (`42501`).
- `checkSessionActive()` chỉ đăng xuất khi DB trả **chắc chắn** `false`; lỗi mạng → coi như còn phiên (không đá nhầm).
