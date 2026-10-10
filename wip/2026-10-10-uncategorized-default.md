# 2026-10-10 — "Chưa phân loại" là danh mục mặc định, không xoá được — ✅ xong

**Bạn chốt:** hộp xoá danh mục nói rõ ghi chú được chuyển sang "Chưa phân loại" — danh mục mặc định, không thể xoá.

- [x] Chữ hộp 18c: "3 ghi chú sẽ về Chưa phân loại. Ghi chú không bị xoá." → "3 ghi chú sẽ được chuyển sang "Chưa phân loại". Đây là danh mục mặc định, không thể xoá."
- [x] Logic (`F5`): trước ghi "Không có danh mục mặc định" → nay "Chưa phân loại" luôn có, không sửa/xoá, không tính vào 30; vẫn là `category_id = null` (không đổi DB).
- [x] Mockup: màn 18 thêm dòng đầu "Chưa phân loại" (không bút), chú thích mới; 18b dòng đó mờ, không tick; 18c chữ mới. `screens.md` 18, 18b, 18c.
