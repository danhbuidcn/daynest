# Giai đoạn 1 — App lịch kiểu Cute Calendar

Ngày chốt: 2026-10-09. Tham khảo: [research/cute-calendar/features.md](../research/cute-calendar/features.md).

## 1. Mục tiêu và phạm vi

Làm app mobile quản lý lịch cá nhân giống Cute Calendar, thêm lịch âm, event lặp theo âm lịch (ngày giỗ), đăng nhập Google và kéo event từ Google Calendar về.

**Trong GĐ1:**

| Phần | Nội dung |
| --- | --- |
| Lịch | Xem tháng / tuần / ngày / danh sách, ngày âm, ngày lễ Việt Nam |
| Event | Tạo, sửa, xoá; lặp ngày/tuần/tháng/năm dương/**năm âm**; nhắc nhở; màu |
| Todo | Hạn, ghim, subtask, % hoàn thành, lọc |
| Notes | Tiêu đề, nội dung text, checklist, danh mục, ghim, tìm kiếm, thùng rác |
| Diary | 1 diary/ngày, mood 5 mức, tối đa 5 ảnh, ghim |
| Thống kê | Donut todo theo tháng, đếm mood theo tháng |
| Google | Đăng nhập Google, kéo event Google Calendar về (1 chiều) |
| Cài đặt | Tài khoản, lịch Google, tuỳ chọn lịch, thông báo |

**Ngoài GĐ1:** web (Nuxt), Go API, module Học tập / Chi tiêu / Dashboard, đẩy event lên Google, habit, sticker, theme, font, chế độ tối, định dạng chữ trong note, vẽ tay, ghi âm, khoá note, PDF, widget, thời tiết, offline.

## 2. Quyết định

| Chủ đề | Chốt | Lý do |
| --- | --- | --- |
| Nền tảng | Chỉ mobile (Expo, Android + iOS). Web làm sau | Cute Calendar là app mobile; nhắc nhở cần mobile; giảm gần nửa khối lượng |
| Kiểm thử thiết bị | Chỉ test Android máy thật. iOS build được nhưng không kiểm thật | Không có iPhone |
| Backend | Supabase (Auth, Postgres + RLS, Storage). **GĐ1 không dùng Go** | App gọi thẳng Supabase là đủ; Go để cho việc cần server sau này |
| Đồng bộ Google | **1 chiều**: app tự kéo từ Google về, không đẩy lên | Mọi thao tác làm trong app; tránh xung đột |
| Event Google trong app | Chỉ đọc, màu riêng, nhãn "Từ Google Calendar" | Nếu sửa được, lần kéo sau sẽ ghi đè |
| Lưu event Google | Lưu bản sao vào bảng `events` (`source = 'google'`) | Web làm sau đọc được cùng dữ liệu |
| Lặp âm lịch | Chỉ trong app | Google không hỗ trợ lặp âm lịch; sync là 1 chiều |
| Lịch âm | Tự viết theo thuật toán Hồ Ngọc Đức, múi giờ +7 | Dễ test, không phụ thuộc thư viện ít bảo trì |
| Online | Online-only, dữ liệu cache chỉ để xem | Đã chốt trong `docs/features.md` |

## 3. Kiến trúc

```text
[Expo app] ──supabase-js──▶ [Supabase: Auth · Postgres (RLS) · Storage]
     │
     └──REST (access token Google)──▶ [Google Calendar API]  (chỉ đọc)
```

| Thành phần | Vai trò |
| --- | --- |
| `app/` | UI, tính lịch âm, trải event lặp, kéo Google Calendar, đặt thông báo trên máy |
| Supabase | Đăng nhập, lưu dữ liệu, RLS theo `user_id`, bucket ảnh diary |
| Google Calendar API | Nguồn event Google, chỉ đọc |

### Đăng nhập

1. `@react-native-google-signin/google-signin` đăng nhập, xin scope `openid email profile https://www.googleapis.com/auth/calendar.readonly`.
2. Lấy `idToken` → `supabase.auth.signInWithIdToken({ provider: 'google', token })`.
3. Access token Google lấy qua `GoogleSignin.getTokens()` mỗi lần gọi Calendar API; SDK tự làm mới.

### Kéo Google Calendar

- Thời điểm: mở app, kéo xuống làm mới, bấm "Đồng bộ ngay" trong Cài đặt.
- Lấy danh sách lịch (`calendarList.list`); người dùng chọn lịch nào được kéo (mặc định: lịch chính).
- Mỗi lịch:
  - Chưa có `sync_token` → `events.list` toàn bộ (`singleEvents=false`, giữ RRULE), lưu `nextSyncToken`.
  - Có `sync_token` → `events.list?syncToken=...` chỉ lấy phần thay đổi.
  - Event `status = cancelled` → xoá bản tương ứng trong app.
  - Lỗi 410 → xoá `sync_token`, xoá event của lịch đó, kéo lại toàn bộ.
- Map Google → app: `summary → title`, `description → note`, `start/end` (date hoặc dateTime), RRULE đơn giản (`FREQ=DAILY|WEEKLY|MONTHLY|YEARLY`, `UNTIL`) → `repeat`. RRULE phức tạp hơn (BYDAY nhiều ngày, COUNT...) → bỏ RRULE, chỉ hiện lần đầu, và ghi log để xử lý sau. Ngoại lệ của chuỗi lặp (`recurringEventId`) → `event_exceptions`.
- Bỏ lịch khỏi danh sách kéo → xoá event của lịch đó trong app.

## 4. Dữ liệu

Mọi bảng có `id uuid`, `user_id uuid` (FK `auth.users`), `created_at`, `updated_at`. RLS: `user_id = auth.uid()` cho select/insert/update/delete.

| Bảng | Trường |
| --- | --- |
| `events` | `title`, `note`, `all_day bool`, `start_at timestamptz`, `end_at timestamptz`, `color`, `repeat` (`none`/`daily`/`weekly`/`monthly`/`yearly`), `repeat_calendar` (`solar`/`lunar`), `lunar_month int`, `lunar_day int`, `repeat_until date null`, `reminders int[]` (phút trước giờ bắt đầu), `source` (`app`/`google`), `google_calendar_id`, `google_event_id` |
| `event_exceptions` | `event_id`, `original_date date`, `is_deleted bool`, `override jsonb` (title, note, start_at, end_at, color) |
| `todos` | `title`, `due_date date null`, `pinned`, `done`, `done_at` |
| `todo_subtasks` | `todo_id`, `title`, `done`, `position` |
| `notes` | `title`, `content text`, `checklist jsonb` (`[{text, done}]`), `category_id null`, `pinned`, `deleted_at null` |
| `note_categories` | `name`, `color` |
| `diaries` | `date date` (unique theo user), `content`, `mood int 1–5`, `pinned`, `image_paths text[]` (tối đa 5) |
| `google_sync_state` | `calendar_id`, `calendar_name`, `enabled bool`, `sync_token`, `last_synced_at` |
| `user_settings` | `week_start` (0/1), `use_24h`, `show_lunar`, `show_holidays`, `diary_reminder_time time null` |

- `lunar_month`, `lunar_day` chỉ dùng khi `repeat = 'yearly'` và `repeat_calendar = 'lunar'`.
- Ràng buộc `unique (user_id, google_calendar_id, google_event_id)` để upsert khi kéo.
- Storage bucket `diary-images`, đường dẫn `{user_id}/{diary_id}/{file}`, policy theo thư mục `user_id`.

### Quy tắc lặp

- Lặp tháng rơi vào ngày không tồn tại (vd 31 trong tháng 30 ngày): bỏ qua lần đó, giống Google Calendar.
- Lặp năm dương từ 29/2: chỉ xuất hiện năm nhuận.

- Lặp hằng năm âm lịch: mỗi năm âm, lấy ngày `lunar_day` của tháng `lunar_month` **thường** (không lấy tháng nhuận), đổi ra ngày dương.
- Tháng âm năm đó chỉ có 29 ngày mà `lunar_day = 30` → dùng ngày 29.
- Giờ bắt đầu/kết thúc giữ như event gốc.

## 5. Màn hình và luồng

### Điều hướng

Thanh dưới: **Lịch · Quản lý · `+` · Thống kê · Cài đặt**. Chưa đăng nhập → màn Đăng nhập (một nút "Đăng nhập bằng Google").

### Lịch

- **Tháng** (mặc định): lưới 6 tuần. Ô ngày hiện ngày dương, ngày âm (mùng 1 và rằm hiện kèm tháng âm, vd `1/3`), tên ngày lễ, thanh màu event, icon mood nếu có diary, chấm nếu có todo đến hạn.
- **Tuần / Ngày / Danh sách**: như Cute Calendar ([03](../research/cute-calendar/screenshots/03-calendar-week.png), [04](../research/cute-calendar/screenshots/04-calendar-day.png), [02](../research/cute-calendar/screenshots/02-calendar-list.png)).
- Bấm ngày → sheet: event, todo, diary của ngày + nút `+` tạo cho ngày đó.
- Thanh trên: đổi tháng, "Hôm nay", tìm event theo tên.
- Ngày lễ: dương (1/1, 30/4, 1/5, 2/9...) và âm (Tết, Giỗ Tổ 10/3, Rằm tháng Giêng, Trung thu...). Danh sách cố định trong code.

### Nút `+`

Sheet chọn: Event · Todo · Note · Diary.

### Event

- Form: tiêu đề (bắt buộc), ghi chú, cả ngày hoặc giờ bắt đầu–kết thúc, màu (6 màu), nhắc nhở (nhiều mốc: 0, 5, 15, 30, 60 phút, 1 ngày trước).
- Lặp: Không · Hằng ngày · Hằng tuần · Hằng tháng · Hằng năm (dương) · Hằng năm (âm). Chọn "âm" → hiện ngày âm của ngày bắt đầu, sửa được tháng/ngày âm. Ngày kết thúc lặp (tuỳ chọn).
- Sửa/xoá một lần xuất hiện của event lặp → hỏi "Chỉ lần này" / "Tất cả". "Chỉ lần này" → ghi `event_exceptions`.
- Xoá luôn hỏi xác nhận.
- Event Google: màn chi tiết chỉ đọc, không có Sửa/Xoá.

### Todo (Quản lý → Todo)

- Form: tiêu đề, hạn, ghim, subtask.
- Xong hết subtask → todo tự `done`. % = subtask xong / tổng.
- Lọc: Quá hạn · Hôm nay · Tuần · Tháng. Thẻ tổng "Hôm nay — N việc — x%".

### Notes (Quản lý → Notes)

- Danh sách: lọc danh mục, ghim lên đầu, tìm theo tiêu đề + nội dung.
- Editor: tiêu đề, nội dung text, checklist. Back → tự lưu (note trống thì không lưu).
- Xoá → thùng rác (`deleted_at`). Thùng rác: Khôi phục / Xoá vĩnh viễn.
- Quản lý danh mục: thêm, sửa, xoá (note trong danh mục bị xoá → không danh mục), chọn màu.

### Diary (Quản lý → Diary)

- Mỗi ngày tối đa 1 diary; tạo cho ngày đã có → mở diary đó để sửa.
- Form: nội dung, mood 5 mức, ghim, ảnh (camera/thư viện, tối đa 5).
- Danh sách theo tháng: thẻ nội dung + ngày + mood.

### Thống kê

- Todo tháng: donut Chưa xong / Xong.
- Mood tháng: số ngày theo từng mức.

### Cài đặt

- Tài khoản: tên, email, Đăng xuất.
- Google Calendar: bật/tắt từng lịch, "Đồng bộ ngay", thời điểm đồng bộ gần nhất, trạng thái "Cần kết nối lại" khi token lỗi.
- Lịch: tuần bắt đầu Thứ 2/Chủ nhật, 24 giờ, hiện ngày âm, hiện ngày lễ.
- Thông báo: bật/tắt, giờ nhắc viết diary (tuỳ chọn).

### Nhắc nhở

- `expo-notifications`, đặt lịch trên máy (local notification).
- Event lặp: chỉ đặt cho các lần trong 30 ngày tới; đặt lại mỗi lần mở app. Tổng số chờ giữ dưới 60 (giới hạn iOS 64).
- Event Google: không đặt nhắc trong GĐ1 (Google tự nhắc).
- Nhắc diary: thông báo lặp hằng ngày theo `diary_reminder_time`.

## 6. Xử lý lỗi

| Tình huống | Xử lý |
| --- | --- |
| Mất mạng | Banner "Không có kết nối"; khoá nút Lưu; vẫn xem dữ liệu đã cache |
| Lưu thất bại | Toast lỗi, giữ nguyên form |
| Token Google hết hạn/thu hồi | Thử lấy token mới 1 lần; lỗi tiếp → Cài đặt hiện "Cần kết nối lại Google"; event Google cũ vẫn hiện |
| `syncToken` hết hạn (410) | Xoá token và event của lịch đó, kéo lại toàn bộ |
| Event Google bị xoá | `status = cancelled` → xoá trong app |
| Upload ảnh lỗi | Báo lỗi riêng ảnh đó, diary vẫn lưu |
| Từ chối quyền thông báo | Vẫn lưu nhắc nhở; Cài đặt hiện gợi ý bật quyền |

## 7. Cấu trúc code

```text
app/
  src/
    app/              # Expo Router: (auth)/login, (tabs)/calendar|manage|stats|settings, màn form/chi tiết
    features/
      calendar/       # lưới tháng/tuần/ngày, sheet ngày
      events/         # form, chi tiết, ngoại lệ lặp
      todos/ notes/ diary/ stats/ settings/
    lib/
      lunar/          # dương ↔ âm, ngày lễ VN — hàm thuần
      recurrence/     # trải event lặp (dương, âm, ngoại lệ) ra các lần xuất hiện trong khoảng ngày
      google/         # Calendar API, sync syncToken, map dữ liệu
      notifications/  # đặt/huỷ thông báo
      supabase.ts
supabase/
  migrations/         # bảng, RLS, bucket Storage
```

Thư viện: Expo SDK bản ổn định mới nhất, TypeScript, Expo Router, TanStack Query, `@supabase/supabase-js`, `@react-native-google-signin/google-signin`, `expo-notifications`, `expo-image-picker`, `date-fns`, Jest. Không thêm thư viện state riêng.

Google Sign-In native không chạy trong Expo Go → dùng **development build** (`expo-dev-client`, build bằng EAS hoặc `expo run:android`).

## 8. Test

| Loại | Phạm vi |
| --- | --- |
| Unit (Jest) — `lib/lunar` | Đối chiếu bảng ngày âm: Tết 2020–2030, năm nhuận 2020 (tháng 4), 2023 (tháng 2), 2025 (tháng 6), ngày 30 rơi vào tháng thiếu |
| Unit — `lib/recurrence` | Lặp ngày/tuần/tháng (ngày 31), năm dương (29/2), năm âm (tháng nhuận, ngày 30), `repeat_until`, ngoại lệ sửa/xoá |
| Unit — `lib/google` | Map event, RRULE đơn giản/phức tạp, `cancelled`, 410 (mock API) |
| RLS | Script SQL trên Supabase local: user A không đọc/sửa được dữ liệu user B |
| Thủ công trên Android (`adb`) | Đăng nhập, kéo lịch, tạo các loại event, nhận thông báo, diary có ảnh, note, todo, thống kê |

## 9. Mốc

| Mốc | Nội dung | Xong khi |
| --- | --- | --- |
| M1 | Khung Expo + dev build, đăng nhập Google, schema + RLS | Đăng nhập được trên Android, RLS test pass |
| M2 | `lib/lunar`, `lib/recurrence` (TDD), lịch tháng có ngày âm + ngày lễ | Unit test pass, lịch tháng hiện đúng |
| M3 | Event: form, lặp, ngoại lệ, nhắc; xem tuần/ngày/danh sách | Tạo/sửa/xoá event lặp, nhận thông báo |
| M4 | Kéo Google Calendar | Event Google hiện trên lịch, sửa trên Google → kéo về đúng |
| M5 | Todo, Notes, Diary | Đủ luồng ở mục 5 |
| M6 | Thống kê, Cài đặt, kiểm thử tổng | Hết checklist test thủ công |

## 10. Việc bạn tự làm

1. Tạo project Supabase (free tier). Gửi `SUPABASE_URL` và `anon key`.
2. Tạo project Google Cloud:
   - Bật Google Calendar API.
   - OAuth consent screen ở chế độ **Testing**, thêm email của bạn làm test user, thêm scope `calendar.readonly`.
   - Tạo OAuth client: loại **Web** (dùng cho Supabase + `webClientId`) và **Android** (package name + SHA-1 của keystore debug/EAS).
3. Supabase → Authentication → Providers → Google: bật, dán Web client ID/secret.

Plan sẽ ghi từng bước chi tiết kèm lệnh lấy SHA-1.
