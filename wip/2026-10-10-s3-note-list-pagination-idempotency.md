# 2026-10-10 — S3: ghi chú list cần phân trang load more + idempotency — ✅ xong

## Input

- Bạn: "với các màn có list cần chú ý phần trang load more, và xử lý idempotency. thêm mục đó vào sprint 3."

## Plan

- [x] Thêm bullet vào [docs/specs/index.md](../docs/specs/index.md) mục "S3 — Todo": danh sách todo (và mọi màn list từ S3 về sau) dùng phân trang keyset (không `offset`, như note S2) + thao tác lặp không tạo trùng/lệch trang (idempotency, trỏ lại nguyên tắc ở §3).
