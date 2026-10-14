# 2026-10-14 — Tài liệu giới thiệu hệ thống cho người mới (md + html) — 🔄 chờ duyệt

## Input

- Bạn (2026-10-14): lưu bài giải thích hệ thống (flow, sơ đồ) thành docs + trang HTML theo đúng format đó, bỏ cách xưng "anh – em".
- Nội dung gốc: câu trả lời trong chat 2026-10-14 (10 mục: Daynest là gì → tuần đầu + lưu ý tài liệu kiến trúc đã cũ).

## Plan

- [ ] 1. Tạo `docs/onboarding.md` (tiếng Việt): giữ 10 mục + sơ đồ dạng text, viết trung tính (không "anh/em"), link tới file code. Ghi "Thuộc: [Tài liệu Daynest](index.md)".
- [ ] 2. Tạo `docs/onboarding.html` bằng skill `archify`: cùng nội dung, sơ đồ SVG (tổng quan hệ thống, các lớp trong app, 5 flow: mở app/đăng nhập, đọc lịch, ghi dữ liệu, đồng bộ Google, nhắc nhở), sáng/tối. Mở được trực tiếp bằng trình duyệt, không cần mạng.
- [ ] 3. `docs/index.md`: thêm 1 dòng trỏ tới `onboarding.md` / `onboarding.html` (đọc đầu tiên cho người mới).
- [ ] 4. Kiểm tra: mở HTML trong trình duyệt (sơ đồ hiện đủ, 2 chế độ màu), link trong md trỏ đúng file.
- [ ] 5. Cập nhật file này + `wip/index.md` · commit `docs: onboarding guide` (chỉ các file của việc này) + push.

Không làm: đăng Artifact lên claude.ai (bạn chốt 2026-10-14: chỉ để file trong repo) · sửa `docs/specs/architecture/` cho khớp code (việc riêng nếu bạn muốn).

## Kết quả
