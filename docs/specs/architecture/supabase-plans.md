# Các gói Supabase

Thuộc: [Spec tổng](../index.md) §3 · [Kiến trúc](index.md) · [Traffic](traffic.md). Nguồn: [supabase.com/pricing](https://supabase.com/pricing), xem ngày 2026-10-10 — giá có thể đổi, kiểm lại trước khi nâng gói.

Daynest hiện dùng **Free**.

## So sánh

| Hạng mục | Free | Pro | Team | Enterprise |
| --- | --- | --- | --- | --- |
| Giá / tháng | $0 | từ $25 | từ $599 | Thoả thuận |
| User đăng nhập / tháng (MAU) | 50.000 | 100.000, sau đó $0,00325 / MAU | như Pro | Tuỳ chỉnh |
| Dung lượng DB | 500 MB | 8 GB / project, sau đó $0,125 / GB | như Pro | Tuỳ chỉnh |
| Máy chủ DB | CPU dùng chung, RAM 500 MB | Micro (1 GB RAM) — có $10 credit | như Pro | Tuỳ chỉnh |
| Băng thông ra (egress) | 5 GB (+ 5 GB qua cache) | 250 GB, sau đó $0,09 / GB | như Pro | Tuỳ chỉnh |
| Lưu file (Storage) | 1 GB, file ≤ 50 MB | 100 GB, sau đó $0,0213 / GB · file ≤ 500 GB | như Pro | Tuỳ chỉnh |
| Edge Functions | 500.000 lần gọi | 2 triệu, sau đó $2 / triệu | như Pro | Tuỳ chỉnh |
| Realtime | 200 kết nối cùng lúc · 2 triệu tin / tháng | 500 kết nối · 5 triệu tin | như Pro | Tuỳ chỉnh |
| Số project | 2 project đang chạy | Không ghi giới hạn (project thêm trả tiền máy chủ) | như Pro | Tuỳ chỉnh |
| Bỏ không 7 ngày | **Bị tạm dừng** | Không | Không | Không |
| Sao lưu | Không | Hằng ngày, giữ 7 ngày | Hằng ngày, giữ 14 ngày | Tuỳ chỉnh |
| Khôi phục theo thời điểm (PITR) | Không | Mua thêm $100 / tháng | như Pro | Có, giữ > 28 ngày |
| Giữ log | 1 ngày | 7 ngày | 28 ngày | 90 ngày |
| Hỗ trợ | Cộng đồng | Email | Email ưu tiên, có SLA | Người phụ trách riêng, 24/7 |
| Khác | — | Có giới hạn chi tiêu (spend cap), bật mặc định | SOC2, ISO 27001, SSO dashboard | SLA uptime, SAML SSO |

## Máy chủ DB (Pro, Team)

Tính theo giờ cho từng project. Gói Pro / Team đã gồm 1 máy **Micro**.

| Cỡ | $ / tháng | CPU | RAM | Kết nối trực tiếp / qua pooler |
| --- | --- | --- | --- | --- |
| Micro | 10 | Dùng chung | 1 GB | 60 / 200 |
| Small | 15 | Dùng chung | 2 GB | 90 / 400 |
| Medium | 60 | Dùng chung | 4 GB | 120 / 600 |
| Large | 110 | 2 riêng | 8 GB | 160 / 800 |
| XL | 210 | 4 riêng | 16 GB | 240 / 1.000 |
| 2XL | 410 | 8 riêng | 32 GB | 380 / 1.500 |
| 4XL – 16XL | 960 – 3.730 | 16 – 64 riêng | 64 – 256 GB | 480 – 500 / 3.000 – 12.000 |

## Mua thêm (Pro, Team)

| Dịch vụ | Giá |
| --- | --- |
| PITR | $100 / tháng cho 7 ngày |
| Tên miền riêng | $10 / tên miền / tháng |
| Branching (DB nhánh để thử) | $0,01344 / nhánh / giờ |
| MFA qua điện thoại | $75 / tháng project đầu, $10 mỗi project sau |
| Log drain | $60 / tháng + phí theo lượng |
| Biến đổi ảnh | 100 ảnh gốc miễn phí, sau đó $5 / 1.000 |

## Daynest dùng gói nào

| Hạng mục | Daynest cần (~10.000 user) | Free có | Ghi chú |
| --- | --- | --- | --- |
| MAU | ≤ 10.000 | 50.000 | Đủ |
| DB | 100–500 MB | 500 MB | **Sát** — gần 500 MB thì lên Pro |
| Egress | Chỉ JSON nhỏ, không tải file | 5 GB | Cần theo dõi khi user tăng |
| Storage | 0 (không lưu file) | 1 GB | Đủ |
| Realtime, Edge Functions | Không dùng | — | — |
| Tạm dừng 7 ngày | App dùng hằng ngày | — | Ổn khi có user thật |
| Sao lưu | Cần khi có dữ liệu user thật | Không có | Lý do chính để lên Pro trước khi lên Play |

Kết luận:

- **Phát triển, test (hiện tại):** Free.
- **Trước khi lên Google Play:** nên lên **Pro** ($25 / tháng) — có sao lưu hằng ngày, không bị tạm dừng, DB 8 GB. Bật giới hạn chi tiêu để không phát sinh phí ngoài dự kiến.
- **Team / Enterprise:** chưa cần (dành cho công ty: chứng chỉ bảo mật, SSO, SLA).
