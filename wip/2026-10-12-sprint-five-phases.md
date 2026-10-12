# 2026-10-12 — Ghi 5 giai đoạn của mọi sprint vào README — ✅ xong

## Input

- Bạn: "note lại 5 giai đoạn để sprint nào cũng đi theo 5 giai đoạn. có thể ghi vào readme.md".
- `README.md` viết tiếng Anh (quy ước: ngoài `docs/`, `wip/` là tiếng Anh).
- Hiện quy trình nằm rải: `docs/specs/index.md` §2 dòng "Quy trình" (docs → thiết kế → code) + §4 "Cuối sprint" (các bước release).

## Plan

- [x] 1. `README.md`: thêm mục **"Sprint workflow"** (tiếng Anh), 5 giai đoạn, mỗi giai đoạn 1 todo trong `wip/`, chờ duyệt:
  1. Scope — chốt sprint làm gì / không làm gì.
  2. Spec — `docs/specs/sprint-N/index.md` (mục tiêu, phạm vi, DoD) + sửa spec tổng nếu đổi.
  3. Mockup — `docs/specs/sprint-N/design/mockups.html`, chỉ màn mới hoặc đổi · bạn duyệt trước khi code.
  4. Implement — mỗi mục 1 bước: code → `npm run typecheck && npm run lint && npm test` → thử trên máy thật → commit + push.
  5. Release — link tới [§4 Cuối sprint](docs/specs/index.md#cuối-sprint-mọi-sprint) (không chép lại các bước).
- [x] 2. `docs/specs/index.md` §2 dòng "Quy trình": thay "docs → thiết kế → code" bằng link tới mục README (1 thông tin chỉ ở 1 chỗ).
- [x] 3. `README.md` dòng giới thiệu còn cũ ("notes, diary, todo, expenses") → sửa thành Calendar · Notes · Expenses (khớp spec đã đổi ở S3).
- [x] 4. Commit `docs: sprint workflow in README` + push.

## Kết quả

- README có mục "Sprint workflow" (5 giai đoạn) + dòng giới thiệu Lịch · Ghi chú · Chi tiêu · spec tổng §2 trỏ về README.
