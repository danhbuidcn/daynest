# 2026-10-11 — Bản cũ phải hiện "Cần cập nhật" — 🔄 đang làm

## Input

- Bạn yêu cầu: khi đã có bản mới, bản cũ phải hiện thông báo cập nhật để người dùng biết.
- Nguyên nhân gợi ra: v1.0.1 không đăng nhập được vì migration S2 đã lên DB thật (xem [bước 11](2026-10-10-s2-code-step-11-load-test-release.md)).
- **Giới hạn:** v1.0.1 đã cài trên máy thì không có đoạn kiểm tra này → không thể hiện thông báo. Chỉ áp dụng từ **1.1.0** trở đi; v1.0.1 phải cài tay bản mới.
- Repo GitHub đang **private** → người dùng không mở được link Release. Link tải đặt trong DB (`update_url`), điền sau.

## Plan

- [x] 1. Migration `app_config` (1 dòng: `min_version_code`, `update_url`), đọc được cả khi chưa đăng nhập, không ghi được từ app. `min_version_code = 3` (1.1.0).
- [x] 2. App: `features/appVersion/` — hook `useUpdateRequired` (so `nativeBuildVersion` với `min_version_code`; kiểm tra khi mở và khi quay lại app; lỗi mạng → vẫn cho dùng) + màn `UpdateRequiredScreen` chặn toàn app, nút "Cập nhật" mở `update_url` (không có link thì ẩn nút). Chữ VI + EN.
- [x] 3. `supabase/db test` qua (43 test); anon đọc được, không ghi được.
- [x] 4. `supabase/db migrate` lên DB thật.
- [ ] 5. Thử màn "Cần cập nhật" hiện khi `min_version_code` cao — **chưa làm**: đổi giá trị trên DB thật bị chặn, chờ bạn chọn cách (DB thật tạm thời / Supabase local). Đã thử: bản 1.1.0 (3) với `min_version_code = 3` → dùng bình thường.
- [x] 6. Ghi quy tắc vào spec: mỗi migration mà bản cũ không chạy được thì tăng `min_version_code` cùng migration đó.
- [x] 7. Mockup màn "Cần cập nhật" (mockups.html) cho khớp.
