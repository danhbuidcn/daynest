# Kiến trúc Daynest

Thuộc: [Spec tổng](index.md) · §3. File này vẽ lại kiến trúc bằng biểu đồ Mermaid; chi tiết từng phần nằm ở spec gốc (link ở mỗi mục).

Trạng thái: theo code tới S2 bước 6 (Event). Phần đánh dấu **(chưa code)** là theo spec, chưa có trong `app/`.

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Các lớp trong app](#2-các-lớp-trong-app)
3. [Lưu dữ liệu](#3-lưu-dữ-liệu)
4. [User hoạt động ra sao](#4-user-hoạt-động-ra-sao)
5. [Đăng nhập + phiên](#5-đăng-nhập--phiên)
6. [Giới hạn 2 thiết bị](#6-giới-hạn-2-thiết-bị)
7. [Đọc lịch: event lặp](#7-đọc-lịch-event-lặp)
8. [Ghi dữ liệu: không trùng, không mất](#8-ghi-dữ-liệu-không-trùng-không-mất)
9. [Xung đột dữ liệu](#9-xung-đột-dữ-liệu)
10. [Đồng bộ Google Calendar](#10-đồng-bộ-google-calendar)
11. [Nhắc nhở](#11-nhắc-nhở)
12. [Xử lý traffic](#12-xử-lý-traffic)
13. [Xử lý lỗi](#13-xử-lý-lỗi)

---

## 1. Tổng quan hệ thống

Không có server riêng. App gọi thẳng Supabase (dữ liệu) và Google (đăng nhập, lịch). Mọi quyền truy cập dữ liệu do Postgres RLS quyết định.

```mermaid
flowchart LR
  subgraph Device["Điện thoại (Android / iOS)"]
    App["Expo app<br/>React Native + TypeScript"]
    AS[("AsyncStorage<br/>phiên Supabase, device_id, ngôn ngữ")]
    Cache[("TanStack Query<br/>cache trong RAM")]
    Notif["Thông báo trên máy<br/>expo-notifications"]
    GSI["Google Sign-In SDK<br/>token Google"]
  end

  subgraph Supabase["Supabase"]
    Auth["Auth<br/>JWT + refresh token"]
    REST["PostgREST<br/>REST + RPC"]
    PG[("Postgres<br/>RLS mọi bảng")]
  end

  Google["Google OAuth"]
  GCal["Google Calendar API<br/>(chưa code)"]

  App --- AS
  App --- Cache
  App --> Notif
  App --> GSI
  GSI -->|"idToken"| Google
  App -->|"signInWithIdToken"| Auth
  App -->|"supabase-js + JWT"| REST
  REST --> PG
  Auth --> PG
  App -->|"REST + access token Google"| GCal
```

| Thành phần | Vai trò | Không làm |
| --- | --- | --- |
| Expo app | Toàn bộ UI + logic: trải event lặp, chọn mốc nhắc, đồng bộ Google | Không chạy nền khi app đóng (trừ thông báo đã đặt) |
| Supabase Auth | Đổi `idToken` Google → phiên Supabase (JWT có `session_id`) | Không lưu token Google |
| Postgres + RLS | Lưu dữ liệu, chặn truy cập chéo user, chặn máy đã bị đăng xuất | Không có logic nghiệp vụ ngoài vài hàm (`register_device`…) |
| Google Calendar | Lịch chính của user, đồng bộ 2 chiều khi bật | Không webhook, không đồng bộ nền |

### RLS là gì

**RLS (Row Level Security)** = luật phân quyền **theo từng dòng** của Postgres, gắn vào bảng. Mỗi lệnh `select / insert / update / delete` đều bị Postgres lọc qua luật này, dù gọi từ đâu.

Vì sao cần: app không có server riêng, key Supabase (`anon key`) nằm trong app nên ai cũng lấy được. Bảo mật không dựa vào app mà dựa vào RLS ở DB: có key cũng chỉ chạm được dòng của chính mình.

```mermaid
flowchart LR
  Req["App gửi: select * from events<br/>kèm JWT của user A"] --> PGR["PostgREST"]
  PGR -->|"đặt auth.uid() = A<br/>từ JWT"| Policy{"Luật RLS của bảng events"}
  Policy -->|"user_id = A và<br/>phiên còn hiệu lực"| Keep["Trả về"]
  Policy -->|"dòng của user khác<br/>hoặc máy đã bị đăng xuất"| Drop["Bị loại, như không tồn tại"]
```

Luật thật của bảng `events` (migration S2):

```sql
create policy "events: all own" on public.events
for all to authenticated
using (user_id = (select auth.uid()) and (select public.session_active()))      -- được đọc / sửa / xoá dòng nào
with check (user_id = (select auth.uid()) and (select public.session_active())); -- được ghi dòng mới ra sao
```

- `auth.uid()`: id user lấy từ JWT, app không tự khai được.
- `session_active()`: phiên của máy còn trong `user_devices` → máy bị đá (mục 6) mất quyền ngay.
- `using`: lọc dòng khi đọc / sửa / xoá. `with check`: chặn ghi dòng mang `user_id` của người khác.
- Vi phạm khi ghi → lỗi `42501`. Đọc dòng không được phép → không lỗi, chỉ không thấy.

## 2. Các lớp trong app

```mermaid
flowchart TB
  Screens["app/src/app/<br/>Màn hình (Expo Router)<br/>login · (tabs) · settings/devices"]
  Features["app/src/features/(tính năng)/<br/>UI tính năng + hook (useEvents…)"]
  Api["features/*/api.ts<br/>gọi Supabase, đổi lỗi → ForbiddenError / ConflictError"]
  Lib["app/src/lib/<br/>hàm thuần, có test<br/>lunar · holidays · recurrence · calendar"]
  Shared["app/src/components/ · theme · i18n<br/>UI dùng chung"]
  Client["lib/supabase.ts<br/>1 client, tự refresh token khi app mở"]

  Screens --> Features
  Screens --> Shared
  Features --> Shared
  Features --> Api
  Features --> Lib
  Api --> Client
```

- `lib/` không gọi mạng, không import React → test bằng Jest (`app/src/__tests__/`).
- `api.ts` tách khỏi UI → hook (TanStack Query) lo cache, làm mới, gom lỗi.
- `AuthProvider` bọc toàn app: giữ `profile`, `settings`, kiểm tra phiên khi mở app / về foreground.

## 3. Lưu dữ liệu

Chi tiết cột: [S1 db.md](sprint-1/design/db.md) · [S2 db.md](sprint-2/design/db.md).

```mermaid
erDiagram
  AUTH_USERS ||--|| PROFILES : "trigger tạo"
  AUTH_USERS ||--|| USER_SETTINGS : "trigger tạo"
  AUTH_USERS ||--o{ USER_DEVICES : "tối đa 2"
  AUTH_USERS ||--o| GOOGLE_SYNC_STATE : "khi bật đồng bộ"
  AUTH_USERS ||--o{ EVENTS : ""
  EVENTS ||--o{ EVENT_EXCEPTIONS : "skip / override"
  AUTH_USERS ||--o{ NOTE_CATEGORIES : "≤ 30"
  NOTE_CATEGORIES |o--o{ NOTES : "set null khi xoá"
  AUTH_USERS ||--o{ NOTES : ""

  PROFILES {
    uuid id PK
    text display_name
    text email
    text avatar_url
  }
  USER_SETTINGS {
    uuid user_id PK
    text language
    smallint week_start
    text time_zone
    bool notifications_enabled
  }
  USER_DEVICES {
    uuid user_id PK
    uuid device_id PK
    uuid session_id UK
    timestamptz signed_in_at
    timestamptz last_seen_at
  }
  EVENTS {
    uuid id PK "app tự sinh"
    uuid user_id
    text title
    bool all_day
    timestamptz starts_at
    date start_date
    text repeat "none..lunar_yearly"
    date span_start "lọc khoảng ngày"
    date span_end
    text google_event_id "unique theo user"
    text google_status
    timestamptz updated_at "khoá lạc quan"
  }
  EVENT_EXCEPTIONS {
    uuid id PK
    uuid event_id FK
    date occurrence_date "unique theo event"
    text kind
  }
  GOOGLE_SYNC_STATE {
    uuid user_id PK
    bool enabled
    text sync_token
    smallint synced_year
  }
  NOTE_CATEGORIES {
    uuid id PK
    text name "unique lower theo user"
    text color
  }
  NOTES {
    uuid id PK
    uuid category_id FK
    text title
    jsonb checklist
    text search_text "bỏ dấu"
    bool pinned
    timestamptz deleted_at "thùng rác"
  }
```

Nguyên tắc lưu:

| Nguyên tắc | Lý do |
| --- | --- |
| Mọi bảng có `user_id` + RLS `user_id = auth.uid()` và `session_active()` | Không lộ dữ liệu giữa user; máy bị đăng xuất dừng ngay |
| `id` do app sinh (uuid) | Gửi lại không tạo bản trùng |
| `updated_at` do trigger đặt | Dùng làm phiên bản cho khoá lạc quan |
| Event lặp = 1 dòng quy tắc + ngoại lệ | DB không phình; app tự trải ra các lần |
| `span_start` / `span_end` | Tải đúng event chạm khoảng ngày đang xem, có index |
| Ghi chú xoá mềm (`deleted_at`) | Thùng rác khôi phục được |
| Trên máy chỉ có phiên + cache | Online-only; cache chỉ để xem |

## 4. User hoạt động ra sao

```mermaid
flowchart TD
  Open(["Mở app"]) --> Local{"Có phiên trên máy?"}
  Local -->|Không| Login["Màn Đăng nhập"]
  Local -->|Có| Active{"session_active()?"}
  Active -->|false| Kicked["Đăng xuất + hộp<br/>Bạn đã bị đăng xuất"] --> Login
  Active -->|"true / lỗi mạng"| Tabs["Tab Lịch"]
  Login -->|"Google"| Tabs

  Tabs --> Cal["Lịch: Tháng · Tuần · Ngày · Danh sách<br/>dương + âm + ngày lễ"]
  Tabs --> Manage["Quản lý: Notes<br/>(S3 Todo, S4 Diary)"]
  Tabs --> Stats["Thống kê (S4)"]
  Tabs --> Settings["Cài đặt: ngôn ngữ · lịch · thông báo<br/>Google Calendar · Thiết bị"]

  Cal -->|"bấm ngày"| DayPop["Pop-up ngày"] --> Detail["Chi tiết event"] --> Edit["Sửa / Xoá<br/>cả chuỗi hoặc chỉ lần này"]
  Tabs -->|"nút +"| Create["Tạo Sự kiện / Ghi chú"]
  Manage --> Editor["Editor note<br/>Back = tự lưu"]
  Push(["Thông báo nhắc"]) -->|bấm| Detail
```

## 5. Đăng nhập + phiên

Spec: [S1 F2](sprint-1/F2-google-sign-in.md) · [S2 F7](sprint-2/F7-device-limit.md).

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

## 6. Giới hạn 2 thiết bị

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

## 7. Đọc lịch: event lặp

Spec: [S2 F1](sprint-2/F1-calendar.md) · [S2 F2](sprint-2/F2-event.md).

```mermaid
sequenceDiagram
  autonumber
  participant UI as MonthView
  participant Q as TanStack Query
  participant API as events/api.ts
  participant DB as Postgres
  participant L as lib/recurrence + lunar

  UI->>Q: useEventsInRange(from, to)
  alt Có trong cache
    Q-->>UI: Dữ liệu cache (vẫn làm mới nền)
  else Chưa có
    Q->>API: fetchEvents(from, to)
    API->>DB: events where span_start ≤ to and span_end ≥ from<br/>and deleted_at is null
    DB-->>API: Các dòng quy tắc (dùng index user_id, span_start)
    Q->>API: fetchExceptions(ids)
    API->>DB: event_exceptions where event_id in ids
    DB-->>API: skip / override
    API-->>Q: events + exceptions
  end
  Q->>L: occurrencesForEvents(events, exceptions, range, timeZone)
  L-->>UI: Danh sách lần diễn ra (bỏ skip, áp override)
  UI->>UI: Xếp thanh event (lib/calendar/eventBars)
```

- DB chỉ lưu quy tắc; lặp dương (ngày/tuần/tháng/năm) và lặp năm âm lịch được trải ra **trên máy**, trong khoảng ngày đang xem.
- Lịch âm + ngày lễ tính hoàn toàn trên máy (`lib/lunar`, `lib/holidays`), không gọi mạng.

## 8. Ghi dữ liệu: không trùng, không mất

```mermaid
flowchart TD
  Save(["Bấm Lưu"]) --> Online{"Có mạng?"}
  Online -->|Không| Block["Banner mất mạng<br/>khoá nút Lưu"]
  Online -->|Có| New{"Tạo mới?"}

  New -->|Có| Gen["App sinh id = uuid"] --> Ins["insert events (id, …)"]
  Ins -->|"Gửi lại / bấm 2 lần"| Dup["Trùng PK → không tạo bản 2"]
  Ins -->|OK| Done

  New -->|"Sửa"| Upd["update … where id = :id<br/>and updated_at = :đã_đọc"]
  Upd -->|"1 dòng"| Done["Làm mới cache lịch<br/>(chưa code: đặt lại nhắc, đẩy Google)"]
  Upd -->|"0 dòng"| Conflict["ConflictError<br/>→ mục 9"]

  Ins & Upd -->|"42501"| Forbidden["ForbiddenError<br/>→ hỏi lại session_active()"]
  Forbidden -->|false| Out["Đăng xuất + hộp báo"]
  Forbidden -->|true| Toast["Toast lỗi, giữ form"]
  Ins & Upd -->|"Lỗi mạng"| Toast
```

- `updated_at` giữ nguyên chuỗi API trả về (không đổi qua `Date`, tránh mất micro giây → so sánh sai).
- Sửa kiểu lặp / ngày bắt đầu → xoá ngoại lệ cũ (ngày gốc không còn khớp).
- Danh sách (notes, S3 todo): phân trang **keyset** `(pinned, updated_at, id)` → không lặp / sót khi dữ liệu đổi lúc đang cuộn.

## 9. Xung đột dữ liệu

### 9.1. Hai tài khoản khác nhau

Không bao giờ thấy hay sửa được dữ liệu của nhau — RLS chặn ở DB, không phụ thuộc app ([RLS là gì](#rls-là-gì)).

```mermaid
flowchart LR
  UA["User A<br/>JWT: sub = A"] -->|"select / update events"| RLS{"RLS<br/>user_id = auth.uid()<br/>and session_active()"}
  UB["User B<br/>JWT: sub = B"] -->|"select / update events"| RLS
  RLS -->|"chỉ dòng user_id = A"| RA[("Dòng của A")]
  RLS -->|"chỉ dòng user_id = B"| RB[("Dòng của B")]
  UA -. "sửa id của B" .-x RB
```

- A sửa/xoá dòng của B → 0 dòng bị ảnh hưởng (như không tồn tại).
- A không gắn được note vào danh mục của B, không gắn ngoại lệ vào event của B (`with check`).
- Test: `supabase/tests/rls_s1.sql`, `rls_s2.sql`.

### 9.2. Cùng tài khoản, 2 máy sửa cùng 1 event / note

Khoá lạc quan theo `updated_at`.

```mermaid
sequenceDiagram
  autonumber
  participant M1 as Máy 1
  participant M2 as Máy 2
  participant DB as Postgres

  M1->>DB: Đọc event X
  DB-->>M1: X (updated_at = t1)
  M2->>DB: Đọc event X
  DB-->>M2: X (updated_at = t1)

  M2->>DB: update X where updated_at = t1
  DB-->>M2: 1 dòng, updated_at = t2
  Note over DB: Trigger set_updated_at → t2

  M1->>DB: update X where updated_at = t1
  DB-->>M1: 0 dòng (đã là t2)
  M1->>M1: Hộp Đã thay đổi ở thiết bị khác

  alt Tải bản mới
    M1->>DB: Đọc lại X
    DB-->>M1: Bản của Máy 2 (bỏ thay đổi của Máy 1)
  else Ghi đè
    M1->>DB: Đọc updated_at mới (t2) rồi update where updated_at = t2
    DB-->>M1: 1 dòng, updated_at = t3 (bản của Máy 1 thắng)
  end
```

### 9.3. Các trường hợp xung đột khác

| Trường hợp | Cách xử lý |
| --- | --- |
| 1 máy xoá, máy kia đang sửa | Sửa → 0 dòng → hộp xung đột; Tải bản mới → không còn event, đóng form |
| 2 máy cùng sửa "chỉ lần này" 1 lần lặp | Upsert theo `(event_id, occurrence_date)` → 1 ngoại lệ, bản ghi sau cùng thắng |
| 2 máy cùng đăng nhập lúc 2 máy khác đang dùng | `register_device` khoá theo user → xếp hàng, luôn ≤ 2 máy |
| 2 máy cùng bật đồng bộ Google | Xem [mục 10](#10-đồng-bộ-google-calendar): id cố định + upsert theo `google_event_id` |
| Sửa ở Daynest và trên Google giữa 2 lần đồng bộ | Bản sửa sau cùng thắng (so `updated` Google với `updated_at`) |
| Bấm Lưu 2 lần / mạng chập chờn | `id` app sinh → không tạo trùng |

## 10. Đồng bộ Google Calendar

**(chưa code)** — spec: [S2 F4](sprint-2/F4-google-calendar.md). Chỉ khi bật trong Cài đặt; phạm vi = event năm hiện tại + event lặp còn diễn ra trong năm (không đẩy lặp âm).

```mermaid
sequenceDiagram
  autonumber
  participant A as App
  participant DB as Postgres
  participant G as Google Calendar

  rect rgba(120,180,255,0.12)
  Note over A,G: Bật đồng bộ lần đầu
  A->>A: Xin scope calendar.events
  A->>G: events.list (năm nay, singleEvents=false)
  G-->>A: Event + nextSyncToken
  A->>DB: Upsert theo (user_id, google_event_id)
  A->>G: Đẩy event Daynest trong phạm vi<br/>id Google = id Daynest bỏ dấu -
  G-->>A: 200 hoặc 409 (đã có = coi như xong)
  A->>DB: Lưu sync_token, synced_year
  end

  rect rgba(120,220,160,0.12)
  Note over A,G: Đang bật — Daynest → Google
  A->>DB: Lưu event
  A->>G: insert / patch (If-Match etag) / delete
  alt Lỗi mạng / 429
    A->>DB: google_status = pending (đẩy lại lần sau)
  else 412 etag cũ
    A->>G: Kéo bản mới → bản sửa sau cùng thắng
  end
  end

  rect rgba(255,200,120,0.12)
  Note over A,G: Đang bật — Google → Daynest (mở app nếu > 5 phút, kéo xuống, Đồng bộ ngay)
  A->>DB: session_active() trước khi đồng bộ
  A->>G: events.list(syncToken)
  alt 410 Gone
    A->>G: Kéo lại cả năm, ghép theo google_event_id
  else Có thay đổi
    G-->>A: Event đổi / cancelled
    A->>DB: Upsert / xoá
  end
  A->>A: Đặt lại thông báo, làm mới lịch
  end
```

- Token Google chỉ ở trên máy (SDK tự làm mới), không lưu DB.
- Tắt đồng bộ → giữ nguyên dữ liệu 2 bên, giữ `google_event_id` để bật lại ghép đúng, không trùng.

## 11. Nhắc nhở

**(chưa code)** — spec: [S2 F3](sprint-2/F3-reminders.md). Thông báo đặt trên từng máy từ dữ liệu DB; không push từ server.

```mermaid
flowchart LR
  Trigger["Mở app / foreground<br/>lưu-xoá event<br/>đồng bộ Google xong<br/>đổi công tắc · đăng nhập"] --> Enabled{"notifications_enabled<br/>+ có quyền?"}
  Enabled -->|Không| Cancel["Huỷ hết thông báo"]
  Enabled -->|Có| Load["Tải event 30 ngày tới"]
  Load --> Pick["Hàm thuần chọn mốc<br/>trải lặp, áp ngoại lệ<br/>bỏ mốc đã qua"]
  Pick --> Limit["Lấy ≤ 60 mốc gần nhất"]
  Limit --> Reset["Huỷ hết → đặt lại<br/>expo-notifications"]
  Reset --> Fire(["Đến giờ: thông báo<br/>bấm → Chi tiết đúng lần lặp"])
  Logout["Đăng xuất / bị đá"] --> Cancel
```

## 12. Xử lý traffic

Mục tiêu: 100 user cùng lúc, tổng ~10.000 user ([Spec tổng §3](index.md#mục-tiêu-tải) · gói Supabase: [supabase-plans.md](supabase-plans.md)).

```mermaid
flowchart LR
  subgraph Clients["~100 máy cùng lúc"]
    D1["Máy 1"]
    D2["Máy 2"]
    Dn["Máy n"]
  end

  subgraph AppSide["Giảm request ở app"]
    C1["Cache TanStack Query<br/>retry 1 lần"]
    C2["Chỉ tải khoảng ngày đang xem"]
    C3["Lặp / âm lịch / lễ tính trên máy"]
    C4["touch_device ≤ 1 lần / 5 phút<br/>kéo Google ≤ 1 lần / 5 phút"]
  end

  subgraph DBSide["Giảm tải DB"]
    I1["Index (user_id, span_start)"]
    I2["Index notes keyset<br/>(user_id, pinned, updated_at, id)"]
    I3["RLS dùng (select auth.uid())<br/>tính 1 lần / truy vấn"]
    I4["Không offset, không quét toàn bảng"]
  end

  D1 & D2 & Dn --> AppSide --> PostgREST["Supabase PostgREST"] --> DBSide --> PG[("Postgres")]
  D1 & D2 & Dn -->|"token của từng user,<br/>quota Google tính theo user"| GCal["Google Calendar"]
```

| Cơ chế | Tác dụng |
| --- | --- |
| Không server riêng, không trạng thái chung giữa user | Không có điểm nghẽn ngoài Supabase; mỗi user chỉ chạm dòng của mình |
| Event lặp lưu 1 dòng | DB ~10–50 KB/user → 100–500 MB cho 10.000 user (sát 500 MB, theo dõi) |
| Truy vấn theo khoảng ngày + index | Đọc lịch tháng chỉ vài chục dòng/user |
| Google `429` / `rateLimitExceeded` | Chờ tăng dần rồi thử lại (lúc đẩy hàng loạt) |
| Kiểm tra tải mỗi sprint | DB local, seed 10.000 user, 100 user ảo × 5 phút → 0 lỗi, p95 < 1 s ([S2 db.md](sprint-2/design/db.md#kiểm-tra-tải)) |

## 13. Xử lý lỗi

[Spec tổng §5](index.md#5-xử-lý-lỗi-chung).

```mermaid
flowchart TD
  Err(["Lỗi khi gọi API"]) --> Kind{"Loại lỗi"}
  Kind -->|"Mất mạng"| Net["Banner, khoá nút Lưu<br/>giữ form"]
  Kind -->|"42501 RLS"| Rls["Hỏi session_active()"]
  Rls -->|false| Kick["Đăng xuất + hộp Bạn đã bị đăng xuất"]
  Rls -->|true| Toast["Toast lỗi, giữ form"]
  Kind -->|"0 dòng khi update"| Conf["Hộp Đã thay đổi ở thiết bị khác"]
  Kind -->|"Token Google lỗi"| Retry["Thử lại 1 lần"] -->|"vẫn lỗi"| Reconnect["Cần kết nối lại Google"]
  Kind -->|"Từ chối quyền thông báo"| Perm["Vẫn lưu nhắc<br/>cảnh báo + nút Mở cài đặt máy"]
  Kind -->|"Khác"| Toast
```
