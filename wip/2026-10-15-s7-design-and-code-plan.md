# 2026-10-15 — S7: thiết kế (DB, mockup) + lộ trình code — 🔄 đang làm (bạn chọn: song song · GitHub Pages · chưa có tài khoản)

Thuộc: [Spec S7](../docs/specs/sprint-7/index.md) · [Spec tổng §6](../docs/specs/index.md) · bước trước: [S6 bước 15 (release v6.0.0)](2026-10-15-s6-step-15-release.md).

## Input

- Bạn (2026-10-15): "tiếp" (sau release v6.0.0).

## Hiện trạng

- Spec S7 đã chốt phạm vi (xem "Đã chốt") nhưng **chưa có** `sprint-7/design/` (db.md, mockup) và chưa có lộ trình code. Làm theo cách đã dùng ở S6: thiết kế → lộ trình → từng bước một todo.
- **Việc dài nhất không phải code:** thử nghiệm kín **12 người × 14 ngày liên tục** + Google xác minh OAuth (có thể vài tuần). Spec ghi: bắt đầu việc Play ngay đầu sprint.
- Cần **bạn làm** (tôi không làm được): trả $25 tạo tài khoản Play · tạo tài khoản AdMob + RevenueCat · tạo 3 gói trong Play Console · mời 12–15 người thử · đăng URL chính sách quyền riêng tư (cần nơi đặt trang web công khai).

## Plan

- [x] 1. `docs/specs/sprint-7/design/db.md`: xoá tài khoản trong app (hàm / Edge Function xoá user + dữ liệu, ảnh báo lỗi trong Storage, huỷ liên kết Google) · lưu trạng thái Pro (RevenueCat là nguồn đúng; app chỉ cache, có cần cột DB không?) · test RLS / tải nếu có bảng mới.
- [x] 2. Mockup S7 (`sprint-7/design/mockups.html`): màn Xoá tài khoản (Cài đặt) · màn "Daynest Pro" (3 gói, Khôi phục giao dịch) · banner ở cuối các tab chính (không ở màn soạn, Cài đặt) · hộp đồng ý UMP · mất mạng / Pro đã mua · dùng skill `ui-ux-pro-max` · bạn duyệt.
- [x] 3. Trang web công khai: chính sách quyền riêng tư (VI + EN) + trang yêu cầu xoá tài khoản — chọn nơi đặt (đề xuất: GitHub Pages của repo, không tốn tiền, đổi nội dung bằng commit).
- [ ] 4. Lộ trình code S7 (file `wip/…-s7-code-plan.md`, ~8–10 bước): xoá tài khoản · quảng cáo (gom 1 chỗ, UMP) · Pro (RevenueCat, màn Pro, ẩn banner) · khai Data safety, `AD_ID` · bản thử nghiệm kín · bản công khai · test tải / RLS · release.
- [x] 5. Danh sách việc **bạn** làm ngoài app (Play, AdMob, RevenueCat, người thử), xếp theo ngày để 14 ngày thử nghiệm bắt đầu sớm nhất.

## Cần bạn quyết (đã trả lời 2026-10-15)

1. Làm theo thứ tự trên (thiết kế → lộ trình), hay **bắt đầu ngay việc Play** (đăng ký, mời người thử) song song vì chờ 14 ngày? Đề xuất: song song.
2. Trang chính sách + xoá tài khoản đặt ở đâu? Đề xuất GitHub Pages.
3. Bạn đã có tài khoản Play / AdMob / RevenueCat chưa?

## Việc của bạn (xếp theo thứ tự; làm ngay từ hôm nay để 14 ngày thử nghiệm bắt đầu sớm)

Bắt đầu đồng hồ 14 ngày = mốc quan trọng nhất. Làm 1–4 trước.

1. **Tài khoản Google Play Console** (cá nhân, $25 một lần): https://play.google.com/console/signup · cần giấy tờ tuỳ thân + xác minh (có thể vài ngày). Tên nhà phát triển hiện công khai trên Play.
2. **Tạo app** `Daynest`, gói `com.danhbuidcn.daynest`, miễn phí, 18+ → vào **Kiểm thử › Kiểm thử kín** → tạo kênh, thêm **Google Group** (tạo ở groups.google.com, mời 12–15 người có Gmail + máy Android).
3. **Báo tôi khi xong 1–2** → tôi tạo bản `.aab` cho kênh kín (cần: xoá tài khoản trong app + chính sách quyền riêng tư đã có URL → xem bước 5 bên dưới; Play không bắt URL để tải bản thử nội bộ, nhưng bắt khi xin công khai).
4. **Tài khoản AdMob** (admob.google.com, dùng chung Gmail với Play) → thêm app Android (chưa công khai thì chọn "chưa liệt kê") → tạo 1 đơn vị **banner**. Gửi tôi **App ID** và **Ad unit ID** (không phải bí mật, nhưng chỉ dùng ID thử khi phát triển).
5. **Tài khoản RevenueCat** (revenuecat.com, miễn phí) → tạo project → thêm app Android (gói `com.danhbuidcn.daynest`) → entitlement `pro`. Cần Play Console có app trước. Gửi tôi **public SDK key** (Android, loại `goog_…`; không phải secret key).
6. **3 sản phẩm trong Play Console** (Kiếm tiền › Sản phẩm): `pro_monthly` 29.000đ/tháng, `pro_yearly` 299.000đ/năm, `pro_lifetime` 599.000đ (mua một lần) → gắn vào RevenueCat. Làm sau khi tôi có bản `.aab` đầu tiên (Play chỉ cho tạo sản phẩm sau khi tải bản có quyền thanh toán).
7. **Google OAuth** (Google Cloud Console › consent screen): thêm email 12–15 người thử vào **Test users** (tối đa 100) trong lúc chờ duyệt · gửi xác minh OAuth cho scope `calendar.events` (cần trang chính sách quyền riêng tư công khai + video demo + domain). Tôi soạn nội dung, bạn nộp.
8. **Trang web công khai** (chính sách + xoá tài khoản): xem "Lưu ý GitHub Pages" bên dưới.

### Lưu ý GitHub Pages

- Repo `danhbuidcn/daynest` đang **riêng tư**; gói GitHub miễn phí chỉ cho Pages với repo **công khai** (tôi đã kiểm bằng `gh repo view`: PRIVATE). Công khai cả repo = lộ toàn bộ code, spec, `playbook/`, `wip/` → **không nên**.
- Đề xuất: tạo repo công khai riêng `danhbuidcn/daynest-site` chỉ chứa 2 trang (chính sách quyền riêng tư VI + EN, yêu cầu xoá tài khoản) → bật Pages → URL `https://danhbuidcn.github.io/daynest-site/…`. Tôi soạn nội dung và đẩy lên. **Tạo repo công khai là việc ra ngoài → cần bạn nói `ok` trước.**
- Xác minh OAuth của Google đòi tên miền sở hữu được; `github.io` có thể bị từ chối cho consent screen → nếu vậy cần 1 tên miền riêng (~$10/năm). Ghi nhận rủi ro; thử `github.io` trước.

## Kết quả

- 2026-10-15: viết [db.md S7](../docs/specs/sprint-7/design/db.md) (không bảng mới; Edge Function `delete-account`; Pro qua RevenueCat) + danh sách việc của bạn ở trên.
- 2026-10-15: trang web công khai xong — repo `danhbuidcn/daynest-site` (công khai, nguồn ở `~/Documents/projects/daynest-site`), GitHub Pages: [trang chủ](https://danhbuidcn.github.io/daynest-site/) · [chính sách EN](https://danhbuidcn.github.io/daynest-site/privacy/en.html) · [chính sách VI](https://danhbuidcn.github.io/daynest-site/privacy/vi.html) · [xoá tài khoản](https://danhbuidcn.github.io/daynest-site/delete-account/) · email liên hệ danhbuidcn@gmail.com (bạn chọn) · cả 3 URL trả 200. Khi thêm quảng cáo / Pro thật vào app, rà lại chính sách; nút "Xoá tài khoản" phải có trong app trước khi nộp Play.
- 2026-10-15: mockup S7 xong — [mockups.html](../docs/specs/sprint-7/design/mockups.html) (A xoá tài khoản 6 màn · B Daynest Pro 8 màn · C banner 7 màn · D hộp đồng ý EU/UK 2 màn). Chọn: banner nằm **dưới cùng, dưới thanh tab** (nút + của thanh tab nhô lên, đặt trên sẽ đè banner) · chưa tải được thì không chừa chỗ · mua Pro xong banner tắt ngay. **Chờ bạn duyệt mockup.**
- 2026-10-15: bạn thấy chỉ banner thì thu nhập ít → thêm vào S7 (bạn chọn): **quảng cáo toàn màn hình** sau khi lưu (tối đa 1 lần / 5 phút, không hiện 3 ngày đầu, không khi mở app) · **quảng cáo gốc** xen trong danh sách Ghi chú, Chi tiêu · **xem quảng cáo để tắt mọi quảng cáo 24 giờ**. Đã sửa Spec S7 (chốt, phạm vi, rủi ro, chi phí, DoD), db.md, Spec tổng §6 và mockup (nhóm E, màn 17–19c).
- 2026-10-15: bạn nói phần dễ làm người dùng bỏ app thì không làm → **bỏ quảng cáo toàn màn hình**. S7 còn: banner · quảng cáo gốc trong danh sách · xem để tắt 24 giờ (người dùng tự bấm). Đã sửa Spec S7, db.md, Spec tổng, mockup (nhóm E còn màn 17–18c).
- 2026-10-15: bạn muốn quảng cáo ở mọi màn → chốt (bạn chọn "mọi màn xem"): **banner** ở mọi màn xem (Lịch, Ghi chú, Todo, Chi tiêu, Cài đặt + màn con chỉ xem) · **thẻ gốc** ở màn dạng danh sách (Ghi chú, Todo, Lịch › Danh sách, Chi tiêu), không ở lưới Lịch Ngày/Tuần/Tháng · **không** ở màn soạn/sửa/nhập liệu, Báo lỗi, màn Pro, Xoá tài khoản. Mockup dùng lại màn thật của S6 (đã sửa màn 8–10, thêm 11b, 11c, banner ở Cài đặt).
- Còn lại: bạn duyệt mockup → lộ trình code S7 (plan 4).
