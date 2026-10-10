# 2026-10-10 — Màn 2 (Lịch — Tuần): cuộn ngang trong hàng khi nhiều event — ✅ xong

## Input

- Phản hồi: màn "2. Lịch — Tuần" trong mockup, nếu số event trong 1 hàng (1 ngày) dài quá thì cho cuộn ngang trong hàng đó, không cắt/ẩn. VD ngày 29/8 âm lịch (3 event) cho lướt qua.

## Plan

- [x] Mockup (`docs/specs/sprint-2/design/mockups.html`): `.wrow .evs` đổi từ `overflow: hidden` sang cuộn ngang (`overflow-x: auto`, ẩn scrollbar); thêm event thứ 3 vào hàng 29/8 để minh hoạ cuộn.
- [x] Spec [F1](../docs/specs/sprint-2/F1-calendar.md) §Mô tả: ghi rõ hàng Tuần cuộn ngang khi nhiều event.

## Kết quả

- Hàng ngày ở chế độ Tuần cuộn ngang được khi event nhiều hơn chỗ hiện, không còn bị cắt mất event sau cùng. Áp dụng khi code bước 7 (Xem tuần / ngày / danh sách).
