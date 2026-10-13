# 2026-10-13 — Giảm cỡ giao diện Ghi chú, Chi tiêu, Lịch + tablet full màn hình — 🔄 code xong, xem trên máy ngày mai

## Input

- Bạn thấy giao diện Ghi chú, Chi tiêu hơi lớn → giảm chữ + khoảng cách + icon, chỉ trong 2 tab (token `theme` giữ nguyên).

## Plan

- [x] 1. Chi tiêu: icon nhóm 34→28 · số tiền tổng 22→20 · chữ dòng 15→14 · tiêu đề thẻ 17→15 · dòng cao 56→48 · nút nhóm 40→36 · khoảng cách thẻ 12→8.
- [x] 2. Ghi chú: thẻ note (tiêu đề 17→15, padding 12→10) · ô tìm 44→38 · chip 32→28, chữ 13 · khoảng cách lưới 12→8.
- [x] 3. Lịch: thanh ngày (Danh sách, Todo) 68→58 · thanh chọn chế độ 40→36 · header 10→6 · **thanh tuần (chế độ Tuần) trải đều**: 5 ô (±2 tuần) chia đều bề ngang, không cuộn, cao 46.
- [x] 4. Tablet: bỏ khung giữa rộng tối đa 720 (`_layout`) → full màn hình · màn rộng ≥ 900 dp (tablet ngang): chữ và icon ×1.2 (`theme/useUiScale`, `AppText`, `Icon`).
- [ ] 5. Build, cài, bạn xem; chỉnh thêm nếu còn lớn → commit `fix(app): smaller notes and expenses UI` + push.

## Kết quả
- 2026-10-13 — Việc 1–2 xong (typecheck chỉ còn lỗi route tự sinh có từ trước). Chờ build cùng bước 7 để bạn xem.
- 2026-10-13 — Bạn yêu cầu full màn hình + chỉnh cỡ chữ/component trên tablet; làm xong thì commit + push, dừng, mai làm tiếp. Chưa build lại bản có phần tablet nên chưa xem trên máy. Mai: build, xem, chỉnh nếu còn lệch (nút, ô nhập, thanh tab chưa scale riêng).
