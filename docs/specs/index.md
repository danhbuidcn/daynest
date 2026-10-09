# Daynest — Spec tổng

App cá nhân 2 phần: **Ghi chú** + **Lịch**. Mobile (Android + iOS) trước, web sau.

## 1. Sản phẩm

- **Ghi chú:** note, diary, todo, thống kê, chi tiêu.
- **Lịch:** dương + âm, ngày lễ VN, event (lặp dương + âm), nhắc nhở, kéo Google Calendar, chu kỳ kinh nguyệt.
- **Giai đoạn 1 (GĐ1)** = sprint 1–9. Sau GĐ1: chi tiêu, chu kỳ kinh nguyệt, web.
- Không làm: học tập, thể dục, dashboard, habit, sticker/theme, xu/quảng cáo.
- Tham khảo UI/tính năng: [Cute Calendar](../research/cute-calendar/features.md), Memrise (`../research/memrise/`).

## 2. Quyết định chung

| Chủ đề | Chốt |
| --- | --- |
| Tên | **Daynest** · package `com.danhbuidcn.daynest` (không đổi sau khi lên store) |
| Quy trình | Scrum · mỗi sprint: docs → thiết kế → code · cuối sprint chạy được trên Android |
| Nền tảng | Expo (TypeScript) Android + iOS · chỉ test Android máy thật (không có iPhone) · web (Nuxt) sau |
| Backend | Supabase (Auth, Postgres + RLS, Storage) · GĐ1 không dùng Go |
| Online | Online-only · cache chỉ để xem |
| Người dùng | Thiết kế nhiều user (`user_id` mọi bảng), GĐ1 dùng 1 user |
| Google Calendar | Kéo 1 chiều về app · event Google chỉ đọc · không đẩy lên Google |
| Lịch âm | Tự viết theo thuật toán Hồ Ngọc Đức, múi giờ +7 |
| Store | Lên Google Play + App Store · chu kỳ kinh nguyệt cần chính sách quyền riêng tư + khai báo dữ liệu sức khoẻ |
| Sau GĐ1 | Go API (đọc bill bằng Claude API), web push |

## 3. Kiến trúc

```text
[Expo app] ──supabase-js──▶ [Supabase: Auth · Postgres (RLS) · Storage]
     └──REST (token Google)──▶ [Google Calendar API] (chỉ đọc)
```

- `app/src/app/` — màn hình (Expo Router).
- `app/src/features/<tính năng>/` — UI + logic từng tính năng.
- `app/src/lib/` — hàm thuần: `lunar/`, `recurrence/`, `google/`, `notifications/`, `supabase.ts`.
- `supabase/migrations/` — mỗi sprint thêm bảng của nó.
- Thư viện chính: Expo Router, TanStack Query, supabase-js, google-signin, expo-notifications, date-fns, Jest.
- Mọi bảng: `id`, `user_id`, `created_at`, `updated_at` · RLS `user_id = auth.uid()`.

## 4. Sprint

| Sprint | Chức năng | Chạy được |
| --- | --- | --- |
| [S1](sprint-1/index.md) | Khung app, đăng nhập Google, DB tối thiểu, ký app + version | Đăng nhập, vào 5 tab trống |
| S2 | Lịch tháng dương + âm + ngày lễ | Xem lịch âm dương |
| S3 | Event đơn giản | Tạo/sửa/xoá event |
| S4 | Lặp dương + nhắc nhở + xem tuần/ngày/danh sách | Nhận thông báo |
| S5 | Lặp âm (ngày giỗ) + ngoại lệ "chỉ lần này" | Lưu ngày giỗ |
| S6 | Kéo Google Calendar | Thấy event Google |
| S7 | Todo | Quản lý todo |
| S8 | Notes | Quản lý note |
| S9 | Diary + Thống kê + Cài đặt | Xong GĐ1 |

Folder `sprint-N/` chỉ tạo khi bắt đầu sprint đó. Ghi chú đã chốt cho sprint sau:

### S2 — Lịch tháng
- Lưới 6 tuần · ô ngày: ngày dương, ngày âm (mùng 1, rằm kèm tháng âm), ngày lễ.
- Ngày lễ dương (1/1, 30/4, 1/5, 2/9…) + âm (Tết, Giỗ Tổ 10/3, Rằm tháng Giêng, Trung thu…) cố định trong code.
- Test: Tết 2020–2030, năm nhuận 2020/2023/2025.

### S3 — Event
- Form: tiêu đề (bắt buộc), ghi chú, cả ngày / giờ bắt đầu–kết thúc, màu (6 màu).
- Bấm ngày → sheet danh sách + nút `+`. Xoá luôn hỏi xác nhận.
- Bảng `events`.

### S4 — Lặp + nhắc
- Lặp: ngày / tuần / tháng / năm dương · ngày kết thúc lặp.
- Lặp tháng rơi vào ngày không tồn tại → bỏ lần đó · 29/2 chỉ năm nhuận.
- Nhắc: nhiều mốc (0, 5, 15, 30, 60 phút, 1 ngày) · local notification · chỉ đặt 30 ngày tới, < 60 thông báo chờ.

### S5 — Lặp âm
- Lưu `lunar_month`, `lunar_day` · lấy tháng thường, không lấy tháng nhuận · ngày 30 gặp tháng thiếu → 29.
- Sửa/xoá lần lặp: "Chỉ lần này" / "Tất cả" · bảng `event_exceptions`.

### S6 — Google Calendar
- Scope `calendar.readonly` · kéo khi mở app, kéo xuống, "Đồng bộ ngay".
- `syncToken` lấy phần thay đổi · 410 → kéo lại toàn bộ · `cancelled` → xoá.
- Lưu vào `events` (`source = 'google'`) · RRULE phức tạp → chỉ hiện lần đầu · không đặt nhắc.
- Bảng `google_sync_state`.

### S7 — Todo
- Tiêu đề, hạn, ghim, subtask · xong hết subtask → todo xong · % tự tính.
- Lọc: quá hạn / hôm nay / tuần / tháng.

### S8 — Notes
- Tiêu đề, nội dung text, checklist, danh mục (màu), ghim, tìm kiếm · Back tự lưu.
- Xoá → thùng rác (khôi phục / xoá vĩnh viễn).

### S9 — Diary + Thống kê + Cài đặt
- Diary: 1/ngày, mood 5 mức, ≤ 5 ảnh (Storage `diary-images`), ghim · mood hiện trên lịch.
- Thống kê: donut todo tháng, đếm mood tháng.
- Cài đặt: tuần bắt đầu, 24 giờ, bật/tắt ngày âm/lễ, chọn lịch Google, nhắc diary hằng ngày.

## 5. Xử lý lỗi chung

- Mất mạng → banner, khoá nút Lưu.
- Lưu lỗi → toast, giữ form.
- Token Google lỗi → thử lại 1 lần, rồi báo "Cần kết nối lại Google".
- Từ chối quyền thông báo → vẫn lưu nhắc, gợi ý bật quyền.
