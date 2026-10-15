# 2026-10-15 — S7: thiết kế (DB, mockup) + lộ trình code — ⏳ chờ bạn duyệt

Thuộc: [Spec S7](../docs/specs/sprint-7/index.md) · [Spec tổng §6](../docs/specs/index.md) · bước trước: [S6 bước 15 (release v6.0.0)](2026-10-15-s6-step-15-release.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau release v6.0.0).

## Hiện trạng

- Spec S7 đã chốt phạm vi (xem "Đã chốt") nhưng **chưa có** `sprint-7/design/` (db.md, mockup) và chưa có lộ trình code. Làm theo cách đã dùng ở S6: thiết kế → lộ trình → từng bước một todo.
- **Việc dài nhất không phải code:** thử nghiệm kín **12 người × 14 ngày liên tục** + Google xác minh OAuth (có thể vài tuần). Spec ghi: bắt đầu việc Play ngay đầu sprint.
- Cần **bạn làm** (tôi không làm được): trả $25 tạo tài khoản Play · tạo tài khoản AdMob + RevenueCat · tạo 3 gói trong Play Console · mời 12–15 người thử · đăng URL chính sách quyền riêng tư (cần nơi đặt trang web công khai).

## Plan

- [ ] 1. `docs/specs/sprint-7/design/db.md`: xoá tài khoản trong app (hàm / Edge Function xoá user + dữ liệu, ảnh báo lỗi trong Storage, huỷ liên kết Google) · lưu trạng thái Pro (RevenueCat là nguồn đúng; app chỉ cache, có cần cột DB không?) · test RLS / tải nếu có bảng mới.
- [ ] 2. Mockup S7 (`sprint-7/design/mockups.html`): màn Xoá tài khoản (Cài đặt) · màn "Daynest Pro" (3 gói, Khôi phục giao dịch) · banner ở cuối các tab chính (không ở màn soạn, Cài đặt) · hộp đồng ý UMP · mất mạng / Pro đã mua · dùng skill `ui-ux-pro-max` · bạn duyệt.
- [ ] 3. Trang web công khai: chính sách quyền riêng tư (VI + EN) + trang yêu cầu xoá tài khoản — chọn nơi đặt (đề xuất: GitHub Pages của repo, không tốn tiền, đổi nội dung bằng commit).
- [ ] 4. Lộ trình code S7 (file `wip/…-s7-code-plan.md`, ~8–10 bước): xoá tài khoản · quảng cáo (gom 1 chỗ, UMP) · Pro (RevenueCat, màn Pro, ẩn banner) · khai Data safety, `AD_ID` · bản thử nghiệm kín · bản công khai · test tải / RLS · release.
- [ ] 5. Danh sách việc **bạn** làm ngoài app (Play, AdMob, RevenueCat, người thử), xếp theo ngày để 14 ngày thử nghiệm bắt đầu sớm nhất.

## Cần bạn quyết

1. Làm theo thứ tự trên (thiết kế → lộ trình), hay **bắt đầu ngay việc Play** (đăng ký, mời người thử) song song vì chờ 14 ngày? Đề xuất: song song.
2. Trang chính sách + xoá tài khoản đặt ở đâu? Đề xuất GitHub Pages.
3. Bạn đã có tài khoản Play / AdMob / RevenueCat chưa?

## Kết quả

- (chưa làm)
