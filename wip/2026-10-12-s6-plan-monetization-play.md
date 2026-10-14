# 2026-10-12 — S6: quảng cáo + Pro + lên Google Play (chỉ viết spec) — ✅ xong

## Input

- Bạn (2026-10-12): S4 làm quảng cáo + Pro + lên Google Play. Sau khi trao đổi thấy phức tạp → **đẩy sang S6, tạo luôn spec S6**.
- S4 giữ như cũ: Chi tiêu.

## Đã chốt khi trao đổi

| Chủ đề | Chốt |
| --- | --- |
| Thứ tự | Đăng ký Play + gửi duyệt trước · trong lúc chờ Google duyệt thì làm quảng cáo + Pro |
| Tài khoản Play | Chưa có → tài khoản cá nhân ($25) → bắt buộc thử nghiệm kín ≥ 12 người × 14 ngày liên tục mới xin lên bản công khai |
| Người thử | Google Group 12–15 người · email phải có trong **Test users** của OAuth consent screen (khi OAuth chưa được duyệt) |
| Quảng cáo | AdMob · chỉ **banner** cuối các tab chính · không ở màn soạn, Cài đặt · dev dùng quảng cáo thử |
| Pro | Chỉ để tắt quảng cáo · mọi user dùng đủ tính năng · **không dùng thử** |
| Giá | Tháng 29.000đ · Năm 299.000đ · Trọn đời 599.000đ · giá gốc VND, nước khác Play tự đổi |
| Kiểm tra Pro | **RevenueCat** + Play Billing · gắn với tài khoản Daynest (2 máy cùng hết quảng cáo) |
| Nước | Toàn thế giới → hộp hỏi đồng ý quảng cáo (UMP) cho EU/UK · chính sách quyền riêng tư VI + EN |
| Độ tuổi | 18+ (tránh chính sách gia đình) |
| Nền tảng | Chỉ Android |
| Không làm | iOS, quảng cáo toàn màn hình, dùng thử |

## Plan

- [x] 1. Tạo `docs/specs/sprint-6/index.md`: mục tiêu · phạm vi (5 việc: chuẩn bị Play §6 → đăng ký Play + 12 người thử + duyệt OAuth → banner AdMob + UMP → Pro RevenueCat → cuối sprint: khai "có quảng cáo", Data safety, AD_ID, xin bản công khai) · bảng đã chốt ở trên · rủi ro (tự bấm quảng cáo bị khoá AdMob, quảng cáo ít khi chưa công khai) · ước tính chi phí/thu nhập · DoD. Chưa viết thiết kế code chi tiết (làm ở giai đoạn Spec khi bắt đầu S6).
- [x] 2. Sửa [docs/specs/index.md](../docs/specs/index.md): §1 bỏ "quảng cáo" khỏi "Không làm" · §2 Store ghi "Android trước, iOS sau" · §4 bảng sprint thêm S5 (theo câu trả lời của bạn), S6 · §6 ghi "làm ở S6" + link.
- [x] 3. Thêm dòng vào `wip/index.md`, tick plan này → commit `docs: sprint 6 spec (ads, pro, google play)` + push.

## Câu hỏi

- **S5 làm gì?** Spec hiện có S4 = Chi tiêu (hết GĐ1). Sau GĐ1 đã ghi: chu kỳ kinh nguyệt, web. → S5 = chu kỳ kinh nguyệt? hay để trống "chưa chốt"? → Bạn: **A, chu kỳ kinh nguyệt**.

## Kết quả
- 2026-10-12 16:15 — Bạn duyệt (S5 = chu kỳ kinh nguyệt). Tạo [sprint-6/index.md](../docs/specs/sprint-7/index.md) · sửa Spec tổng §1, §2, §4, §6 · thêm S6 vào [docs/index.md](../docs/index.md). Commit + push.
