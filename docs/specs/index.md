# Daynest — Spec tổng

App cá nhân 3 phần: **Lịch** + **Ghi chú** + **Chi tiêu**. Mobile (Android + iOS) trước, web sau.

## 1. Sản phẩm

- **Ghi chú:** note.
- **Chi tiêu:** theo ngày, tuần, tháng (S4).
- **Lịch:** dương + âm, ngày lễ VN, event (lặp dương + âm), todo theo ngày, nhắc nhở, đồng bộ Google Calendar 2 chiều, chu kỳ kinh nguyệt.
- **Giai đoạn 1 (GĐ1)** = sprint 1–4. Sau GĐ1: chu kỳ kinh nguyệt + todo trên Lịch (S5), quảng cáo + Pro + lên Google Play (S6), web.
- Không làm: diary, học tập, thể dục, dashboard, habit, sticker/theme, xu. Quảng cáo + gói Pro tắt quảng cáo: [S6](sprint-6/index.md).

## 2. Quyết định chung

| Chủ đề | Chốt |
| --- | --- |
| Tên | **Daynest** · package `com.danhbuidcn.daynest` (không đổi sau khi lên store) |
| Quy trình | Scrum · mỗi sprint 5 giai đoạn: [README § Sprint workflow](../../README.md#sprint-workflow) · cuối sprint chạy được trên Android · **1 tính năng làm trọn trong 1 sprint**, không chia nhiều sprint |
| Nền tảng | Expo (TypeScript) Android + iOS · chỉ test Android máy thật (không có iPhone) · web (Nuxt) sau |
| Backend | Supabase gói Free (Auth, Postgres + RLS, Storage) · GĐ1 không dùng Go |
| Online | Online-only · cache chỉ để xem |
| Ngôn ngữ | EN (mặc định) + VI · đổi trong Cài đặt |
| Người dùng | Nhiều user thật (lên Google Play) · mục tiêu 100 dùng cùng lúc, tổng ~10.000 ([§3](#mục-tiêu-tải)) |
| Thiết bị | 1 tài khoản đăng nhập tối đa 2 thiết bị · máy thứ 3 đăng nhập → máy đăng nhập sớm nhất bị đăng xuất ([S2 F7](sprint-2/F7-device-limit.md)) |
| Google Calendar | Bật đồng bộ → 2 chiều với lịch chính · tắt → độc lập · chỉ đồng bộ event năm hiện tại + event lặp còn diễn ra trong năm ([S2 F4](sprint-2/F4-google-calendar.md)) |
| Lịch âm | Tự viết theo thuật toán Hồ Ngọc Đức, múi giờ +7 |
| Store | Lên Google Play ở [S6](sprint-6/index.md) (Android trước, App Store sau) ([§6](#6-trước-khi-lên-google-play)) · chu kỳ kinh nguyệt cần chính sách quyền riêng tư + khai báo dữ liệu sức khoẻ |
| Sau GĐ1 | Go API (đọc bill bằng Claude API), web push |

## 3. Kiến trúc

Biểu đồ đầy đủ (dữ liệu, phiên, xung đột, đồng bộ, traffic): [architecture/](architecture/index.md).

```text
[Expo app] ──supabase-js──▶ [Supabase: Auth · Postgres (RLS) · Storage]
     └──REST (token Google)──▶ [Google Calendar API] (đọc + ghi, khi bật đồng bộ)
```

- `app/src/app/` — màn hình (Expo Router).
- `app/src/features/<tính năng>/` — UI + logic từng tính năng · phần gọi Supabase (`api`) tách khỏi UI.
- `app/src/lib/` — hàm thuần, có test: `lunar/`, `holidays/`, `recurrence/`, `google/`, `notifications/`, `supabase.ts`.
- `supabase/migrations/` — mỗi sprint thêm bảng của nó.
- Thư viện chính: Expo Router, TanStack Query, supabase-js, google-signin, expo-notifications, date-fns, Jest.
- Mọi bảng: `id`, `user_id`, `created_at`, `updated_at` · RLS `user_id = auth.uid()`.

### Nguyên tắc mở rộng

| Vấn đề | Cách làm |
| --- | --- |
| Lộ dữ liệu giữa user | Mọi bảng RLS `user_id = auth.uid()` · mỗi sprint có test RLS cho bảng mới |
| Chậm khi dữ liệu nhiều | Index `(user_id, …)` theo cách truy vấn · chỉ tải theo khoảng ngày đang xem · danh sách phân trang keyset |
| Event lặp phình DB | Lưu 1 dòng quy tắc + ngoại lệ · app tự trải ra các lần |
| Bấm Lưu 2 lần / mạng chập chờn | App tự sinh `id` (uuid) trước khi gửi → gửi lại không tạo trùng |
| 1 user sửa cùng lúc trên 2 máy | Khoá lạc quan theo `updated_at` → hộp "Đã thay đổi ở thiết bị khác": Tải bản mới / Ghi đè |
| 2 máy cùng đồng bộ Google | Upsert theo `(user_id, google_event_id)` · đẩy lên dùng `id` cố định |
| Múi giờ | Mặc định Việt Nam (+7), đổi trong Cài đặt · event có giờ `timestamptz` · cả ngày `date` · ngày âm luôn +7 |
| Không có server riêng | App gọi thẳng Supabase + Google · không giữ trạng thái chung giữa user |

### Mục tiêu tải

- 100 user dùng cùng lúc, tổng ~10.000 user, gói Free Supabase.
- So sánh các gói Supabase + gói nên dùng: [architecture/supabase-plans.md](architecture/supabase-plans.md).

| Hạng mục | Ước tính | Gói Free | Kết luận |
| --- | --- | --- | --- |
| User đăng nhập/tháng | ≤ 10.000 | 50.000 MAU | Đủ |
| Request cùng lúc | ~100 req/s lúc cao điểm | Chịu được khi có index | Đủ |
| Dung lượng DB | Đo test tải S4 (2026-10-13): Lịch + Ghi chú ~20 KB/user · Chi tiêu ~157 KB/user/năm nếu ghi 2 khoản/ngày ([S4 db.md](sprint-4/design/db.md#kiểm-tra-tải)) → 10.000 user ghi đều ≈ 1,76 GB/năm | 500 MB | **Vượt** nếu nhiều user ghi chi tiêu đều — thực tế ít user ghi mỗi ngày. Theo dõi dung lượng DB thật; gần 500 MB → cân nhắc gói Pro ($25/tháng) cùng lúc có thu nhập ở [S6](sprint-6/index.md) |
| Storage | Không lưu file (ảnh đại diện lấy từ Google, không cho sửa) | 1 GB | Đủ |
| Bỏ không 7 ngày bị tạm dừng | — | — | Ổn — app được dùng hằng ngày |

- Giới hạn gói Free ở trên theo hiểu biết lúc viết; kiểm lại trang giá Supabase trước khi lên Play.
- Mỗi sprint có bảng mới: chạy test tải trên DB local (seed 10.000 user giả), đạt 0 lỗi, p95 < 1 s. Cách làm: [S2 db.md](sprint-2/design/db.md#kiểm-tra-tải).

## 4. Sprint

| Sprint | Chức năng | Chạy được |
| --- | --- | --- |
| [S1](sprint-1/index.md) | Khung app, đăng nhập Google, DB tối thiểu, ký app + version | Đăng nhập, vào 5 tab trống |
| [S2](sprint-2/index.md) | Lịch (4 chế độ, âm, lễ) + Event (lặp dương + âm, ngoại lệ) + Nhắc + Đồng bộ Google 2 chiều + Notes + Cài đặt liên quan | Xem lịch, quản lý event + note, nhận thông báo, đồng bộ Google |
| [S3](sprint-3/index.md) | Hoàn thiện Lịch + Ghi chú: sửa UI, bấm tab mượt, tab "Ghi chú", phân trang + idempotency | Lịch + Ghi chú dùng mượt, không tạo trùng |
| [S4](sprint-4/index.md) | Chi tiêu: thêm/sửa/xoá khoản chi, nhóm, xem Ngày/Tuần/Tháng, thống kê · chọn màu bất kỳ (toàn app) | Xong GĐ1 |
| S5 | Todo trên Lịch (việc cần làm theo ngày, giống CalendarCute) · Chu kỳ kinh nguyệt (chỉ dự đoán kỳ sau) · bật/tắt trong Cài đặt · Báo lỗi trong Cài đặt (gửi email nhà phát triển) · sửa 2 lỗi từ S4 ([màu gần nhất lên Google, số ít "1 note"](../../wip/2026-10-13-s4-real-device-test.md#finding--sửa-ở-s5)) | Quản lý việc cần làm theo ngày + theo dõi chu kỳ trên Lịch |
| [S6](sprint-6/index.md) | Quảng cáo (banner AdMob) + Pro tắt quảng cáo (RevenueCat) + lên Google Play | App công khai trên Play, có quảng cáo, mua được Pro |

### Cuối sprint (mọi sprint)

Khi DoD sprint đạt, làm theo thứ tự (todo: 1 file mới trong `wip/`, thêm dòng vào `wip/index.md`, chờ duyệt như mọi việc ghi/sửa):

1. Tick DoD trong `sprint-N/index.md`.
2. Tăng version trong `app/app.config.ts`: `version` +MINOR, `versionCode` +1 ([build.md](sprint-1/design/build.md#version)).
3. Có migration mới → `supabase/db migrate`. Migration mà bản app cũ không chạy được (đổi RLS, bỏ/đổi cột…) phải tăng `app_config.min_version_code` lên `versionCode` của bản sắp release, ngay trong migration đó: bản cũ hơn sẽ hiện màn "Cần cập nhật" thay vì lỗi khó hiểu (bản 1.0.1 không có màn này vì ra trước).
4. `cd app && npm run release` → `app/dist/daynest-<version>-<versionCode>.apk|.aab`.
5. Cài đè lên máy thật (`adb install -r …apk`): vẫn đăng nhập, test luồng chính + chức năng sprint.
6. Commit `chore(release): v<version>` → gắn tag GitHub: `git tag v<version> && git push origin main v<version>` (bắt buộc mỗi lần release; tag trỏ đúng commit đã build APK).
7. Tạo GitHub Release kèm APK (bắt buộc; chỉ APK, không `.aab`): `gh release create v<version> app/dist/daynest-<version>-<versionCode>.apk --title v<version> --notes "<tóm tắt>"` → kiểm tra `gh release view v<version>` có asset `.apk`. Cần `gh` đã đăng nhập (cài không cần sudo: tải tarball từ github.com/cli/cli vào `~/.local/bin`).

Folder `sprint-N/` chỉ tạo khi bắt đầu sprint đó (riêng S6 viết sớm theo yêu cầu).

## 5. Xử lý lỗi chung

- Mất mạng → banner, khoá nút Lưu.
- Lưu lỗi → toast, giữ form.
- Token Google lỗi → thử lại 1 lần, rồi báo "Cần kết nối lại Google".
- Từ chối quyền thông báo → vẫn lưu nhắc, gợi ý bật quyền.

## 6. Trước khi lên Google Play

Làm ở [S6](sprint-6/index.md), trước khi phát hành công khai:

- Xoá tài khoản ngay trong app + trang web yêu cầu xoá (Play bắt buộc với app có tạo tài khoản).
- Chính sách quyền riêng tư (URL công khai).
- Khai báo Data safety trên Play Console.
- Google xác minh OAuth (đưa consent screen từ Testing lên Production) cho scope `calendar.events`.
- Logo thật ([design-system](design-system.md#logo-tạm)).
- Kiểm lại giới hạn gói Free Supabase ([§3](#mục-tiêu-tải)).
