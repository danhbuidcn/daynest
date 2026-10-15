# 2026-10-15 — S6: nút + theo tab, icon + nhóm gợi ý cho người Việt, mất mạng vẫn xem cache — ✅ xong (bạn ok mockup + spec, chưa viết code)

Thuộc: [S6 lộ trình code](2026-10-14-s6-code-plan.md) · [spec S6](../docs/specs/sprint-6/index.md) · [mockup S6](../docs/specs/sprint-6/design/mockups.html).

## Input

- Bạn (2026-10-15): chi tiêu theo Ngày giữ như S6 §10 (danh sách nhóm, bấm nhóm → pop-up) · không tạo nhanh được khoản chi / note / todo ngay ở tab của nó · nhiều icon nhóm chi tiêu không sát thực tế người Việt.
- Bạn chọn: nút `+` **mở thẳng form của tab** (Lịch, Cài đặt giữ pop-up 4 ô) · **mở rộng icon + nhóm gợi ý** chạm 1 lần.
- Bạn (2026-10-15): mất mạng hoặc máy chủ sự cố **vẫn hiện cache trên máy**, chỉ không tạo / sửa được (nút bị khoá).

## Plan

- [x] 1. Spec S6: §3 (mất mạng **hoặc** máy chủ sự cố: banner, giữ dữ liệu trên máy, khoá nút ghi) · §11 Nút + theo tab · §12 Icon + nhóm gợi ý · Màn hình, Thiết kế, DoD, Đã chốt 14–16.
- [x] 2. Mockup S6 (47 màn): 1c máy chủ sự cố · 20–20f nút + (Chi tiêu, Ghi chú, Todo) · 21 Gợi ý, 21b vừa thêm, 21c Thêm nhóm 42 icon kèm tên (cuộn trong pop-up), 21d đủ 30 nhóm · màn 13 có khu Gợi ý · Chrome headless: không lỗi JS.
- [x] 3. Lộ trình code S6: thêm bước 12 (nút +), 13 (icon + gợi ý) · bước 4 thêm "máy chủ sự cố".
- [x] 4. Bạn xem mockup → `ok` → commit `docs: sprint 6 quick add, vietnamese icons, offline cache` + push. Chưa viết code.

## Kết quả
- 2026-10-15 — Xong 1–3. Điểm cần bạn nhìn: icon vẽ mới (trà sữa, bia, xe máy, gửi xe, lì xì, hiếu hỉ…) có đúng ý không · danh sách 24 gợi ý có thiếu / thừa nhóm nào.
