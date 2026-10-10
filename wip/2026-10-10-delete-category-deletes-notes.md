# 2026-10-10 — Xoá danh mục thì xoá luôn ghi chú bên trong — ✅ xong

**Bạn chốt:** giữ như cũ, không có danh mục "Chưa phân loại" (đã revert commit `docs: uncategorized as fixed default category`). Xoá danh mục → mọi ghi chú bên trong bị xoá.

- [x] `F5`: ghi chú bên trong vào **thùng rác** (giống xoá 1 note, khôi phục được; khôi phục → không có danh mục). Hộp 18c: "Xoá n danh mục?" · "m ghi chú bên trong cũng sẽ bị xoá." (không có note → chỉ tiêu đề). Note không có danh mục: chip "+ Danh mục" (bỏ chữ "Chưa phân loại").
- [x] `db.md`: hàm `delete_note_categories(ids)` — 1 transaction: đưa note vào thùng rác rồi xoá danh mục.
- [x] `screens.md` 18c, `mockups.html` (chú thích màn 18, chữ hộp 18c).
