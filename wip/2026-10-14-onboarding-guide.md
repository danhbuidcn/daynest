# 2026-10-14 — Tài liệu giới thiệu hệ thống cho người mới (md + html) — ✅ xong

## Input

- Bạn (2026-10-14): lưu bài giải thích hệ thống (flow, sơ đồ) thành docs + trang HTML theo đúng format đó, bỏ cách xưng "anh – em".
- Nội dung gốc: câu trả lời trong chat 2026-10-14 (10 mục: Daynest là gì → tuần đầu + lưu ý tài liệu kiến trúc đã cũ).

## Plan

- [x] 1. Tạo `docs/onboarding.md` (tiếng Việt): giữ 10 mục + sơ đồ dạng text, viết trung tính (không "anh/em"), link tới file code. Ghi "Thuộc: [Tài liệu Daynest](index.md)".
- [x] 2. Tạo `docs/onboarding.html` bằng skill `archify`: cùng nội dung, sơ đồ SVG (tổng quan hệ thống, các lớp trong app, 5 flow: mở app/đăng nhập, đọc lịch, ghi dữ liệu, đồng bộ Google, nhắc nhở), sáng/tối. Mở được trực tiếp bằng trình duyệt, không cần mạng.
- [x] 3. `docs/index.md`: thêm 1 dòng trỏ tới `onboarding.md` / `onboarding.html` (đọc đầu tiên cho người mới).
- [x] 4. Kiểm tra: mở HTML trong trình duyệt (sơ đồ hiện đủ, 2 chế độ màu), link trong md trỏ đúng file.
- [x] 5. Cập nhật file này + `wip/index.md` · commit `docs: onboarding guide` (chỉ các file của việc này) + push.

Không làm: đăng Artifact lên claude.ai (bạn chốt 2026-10-14: chỉ để file trong repo) · sửa `docs/specs/architecture/` cho khớp code (việc riêng nếu bạn muốn).

## Kết quả
- 2026-10-14 — Bước 1: [docs/onboarding.md](../docs/onboarding.md), 10 mục, viết trung tính, link code đã kiểm (đủ file).
- 2026-10-14 — Bước 2: [docs/onboarding.html](../docs/onboarding.html), 7 sơ đồ SVG + chữ, sáng/tối (nút đổi), không cần mạng. **Khác plan:** không dùng `archify` vì skill này vẽ 1 sơ đồ/trang, trang cần chữ + 7 sơ đồ → viết tay SVG (cách dự phòng của skill).
- 2026-10-14 — Bước 3: `docs/index.md` thêm dòng "Người mới… đọc trước" + dòng trong cây thư mục.
- 2026-10-14 — Bước 4: chụp Chrome headless 1200px (sáng, tối) và 390px: sửa 4 chỗ chữ tràn/đè (ô idToken, min_version_code, nhãn "1 dòng", 2 ô Google), chụp lại sạch. Điện thoại: sơ đồ cuộn ngang trong khung, trang không tràn.
- 2026-10-14 — Bước 5: commit `docs: onboarding guide` (dòng S6 đã vào commit `docs: sprint 6 spec` trước đó, nên commit này chỉ có file của việc này).
