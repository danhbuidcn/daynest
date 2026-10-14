# 2026-10-14 — Tài liệu tổng quan: bỏ câu chữ "cho người mới" — ✅ xong

## Input

- Bạn (2026-10-14): `docs/onboarding.html` chỉ là file giải thích tổng thể dự án, không phải cho người mới → bỏ câu chữ hướng tới người mới.
- Việc trước: [2026-10-14-onboarding-guide.md](2026-10-14-onboarding-guide.md).

## Plan

- [x] 1. Đổi tên file `docs/onboarding.md|.html` → `docs/overview.md|.html` (`git mv`), sửa mọi link trỏ tới (`docs/index.md`, 2 file với nhau).
- [x] 2. Sửa chữ ở cả md + html:
  - Tiêu đề: "Daynest cho người mới" / "Giới thiệu hệ thống Daynest cho người mới" → **"Tổng quan hệ thống Daynest"**.
  - Dòng mô tả: → "Kiến trúc, cấu trúc code và 5 luồng chính. Theo code v5.0.1 (hết S5), cập nhật 2026-10-14." (bỏ "Gặp chỗ lệch với code → tin code").
  - Mục 10 "Tuần đầu" → **"Chạy và phát triển"**; bỏ "xin secrets từ người phụ trách" (giữ "không commit, không dán vào chat"); bỏ bước "Đọc theo thứ tự" (dành cho người mới).
  - `docs/index.md`: "Người mới: … đọc trước" → "Tổng quan hệ thống: kiến trúc, sơ đồ, 5 luồng chính"; cây thư mục "giới thiệu hệ thống cho người mới" → "tổng quan hệ thống".
- [x] 3. Kiểm tra: grep không còn "người mới", "onboarding"; link đúng file; chụp lại đầu trang html.
- [x] 4. Cập nhật file này + `wip/index.md` · commit `docs: reword system overview` + push.

## Kết quả
- 2026-10-14 — Bước 1: `git mv` → [docs/overview.md](../docs/overview.md), [docs/overview.html](../docs/overview.html); sửa link ở `docs/index.md` và giữa 2 file.
- 2026-10-14 — Bước 2: tiêu đề "Tổng quan hệ thống Daynest", dòng mô tả mới, mục 10 "Chạy và phát triển" (bỏ "xin secrets…", bỏ bước "Đọc theo thứ tự"), `docs/index.md` 2 chỗ.
- 2026-10-14 — Bước 3: `docs/` không còn "người mới"/"onboarding" (còn "Người phụ trách riêng" ở `supabase-plans.md`, không liên quan) · mọi link trỏ đúng file · chụp đầu trang đúng. Link trong việc cũ [2026-10-14-onboarding-guide.md](2026-10-14-onboarding-guide.md) trỏ tên cũ — giữ nguyên vì là log.
- 2026-10-14 — Bước 4: commit `docs: reword system overview` + push.
