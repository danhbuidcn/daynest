# 2026-10-10 — Màn 13 (Chi tiết event): giống hệt mockup — ✅ xong

## Input

- Bạn: "13 => UI giống hệt mock up. màn 13 UI đang hiển thị khác".
- Khác mockup: dòng chi tiết (icon trần, không kẻ ngăn) · chấm màu 18 · nhãn "Chỉ trên Daynest" chữ thường · thanh trên cao hơn · menu `⋯` là hộp giữa màn (mockup: menu thả xuống góc phải) · chữ: "T7, 10/10/2026", "1/9 · Bính Ngọ", "Năm (âm lịch)", thiếu "Cả ngày: nhắc lúc 9:00".

## Plan

- [x] 1. `[id].tsx`: dòng như mockup `.row` (cao ≥ 56, icon trong ô 34 nền `primarySoft`, kẻ ngăn) · chấm màu 20 bo 7 · nhãn 24 cao, chữ đậm, icon 12 · `ScreenHeader compact` (8/12).
- [x] 2. `ActionMenu`: menu thả xuống góc phải dưới thanh trên (rộng 160, dòng 44, icon 20) — dùng chung cho note sau này.
- [x] 3. Chữ: "Thứ Tư, 21/10/2026" (`longDateLabel`) · ngày âm "12/9 năm Bính Ngọ" (cả pop-up ngày, xem Ngày — khớp mockup) · lặp âm "Hằng năm (âm lịch)" + "Mỗi năm vào 12/9 âm lịch" · event cả ngày có nhắc: dòng phụ "Cả ngày: nhắc lúc 9:00".
- [x] 4. typecheck + lint + test · emulator.
- [x] 5. Commit + push.

## Kết quả

- Emulator: màn Chi tiết "Kham rang" đúng bố cục mockup (dòng có ô icon xanh, kẻ ngăn, nhãn Chỉ trên Daynest). Bản chữ mới (thứ đầy đủ, "năm Bính Ngọ", "Hằng năm (âm lịch)") và menu `⋯` mới chưa chụp lại: bạn đang dùng emulator nên mình không bấm.
- Kiểm tra: typecheck ok · lint 0 lỗi · test 122/122. Mockup, spec không đổi (app theo mockup).
