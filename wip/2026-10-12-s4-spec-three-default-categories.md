# 2026-10-12 — S4 spec: chỉ 3 nhóm có sẵn — ✅ xong

## Input

- Bạn (2026-10-12): chỉ tạo 3 nhóm có sẵn: Ăn uống, Di chuyển, Hoá đơn.

## Plan

- [x] 1. Sửa [sprint-4/index.md](../docs/specs/sprint-4/index.md) + [design/db.md](../docs/specs/sprint-4/design/db.md): 10 → 3 nhóm (`food`, `transport`, `bills`) · cách xoá nhóm tự tạo theo câu trả lời bên dưới · seed test tải 3 nhóm có sẵn.
- [x] 2. Thêm dòng `wip/index.md` · commit `docs: s4 spec, three default categories` + push.

## Câu hỏi

- Không còn nhóm "Khác" → xoá nhóm tự tạo đang có khoản chi thì sao?
  - A. Xoá luôn các khoản chi trong nhóm (hộp xác nhận nói rõ "n khoản chi cũng sẽ bị xoá") — giống xoá danh mục Ghi chú.
  - B. Không cho xoá khi nhóm còn khoản chi.
  - → Bạn: **A**.

## Kết quả
- 2026-10-12 17:00 — Bạn duyệt (A). Sửa spec S4 + db.md: 3 nhóm có sẵn · xoá nhóm tự tạo → xoá luôn khoản chi (FK `on delete cascade`, bỏ hàm xoá nhóm). Commit + push.
