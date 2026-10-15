# Sprint 7 — Quảng cáo + Pro + lên Google Play

Thuộc: [Spec tổng](../index.md) · S7 (trước đây là S6). Chốt phạm vi: [wip](../../../wip/2026-10-12-s6-plan-monetization-play.md).

## Mục tiêu

- App có trên Google Play (bản công khai), phát hành toàn thế giới, chỉ Android.
- Có thu nhập từ quảng cáo banner để trả tiền server khi vượt gói Free Supabase.
- User mua Pro → hết quảng cáo.

## Đã chốt

| Chủ đề | Chốt |
| --- | --- |
| Thứ tự | Đăng ký Play + gửi các mục cần Google duyệt trước · trong lúc chờ duyệt làm quảng cáo + Pro |
| Tài khoản Play | Tài khoản cá nhân ($25, trả 1 lần) · bắt buộc thử nghiệm kín **≥ 12 người × 14 ngày liên tục** mới được xin bản công khai |
| Người thử | 1 Google Group, mời 12–15 người (Gmail + máy Android) · khi OAuth chưa được duyệt, email người thử phải có trong **Test users** của OAuth consent screen (tối đa 100) |
| Quảng cáo | AdMob · 4 loại, khi phát triển chỉ dùng quảng cáo thử · **không** hiện ở màn soạn, Cài đặt, màn Pro |
| — Banner | Cuối các tab chính (Lịch, Ghi chú, Chi tiêu), dưới thanh tab |
| — Toàn màn hình | Hiện **sau khi lưu xong** 1 việc (sự kiện, ghi chú, todo, khoản chi) · tối đa 1 lần / 5 phút · không hiện trong 3 ngày đầu sau khi cài · không hiện khi mở app |
| — Quảng cáo gốc | 1 thẻ xen vào danh sách Ghi chú và Chi tiêu (sau mục thứ 4), cùng kiểu thẻ của app, nhãn "Quảng cáo" |
| — Xem để tắt quảng cáo | Người dùng chủ động xem 1 quảng cáo có thưởng → **tắt mọi quảng cáo 24 giờ** · nút ở màn Daynest Pro · lưu trên máy |
| Pro | Chỉ để tắt quảng cáo · mọi user dùng đủ tính năng · **không có dùng thử** |
| Giá | Tháng **29.000đ** · Năm **299.000đ** · Trọn đời **599.000đ** · giá gốc VND, nước khác Play tự đổi · Google giữ 15% |
| Kiểm tra Pro | **RevenueCat** (miễn phí khi doanh thu < $2.500/tháng) + Play Billing · gắn với tài khoản Daynest → cả 2 máy cùng hết quảng cáo · có nút "Khôi phục giao dịch" |
| Nước | Toàn thế giới → hộp hỏi đồng ý quảng cáo (UMP của AdMob) cho user EU/UK |
| Độ tuổi | 18+ (không theo chính sách gia đình của Play) |
| Nền tảng | Chỉ Android · iOS sau |

## Phạm vi

| # | Việc | Chi tiết |
| --- | --- | --- |
| 1 | Chuẩn bị Play | Các mục ở [Spec tổng §6](../index.md#6-trước-khi-lên-google-play): xoá tài khoản ngay trong app · trang chính sách quyền riêng tư (VI + EN) + trang yêu cầu xoá tài khoản (URL công khai) · logo thật · kiểm lại gói Free Supabase · Data safety gồm dữ liệu sức khoẻ (chu kỳ kinh nguyệt, S5) |
| 2 | Đăng ký Play | Tạo tài khoản cá nhân → tạo app `com.danhbuidcn.daynest` → kênh thử nghiệm kín + Google Group 12–15 người → gửi Google xác minh OAuth (`calendar.events`) |
| 3 | Quảng cáo | AdMob: banner · toàn màn hình sau khi lưu · quảng cáo gốc trong danh sách · xem để tắt 24 giờ · UMP cho EU/UK · gom 1 chỗ (1 module) để thêm loại khác dễ |
| 4 | Pro | RevenueCat + 3 gói trên Play Console · màn "Daynest Pro" trong Cài đặt (3 gói + khôi phục giao dịch + nút xem quảng cáo để tắt 24 giờ) · có Pro thì ẩn mọi quảng cáo |
| 5 | Lên bản công khai | Khai "Có quảng cáo", Data safety (thêm advertising ID), quyền `AD_ID` · chính sách quyền riêng tư thêm phần quảng cáo + mua trong app · đủ 14 ngày → Apply for production |

**Không làm ở S7:** iOS, quảng cáo khi mở app, dùng thử.

## Rủi ro

- Quảng cáo toàn màn hình hiện quá dày → người dùng bỏ app, điểm thấp trên Play. Giữ giới hạn tần suất, đo lại sau 2 tuần; nặng quá thì tăng khoảng cách.
- **Tự bấm quảng cáo thật** → tài khoản AdMob bị khoá. Chỉ dùng quảng cáo thử khi phát triển.
- AdMob hiện ít hoặc không hiện quảng cáo khi app chưa công khai trên Play → không đo được thu nhập thật trong lúc thử nghiệm kín.
- Google xác minh OAuth và duyệt bản công khai có thể mất vài tuần → bắt đầu việc 1–2 ngay đầu sprint.
- Thêm quảng cáo / mua trong app mà không khai báo trên Play Console → bản cập nhật bị từ chối.

## Ước tính chi phí / thu nhập (thô)

- Chi phí: Supabase $0 khi còn gói Free (~10.000 user, [supabase-plans.md](../architecture/supabase-plans.md)) · vượt → $25/tháng.
- Banner: ~1.000 user mở app/ngày × ~8 lượt hiện × 30 ngày ≈ 240.000 lượt/tháng × $0,1–0,5 / 1.000 lượt ≈ **$25–120/tháng**.
- Toàn màn hình: ~1.000 user × ~3 lượt/ngày × 30 ≈ 90.000 lượt × $2–8 / 1.000 lượt ≈ **$180–720/tháng** · quảng cáo gốc + xem để tắt: cộng thêm, chưa ước tính (thô).
- Pro: 1–2% user trả tiền · ~150 gói năm ≈ **3 triệu đ/tháng**.
- Chưa đủ → tăng tần suất toàn màn hình, thêm quảng cáo khi mở app ở bản sau.

## Xong khi (DoD)

- [ ] Xoá tài khoản trong app chạy đúng · chính sách quyền riêng tư + trang xoá tài khoản có URL công khai.
- [ ] App đã qua thử nghiệm kín 14 ngày với ≥ 12 người và được duyệt bản công khai.
- [ ] Google đã xác minh OAuth: tài khoản ngoài danh sách Test users đăng nhập + đồng bộ Google được.
- [ ] Banner hiện ở các tab chính · quảng cáo toàn màn hình hiện sau khi lưu, đúng giới hạn (5 phút, 3 ngày đầu) · thẻ quảng cáo gốc trong Ghi chú, Chi tiêu · không quảng cáo nào ở màn soạn, Cài đặt, màn Pro · user EU/UK thấy hộp hỏi đồng ý.
- [ ] Xem quảng cáo có thưởng → mọi quảng cáo tắt 24 giờ, hết hạn thì hiện lại.
- [ ] Mua 1 gói (môi trường thử của Play) → mọi quảng cáo tắt trên cả 2 máy · cài lại app → khôi phục giao dịch được.
- [ ] Play Console đã khai: có quảng cáo, Data safety, `AD_ID`, độ tuổi 18+.
- [ ] `npm run typecheck && npm run lint && npm test` qua.
- [ ] Cuối sprint: release theo [Spec tổng §4](../index.md#cuối-sprint-mọi-sprint).
