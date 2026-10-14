# 2026-10-13 — S5 bước 7: Chu kỳ — Lịch + nhắc — ✅ xong

Thuộc: [S5 lộ trình code](2026-10-13-s5-code-plan.md) · spec [§ Chu kỳ kinh nguyệt](../docs/specs/sprint-5/index.md#chu-kỳ-kinh-nguyệt) · [mockup](../docs/specs/sprint-5/design/mockups.html) Lịch Tháng, Danh sách, pop-up ngày.

## Input

- Dữ liệu và hàm thuần `lib/cycle/` đã có từ bước 6 (kỳ, dự đoán 3 kỳ, trễ N ngày).
- Lịch (chỉ khi "Theo dõi chu kỳ" bật):
  - Tháng, Tuần: giọt đặc màu `error` cạnh số ngày có kinh · giọt viền, mờ ở ngày dự đoán.
  - Ngày, Danh sách: 1 dòng "Kỳ kinh (ngày 2)" / "Dự đoán kỳ kinh", cùng icon giọt.
  - Pop-up ngày: dòng tóm tắt ("Kỳ kinh dự kiến sau 5 ngày" · "Kỳ kinh ngày 2" · "Trễ 3 ngày") + nút "Kỳ kinh" mở màn ghi.
- Nhắc: N ngày trước ngày dự đoán kỳ sau, lúc giờ đã chọn: "Kỳ kinh dự kiến bắt đầu sau N ngày" · bấm → Lịch ngày đó · đặt chung lần 30 ngày của `reminderSync` · tắt chu kỳ / tắt nhắc → huỷ.

## Plan

- [x] 1. Hàm thuần: trạng thái từng ngày (có kinh / dự đoán / ngày thứ k / trễ) + tóm tắt cho pop-up, thêm vào `lib/cycle/` (theo ghi chú "UI test thay unit test": chỉ thêm test nếu là logic mới).
- [x] 2. Tháng, Tuần: giọt đặc / viền mờ.
- [x] 3. Ngày, Danh sách: dòng chu kỳ.
- [x] 4. Pop-up ngày: dòng tóm tắt + nút "Kỳ kinh" (+ i18n VI/EN, câu chữ lịch sự, không chú thích thừa).
- [x] 5. Nhắc kỳ kinh trong `reminderSync` (+ mở Lịch đúng ngày khi bấm thông báo).
- [x] 6. `npm run typecheck && npm run lint && npm test` → build, cài máy ảo/thật, thử (ghi kỳ → giọt hiện, dự đoán đúng, trễ, tắt công tắc ẩn hết, nhắc) · dọn dữ liệu thử · commit `feat(app): cycle on the calendar and period reminder` + push.

## Kết quả
- 2026-10-13 — Bạn `ok`. Việc 1–5 xong: `cycleOnDay`, `reminderDates` (+ test, 219/219 ✓) · `CycleDrop` (giọt đặc / viền mờ) · Tháng, Tuần có giọt · Ngày, Danh sách có dòng chu kỳ · pop-up ngày có tóm tắt + nút "Kỳ kinh" · nhắc trước N ngày trong `reminderSync` (lưu kỳ kinh cũng đặt lại nhắc) · bấm thông báo mở Lịch đúng ngày. Lint 0 lỗi; typecheck chỉ còn lỗi route tự sinh có từ trước.
- Việc 6 (còn lại, làm tiếp ngày mai): build lại, cài máy, thử ghi kỳ → giọt hiện, dự đoán, trễ, tắt công tắc ẩn hết, nhắc. Đã cài bản build trước khi đổi tablet và mở được màn Kỳ kinh; chưa tick ngày nào, chưa dọn dữ liệu thử (chưa có). Bạn dừng ở đây nên commit khi chưa thử xong.
- Sửa kèm: màn Kỳ kinh lưới 7 cột bị rớt còn 6 (CN trống) → ô rộng 14.28%.
- 2026-10-14 09:07 — Việc 6 xong trên máy ảo Pixel_5_API_34 (bạn chọn máy ảo; APK `app/dist/daynest-4.0.0-6.apk`, build 13 phút 43 giây). Test 219/219 ✓, lint 0 lỗi. Đã thử:
  - Tick 10/9 → tự tick 10–14/9 → Lưu. Tháng 9: giọt đặc 10–14. Tháng 10: giọt viền mờ 14–18 (dự đoán 10/10 đã trễ → dời về hôm nay).
  - Pop-up 14/10: "Trễ 4 ngày" + nút "Kỳ kinh" (mở đúng màn Kỳ kinh). Pop-up 11/9: "Kỳ kinh ngày 2".
  - Tuần: giọt cạnh 14–18. Danh sách, Ngày: dòng "Dự đoán kỳ kinh".
  - Nhắc (trước 2 ngày, 09:00): `dumpsys alarm` có 2 lịch 11/11 09:00 và 11/12 09:00 (kỳ dự đoán 13/11, 13/12).
  - Tắt "Theo dõi chu kỳ": ẩn các dòng Cài đặt, giọt, dòng chu kỳ, tóm tắt pop-up; còn 0 lịch nhắc.
  - Dọn dữ liệu thử: bật lại công tắc, bỏ tick 10–14/9, Lưu.
  - Chưa thử: bấm thông báo → mở Lịch đúng ngày (phải chờ tới giờ nhắc).
