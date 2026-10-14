# Tổng quan hệ thống Daynest

Thuộc: [Tài liệu Daynest](index.md). Bản có sơ đồ: [overview.html](overview.html) (mở bằng trình duyệt).

Kiến trúc, cấu trúc code và 5 luồng chính. Theo code v5.0.1 (hết S5), cập nhật 2026-10-14.

## 1. Daynest là gì

App cá nhân trên điện thoại, 3 phần: **Lịch** (dương + âm, ngày lễ, event, todo, chu kỳ kinh nguyệt), **Ghi chú**, **Chi tiêu**. Android + iOS, viết bằng Expo (React Native + TypeScript).

## 2. Quyết định lớn nhất: không có backend tự viết

```text
┌──────────── Điện thoại ─────────────┐
│  Expo app (toàn bộ UI + logic)      │
│   ├─ AsyncStorage: phiên đăng nhập, │
│   │   cache dữ liệu, ngôn ngữ       │
│   ├─ TanStack Query: cache trong RAM│
│   └─ expo-notifications: nhắc nhở   │
└──────┬───────────────┬──────────────┘
       │ supabase-js   │ REST + token Google
       ▼               ▼
┌─────────────────┐  ┌──────────────────────┐
│ Supabase        │  │ Google               │
│ • Auth (JWT)    │  │ • Đăng nhập (OAuth)  │
│ • PostgREST     │  │ • Calendar API       │
│ • Postgres + RLS│  └──────────────────────┘
│ • Storage (ảnh) │
│ • 1 Edge Function (gửi mail báo lỗi)
└─────────────────┘
```

- **Không có server Go/Node.** PostgREST tự sinh REST API từ bảng. App gọi thẳng `supabase.from('events').select()`.
- **Quyền truy cập do Postgres quyết định.** Mọi bảng có RLS (Row Level Security, luật lọc dòng ngay trong DB): `user_id = auth.uid() AND session_active()`. App không tự kiểm tra quyền.
- **Logic nghiệp vụ nằm trong app:** trải event lặp, âm lịch, đặt nhắc, đồng bộ Google đều chạy trên máy.

Lý do: app cá nhân, gói Supabase Free, không muốn vận hành server. Đổi lại, app phải tự lo nhiều việc.

## 3. Bản đồ thư mục

```text
daynest/
├─ app/                    ← app Expo (phần lớn thời gian làm ở đây)
│  └─ src/
│     ├─ app/              ← MÀN HÌNH (Expo Router: đường dẫn file = route)
│     │   ├─ _layout.tsx   ← gốc: Provider, kiểm tra đăng nhập
│     │   ├─ (auth)/login.tsx
│     │   ├─ (tabs)/       ← calendar · expenses · manage · settings
│     │   └─ event/ note/ todo/ expense/ settings/  ← màn chi tiết, form
│     ├─ features/<tên>/   ← UI tính năng + hook + api.ts (gọi Supabase)
│     ├─ lib/              ← hàm THUẦN, không mạng, không React → có test Jest
│     │   lunar · holidays · recurrence · google/mapping · notifications/pickReminders
│     ├─ components/       ← UI dùng chung (AppText, Button, Dialog…)
│     ├─ theme/ i18n/ locales/ (en.json + vi.json)
│     └─ __tests__/        ← test cho lib/
├─ supabase/
│  ├─ migrations/*.sql     ← bảng, RLS, hàm SQL (cách DUY NHẤT đổi DB)
│  ├─ functions/send-bug-report/
│  └─ db                   ← script: new | test | status | migrate
├─ docs/                   ← spec theo sprint + kiến trúc (tiếng Việt)
└─ wip/                    ← todo từng việc (tiếng Việt)
```

Các lớp phụ thuộc một chiều:

```text
Màn hình (app/)  →  features/ (hook TanStack Query)  →  features/*/api.ts  →  lib/supabase.ts
                            └──────────→  lib/ (hàm thuần: âm lịch, lặp, nhắc)
```

Đọc 1 tính năng theo thứ tự: màn hình → hook `useXxx.ts` → `api.ts` → migration của bảng.

## 4. Flow 1: mở app và đăng nhập

Code: [_layout.tsx](../app/src/app/_layout.tsx), [AuthProvider.tsx](../app/src/features/auth/AuthProvider.tsx).

```text
Mở app
 └─ RootLayout: tải font + ngôn ngữ đã lưu
     └─ PersistQueryClientProvider (khôi phục cache từ AsyncStorage)
         └─ AuthProvider
             ├─ Không có phiên trên máy → màn Login
             └─ Có phiên:
                 1. Vẽ ngay từ snapshot đã lưu (profile + settings) → không chờ mạng
                 2. rpc session_active()
                      false → máy đã bị đá ra → xoá cache, đăng xuất, hiện hộp báo
                      true  → touch_device(), tải settings mới
             └─ RootStack: app_config.min_version_code → bản quá cũ thì màn "Cần cập nhật"
                 └─ Stack.Protected: đã đăng nhập → (tabs)/calendar, chưa → login
```

- **Đăng nhập:** Google Sign-In SDK → `idToken` → `supabase.auth.signInWithIdToken` → phiên Supabase (JWT) → `rpc('register_device')`.
- **Giới hạn 2 thiết bị:** bảng `user_devices`. Máy thứ 3 đăng nhập → `register_device` đá máy sớm nhất. Máy bị đá biết khi:
  - app quay lại foreground → gọi `session_active()`;
  - 1 lệnh ghi bị RLS từ chối (`42501`) → `ForbiddenError` → `useForbiddenGuard` kiểm tra lại phiên.
- Server không đẩy thông báo xuống máy, nên app phải tự hỏi.

## 5. Flow 2: đọc lịch (phần khó nhất)

Code: [useEvents.ts](../app/src/features/events/useEvents.ts), [api.ts](../app/src/features/events/api.ts), [lib/recurrence/](../app/src/lib/recurrence/).

Ý chính: **DB lưu quy tắc, app trải ra từng lần.** Event "hằng tháng âm lịch" chỉ là 1 dòng `events` + vài dòng `event_exceptions` (bỏ 1 lần / sửa 1 lần).

```text
Màn Lịch đang xem tháng 10
 └─ useEventsInRange({from, to})
     ├─ queryKey = ['events', '2026-10-01', '2026-10-31']
     ├─ Có cache, chưa quá 2 phút → dùng luôn, không gọi mạng
     ├─ Chưa có → tạm hiện khoảng rộng hơn đã tải / dữ liệu cũ (lưới không nháy rỗng)
     ├─ queryFn:
     │    fetchEvents: span_start ≤ to và span_end ≥ from (nới ±1 ngày vì lệch UTC)
     │    fetchExceptions: event_exceptions của các event đó
     └─ useMemo → occurrencesForEvents(events, exceptions, range, timeZone)
           = trải quy tắc lặp (dương/âm) → bỏ/sửa theo ngoại lệ → danh sách "lần xảy ra"
 └─ usePrefetchEvents: tải trước tháng trước/sau → vuốt không chờ
```

Cache 2 tầng ([queryClient.ts](../app/src/features/cache/queryClient.ts)):

| Tầng | Giữ bao lâu | Ghi chú |
| --- | --- | --- |
| RAM (TanStack Query) | Coi là mới trong 2 phút | Lưu xong → `invalidateQueries` tải lại ngay |
| AsyncStorage | 7 ngày | Xoá khi lên version mới, khi đăng xuất (user sau không thấy dữ liệu user trước) |

Todo ([features/todos/](../app/src/features/todos/)) và chu kỳ ([features/cycle/](../app/src/features/cycle/)) dùng cùng mẫu.

## 6. Flow 3: ghi dữ liệu (không trùng, không mất)

```text
Mở form → app sinh id = uuid NGAY LÚC MỞ
Bấm Lưu
 ├─ Tạo mới: upsert({id, …}, onConflict 'id')
 │     → mạng chập chờn, gửi lại, bấm 2 lần vẫn chỉ 1 dòng   (idempotency)
 ├─ Sửa: update … WHERE id = :id AND updated_at = :giá_trị_đã_đọc
 │     → 0 dòng = máy khác đã sửa trước → ConflictError
 │       → hộp "Đã thay đổi ở thiết bị khác": Tải bản mới / Ghi đè   (khoá lạc quan)
 ├─ Lỗi 42501 → ForbiddenError → kiểm tra lại phiên (có thể đã bị đá ra)
 └─ Thành công (onSuccess):
       1. googleSync.afterEventSaved(id)  → đẩy lên Google (nếu bật đồng bộ)
       2. resyncReminders()               → đặt lại toàn bộ thông báo
       3. invalidateQueries(['events'])   → lịch tự tải lại
```

2 bẫy cần nhớ:

- Giữ `updated_at` nguyên chuỗi API trả về. Đổi qua `Date` mất micro giây → so sánh sai → báo xung đột giả.
- Supabase client gửi `Cache-Control: no-cache`: lớp HTTP của Android từng trả dữ liệu cũ ([lib/supabase.ts](../app/src/lib/supabase.ts)).

## 7. Flow 4: đồng bộ Google Calendar 2 chiều

Code: [features/google/](../app/src/features/google/) — `sync.ts` điều phối, `pull.ts` (Google → Daynest), `push.ts` (Daynest → Google), `lib/google/mapping.ts` (đổi định dạng).

```text
Daynest → Google (ngay sau khi lưu, xếp hàng, không chồng nhau)
   insert / patch / delete — id Google = id Daynest bỏ dấu "-"
   lỗi mạng → google_status = 'pending' → pushPending() đẩy lại lần sau

Google → Daynest (mở app nếu lần kéo trước > 5 phút, hoặc bấm "Đồng bộ ngay")
   events.list(syncToken) → chỉ lấy phần đã đổi
     410 Gone → kéo lại cả năm
   upsert theo (user_id, google_event_id) · 'cancelled' → xoá
   kiểu lặp Daynest không biểu diễn được → lưu từng lần thành event chỉ xem (google_readonly)
   → làm mới lịch + đặt lại nhắc
```

- Token Google chỉ ở trên máy, không lưu DB. `google_sync_state` giữ `sync_token`.
- Tắt đồng bộ → không xoá gì 2 bên; giữ `google_event_id` để bật lại ghép đúng, không trùng.

## 8. Flow 5: nhắc nhở

Code: [reminderSync.ts](../app/src/features/reminders/reminderSync.ts), [pickReminders.ts](../app/src/lib/notifications/pickReminders.ts).

Không có server gửi push. Mọi thông báo là **thông báo đặt sẵn trên máy**:

```text
Lưu event / mở app / đổi cài đặt → resyncReminders()   (chạy lần lượt)
  cancelAll()
  → đọc event + todo + chu kỳ sắp tới
  → pickReminders: (lần xảy ra × mốc nhắc) gần nhất, có giới hạn (iOS ≤ 64)
  → scheduleAll()
Bấm thông báo → useNotificationTap → mở đúng event
```

## 9. Database

Bảng chính ([supabase/migrations/](../supabase/migrations/)):

| Nhóm | Bảng |
| --- | --- |
| Tài khoản | `profiles`, `user_settings`, `user_devices`, `app_config` |
| Lịch | `events`, `event_exceptions`, `google_sync_state`, `todos`, `todo_exceptions`, `period_days` |
| Ghi chú | `notes`, `note_categories` |
| Chi tiêu | `expenses`, `expense_categories` |
| Báo lỗi | `bug_reports` (+ bucket Storage + Edge Function gửi mail) |

- Mọi bảng: `id`, `user_id`, `created_at`, `updated_at`, RLS, index bắt đầu bằng `user_id`.
- Logic SQL: `register_device` / `session_active` / `touch_device`, `expense_monthly_totals`, trigger tạo dữ liệu mặc định cho user mới (`handle_new_user*`), `check_bug_report_limit` (≤ 5 báo lỗi/ngày).

## 10. Chạy và phát triển

1. **Chạy app:** điền `app/.env` (không commit, không dán vào chat) → `cd app && npm install && npm run android`.
2. **Chạy test:** `npm run typecheck && npm run lint && npm test`. Đọc `lunar.test.ts`, `recurrence.test.ts` để hiểu phần lõi nhanh nhất.
3. **Đổi DB:** chỉ qua `supabase/db new <tên>` → viết SQL + RLS → `supabase/db test` (cần Docker).
4. **Quy tắc code:** theme token `@/theme`, chữ qua `AppText`, mọi chuỗi qua i18n (cùng key ở `en.json` + `vi.json`). Mỗi việc 1 file trong `wip/`, duyệt xong mới làm.

## Lưu ý: tài liệu kiến trúc đã cũ

[specs/architecture/](specs/architecture/index.md) ghi "theo code tới S2 bước 6":

- Còn đánh dấu **(chưa code)** cho Google sync và nhắc nhở — code đã có đủ.
- Ghi "chưa dùng Edge Functions" — đã có `supabase/functions/send-bug-report`.
- Chưa có todo, chu kỳ, chi tiêu, báo lỗi.
