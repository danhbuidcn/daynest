# Sprint 5 — Todo trên Lịch, chu kỳ kinh nguyệt, báo lỗi

Thuộc: [Spec tổng](../index.md) · S5. Chốt phạm vi: [wip](../../../wip/2026-10-13-s5-plan.md#bạn-chọn-2026-10-13-1435) (tham khảo CalendarCute, Flo).

## Mục tiêu

- Quản lý việc cần làm theo ngày ngay trên Lịch, giống CalendarCute: mỗi todo có danh sách việc nhỏ, tick xong.
- Biết trước ngày đến kỳ kinh, được nhắc trước — **chỉ dự đoán kỳ sau**, không gì thêm.
- Người dùng báo lỗi cho nhà phát triển ngay trong app.
- Sửa 2 lỗi còn lại từ S4.

## Phạm vi

| # | Việc | Chi tiết |
| --- | --- | --- |
| 1 | Todo | Tạo / sửa / xoá todo giống event + **việc phụ** + tick xong · hiện trên Lịch ([chi tiết](#todo)) |
| 2 | Danh sách todo chưa xong | Tab Ghi chú có thêm phần Todo: Quá hạn · Hôm nay · Sắp tới ([chi tiết](#danh-sách-todo)) |
| 3 | Chu kỳ kinh nguyệt | Bật/tắt trong Cài đặt · ghi ngày có kinh · Lịch hiện ngày dự đoán kỳ sau · nhắc trước kỳ kinh ([chi tiết](#chu-kỳ-kinh-nguyệt)) |
| 4 | Báo lỗi | Cài đặt › Báo lỗi: nội dung + ảnh → gửi email tới nhà phát triển ([chi tiết](#báo-lỗi)) |
| 5 | Lỗi S4: màu gần nhất lên Google | Đo màu theo cảm nhận mắt người (không theo RGB thô) ([chi tiết](#2-lỗi-từ-s4)) |
| 6 | Lỗi S4: "1 notes" | Thêm dạng số ít tiếng Anh ([chi tiết](#2-lỗi-từ-s4)) |

**Không làm ở S5:** "Kế hoạch nhiều ngày", sticker, nhắc kiểu báo thức, ghim, vị trí, URL, thử thách / thói quen, thống kê todo, đồng bộ todo lên Google · ngày rụng trứng, ngày dễ thụ thai, triệu chứng, tâm trạng, cân nặng, nhiệt độ, nhắc uống thuốc, chế độ mang thai · đổi gì khác ở Ghi chú.

## Todo

Todo = event có thêm **việc phụ** và **trạng thái xong**, lưu ở **bảng riêng** ([db.md](design/db.md#todo--bảng-mới-todos-todo_exceptions)). Form, lặp, ngoại lệ, nhắc làm giống event ([F2](../sprint-2/F2-event.md), [F3](../sprint-2/F3-reminders.md)), dùng lại code của event.

| Trường | Quy tắc |
| --- | --- |
| Tiêu đề, chi tiết, cả ngày / giờ, màu, lặp, nhắc | Như event · mặc định: **cả ngày bật**, ngày đang chọn, nhắc tắt |
| Việc phụ | 0–50 việc · mỗi việc: chữ ≤ 200 ký tự + xong / chưa · thêm, sửa chữ, xoá, kéo đổi thứ tự (dùng lại khối checklist của note) |
| Xong | Tick ô tròn trước tiêu đề · tick todo → mọi việc phụ cũng xong · tick đủ mọi việc phụ → todo tự xong · bỏ tick 1 việc phụ → todo về chưa xong |

- Todo lặp: **mỗi lần lặp có trạng thái xong + tick việc phụ riêng** (ngày 1 xong không làm ngày 2 xong). Danh sách việc phụ chung cho mọi lần; sửa riêng 1 lần lặp → "Chỉ lần này" như event.
- Ví dụ học tiếng Anh 30 ngày, mỗi ngày việc khác: tạo todo cho từng ngày, hoặc 1 todo lặp hằng ngày đến ngày 30 rồi sửa "Chỉ lần này" cho từng ngày (giống CalendarCute).
- Tick trên Lịch, danh sách todo, màn chi tiết: lưu ngay, không cần mở form · cập nhật lạc quan (hiện ngay, lỗi → trả lại + toast).
- **Không đồng bộ Google:** todo chỉ ở Daynest, kể cả khi bật đồng bộ.
- Lưu an toàn: như event (app sinh `id`, khoá lạc quan `updated_at`).

### Todo trên Lịch

- Hiện cùng event, cùng màu, có ô tròn ở đầu: chưa xong = viền tròn · xong = tròn đặc có ✓, chữ gạch ngang mờ.
- Tháng: thanh như event (ô tròn nhỏ ở đầu thanh) · Tuần, Ngày, Danh sách: dòng có ô tròn bấm được để tick.
- Pop-up ngày: todo hiện dưới event, có ô tick · ghi "2/5" nếu có việc phụ.
- Chi tiết todo: ô tick + tiêu đề · danh sách việc phụ tick được · thời gian · lặp · nhắc · chi tiết · ⋯ Sửa, Xoá.

## Danh sách todo

Tab "Ghi chú" có nút chuyển ở đầu màn: **Todo | Ghi chú** (mặc định Ghi chú, nhớ lựa chọn trên máy). Phần Ghi chú giữ nguyên.

Phần Todo có thanh tuần ngang để chọn ngày (như Lịch › Danh sách: ‹ › đổi tuần, nút "Hôm nay"; chỉ có chấm dưới hôm nay). Ngày chọn mặc định là hôm nay; mở lại tab → về hôm nay. 3 nhóm tính theo **ngày chọn**:

| Nhóm | Gồm |
| --- | --- |
| Quá hạn | Todo chưa xong có ngày trong **30 ngày trước** ngày chọn · mới nhất ở trên |
| Hôm nay | Mọi todo của ngày chọn (cả đã xong, xếp cuối) · chọn ngày khác hôm nay → tên nhóm là ngày đó, vd "Thứ Hai, 12/10" |
| Sắp tới | Todo chưa xong **7 ngày sau** ngày chọn · theo ngày |

- Mỗi dòng: ô tick · tiêu đề · "2/5" việc phụ · ngày (Quá hạn, Sắp tới) · chấm màu · bấm → chi tiết todo.
- Trống cả 3 nhóm: "Chưa có việc cần làm" + nút "Thêm todo".
- Todo lặp: mỗi lần lặp là 1 dòng.

## Chu kỳ kinh nguyệt

Mặc định **tắt**. Tắt → không hiện gì trên Lịch, không nhắc; dữ liệu đã ghi vẫn giữ.

### Ghi ngày có kinh

- Màn **"Kỳ kinh"**: lịch cuộn dọc theo tháng (như Flo), mỗi ngày 1 ô tròn để tick · chỉ tick được ngày ≤ hôm nay.
- Tick 1 ngày không nằm sát kỳ nào → coi là ngày bắt đầu kỳ mới, tự tick thêm theo **độ dài kỳ kinh** (mặc định 5 ngày, không vượt hôm nay) · bỏ / thêm từng ngày → "Lưu".
- Mở từ: pop-up ngày trên Lịch (dòng "Kỳ kinh" khi tính năng bật) · Cài đặt › Chu kỳ kinh nguyệt.
- Bật lần đầu → mở luôn màn Kỳ kinh: "Chạm vào ngày bắt đầu kỳ kinh gần nhất".

### Dự đoán

- Kỳ kinh = chuỗi ngày có kinh liền nhau. Ngày bắt đầu kỳ = ngày đầu chuỗi.
- **Độ dài chu kỳ** = trung bình khoảng cách giữa các ngày bắt đầu, lấy **tối đa 6 kỳ gần nhất**, bỏ khoảng < 15 hoặc > 60 ngày (ghi thiếu). Chưa đủ 2 kỳ → dùng số trong Cài đặt (mặc định 28).
- Kỳ sau bắt đầu = ngày bắt đầu kỳ gần nhất + độ dài chu kỳ; kéo dài = độ dài kỳ kinh (trung bình các kỳ đã ghi, chưa có → Cài đặt, mặc định 5).
- Hiện **3 kỳ dự đoán** tiếp theo. Đã quá ngày dự đoán mà chưa ghi → kỳ dự đoán dời về **hôm nay** (đang trễ), hiện "Trễ N ngày".
- Hàm dự đoán là hàm thuần (`lib/cycle/`), có test.

### Trên Lịch

- Ngày có kinh: icon giọt đặc màu `error` cạnh số ngày · ngày dự đoán: giọt viền, mờ (Tháng, Tuần) · cùng icon giọt với dòng chu kỳ ở Danh sách, pop-up ngày · Ngày, Danh sách: 1 dòng "Kỳ kinh (ngày 2)" / "Dự đoán kỳ kinh".
- Pop-up ngày: dòng tóm tắt, vd "Kỳ kinh dự kiến sau 5 ngày" · "Kỳ kinh ngày 2" · "Trễ 3 ngày" + nút "Kỳ kinh" mở màn ghi.

### Nhắc

- Thông báo vào **giờ nhắc**, **N ngày trước** ngày dự đoán kỳ sau (bạn chọn trong Cài đặt, mặc định 9:00, 2 ngày): "Kỳ kinh dự kiến bắt đầu sau N ngày" · bấm → Lịch ngày đó.
- Dùng chung cơ chế đặt thông báo của F3 (công tắc "Cho phép thông báo", đặt cho 30 ngày tới).

### Cài đặt — nhóm "Chu kỳ kinh nguyệt"

| Mục | Kiểu | Mặc định |
| --- | --- | --- |
| Theo dõi chu kỳ | Công tắc | Tắt |
| Ghi ngày có kinh | Dòng › → màn Kỳ kinh | — |
| Độ dài chu kỳ | Hộp chọn 21–45 ngày | 28 |
| Độ dài kỳ kinh | Hộp chọn 2–10 ngày | 5 |
| Nhắc trước kỳ kinh | Công tắc · bật → pop-up chọn số ngày (1–7) + giờ : phút (bước 5 phút) · dòng phụ "Trước 2 ngày · 9:00" | Bật · 2 ngày · 9:00 |

- Tắt "Theo dõi chu kỳ" ẩn các dòng dưới · "Nhắc trước kỳ kinh": bấm dòng khi đang bật → mở lại pop-up · Huỷ pop-up khi vừa bật → công tắc về tắt · tắt → ẩn dòng phụ. Chú thích dưới nhóm: "Dữ liệu chu kỳ chỉ bạn xem được."
- Dữ liệu sức khoẻ: chỉ chủ tài khoản đọc được (RLS) · khai báo Data safety ở [S6](../sprint-6/index.md).

## Báo lỗi

- Cài đặt › nhóm Ứng dụng › **"Báo lỗi"** → màn Báo lỗi:
  - Ô nội dung, bắt buộc, 10–2000 ký tự · gợi ý "Mô tả lỗi: bạn đã làm gì, thấy gì".
  - Ảnh: tối đa **3 ảnh** từ thư viện máy · app thu nhỏ (cạnh dài ≤ 1600 px, JPEG) trước khi gửi · bấm ✕ để bỏ ảnh.
  - App tự gửi kèm: phiên bản app, máy, Android, ngôn ngữ, email tài khoản — không hiện trên màn.
  - Nút **Gửi** → lưu báo cáo vào DB + ảnh vào Storage → gọi Edge Function gửi email tới **mọi email nhà phát triển trong DB** (ảnh đính kèm) → toast "Đã gửi. Cảm ơn bạn!" → quay lại.
- Giới hạn: **5 báo cáo / ngày / tài khoản** · quá → hộp "Đã gửi đủ 5 báo cáo hôm nay" · "Hãy thử lại vào ngày mai." · giữ nội dung
- Email nhận: bảng `developer_emails` trong DB, app không đọc được · tạm 1 email · thêm/bớt email bằng migration.
- Gửi email lỗi (dịch vụ mail hỏng): báo cáo vẫn nằm trong DB, đánh dấu chưa gửi; app vẫn báo "Đã gửi" (người dùng không cần làm lại).
- Mất mạng → khoá nút Gửi, giữ nội dung ([§5](../index.md#5-xử-lý-lỗi-chung)).
- Gửi bằng Gmail (SMTP + mật khẩu ứng dụng). Chi tiết DB, Storage, Edge Function: [db.md](design/db.md#báo-lỗi).

## 2 lỗi từ S4

- **Màu gần nhất lên Google** (`toGoogleColorId`, `lib/google/mapping.ts`): đổi từ khoảng cách RGB thô sang khoảng cách trong không gian màu **Lab** (ΔE76, gần với mắt người). Test: `#8B1E3F` → Flamingo (đỏ hồng, không còn xám), `#FFE08A` → Banana (vàng), 11 màu Google ra chính nó. (Ban đầu ghi Tomato; không cách đo Lab chuẩn nào ra Tomato — xem [wip](../../../wip/2026-10-13-s5-step-2-s4-bugs.md).)
- **"1 notes"**: thêm khoá `_one` cho `count` và `confirmText` trong `en.json` → "1 note" / "2 notes". Rà các chuỗi đếm khác trong `en.json` (todo "1 task", việc phụ…) cùng cách.

## Màn hình

```text
Nút + (thanh tab) → pop-up: Sự kiện · Todo · Ghi chú · Khoản chi
Form Todo: ✕ · "Todo" · Lưu · tiêu đề · chi tiết · Việc phụ (+ Thêm việc phụ) · cả ngày / giờ · nhắc · lặp · màu
Chi tiết Todo: ô tick + tiêu đề · việc phụ (tick) · thời gian · lặp · nhắc · chi tiết · ⋯ Sửa / Xoá
Lịch (Tháng / Tuần / Ngày / Danh sách): todo có ô tròn · giọt kỳ kinh (đặc / viền)
Pop-up ngày: event · todo (tick, 2/5) · dòng chu kỳ + nút "Kỳ kinh"
Tab Ghi chú: [Todo | Ghi chú] · Todo: thanh tuần chọn ngày (chỉ chấm dưới hôm nay) · Quá hạn · Hôm nay (ngày chọn) · Sắp tới
Màn Kỳ kinh: lịch cuộn dọc, ô tròn tick ngày có kinh · Lưu
Cài đặt: nhóm "Chu kỳ kinh nguyệt" (sau nhóm Lịch) · nhóm Ứng dụng thêm "Báo lỗi"
Màn Báo lỗi: nội dung · ảnh (≤ 3) · Gửi
```

- Lỗi: theo [§5](../index.md#5-xử-lý-lỗi-chung).
- Mọi chữ qua i18n (VI + EN), lời lẽ theo [design-system § Câu chữ](../design-system.md).

## Thiết kế

- [DB](design/db.md): `todos`, `todo_exceptions`, `period_days`, cột chu kỳ trong `user_settings`, `bug_reports`, `developer_emails`, Storage, Edge Function, test tải.
- [Mockup S5](design/mockups.html) — 18 màn: nút +, form / chi tiết Todo, Lịch Tháng + Danh sách + pop-up ngày (todo, kỳ kinh), tab Ghi chú › Todo (+ chọn ngày khác, trống), màn Kỳ kinh (+ lần đầu), Cài đặt + độ dài chu kỳ + pop-up nhắc trước kỳ kinh, Báo lỗi (+ đủ 3 ảnh, đã gửi, quá 5 lần).

## Xong khi (DoD)

- [ ] Todo: tạo, sửa, xoá, lặp, sửa "Chỉ lần này", nhắc · việc phụ thêm / sửa / xoá / kéo đổi thứ tự · tick trên Lịch, pop-up ngày, chi tiết, danh sách todo · todo lặp tick riêng từng lần · bật đồng bộ Google → todo không lên Google.
- [ ] Danh sách todo: Quá hạn, Hôm nay, Sắp tới đúng theo ngày và múi giờ trong Cài đặt.
- [ ] Chu kỳ: bật/tắt · ghi / bỏ ngày có kinh · dự đoán 3 kỳ đúng công thức (hàm thuần có test) · trễ → "Trễ N ngày" · nhắc đúng giờ nhắc, số ngày đã chọn trên máy thật.
- [ ] Báo lỗi: gửi nội dung + 3 ảnh → email tới đủ các email trong DB, có ảnh · quá 5 lần / ngày bị chặn · user không đọc được báo cáo, ảnh, email của user khác.
- [ ] 2 lỗi S4: màu gần nhất đúng theo test · "1 note" ở màn Categories và hộp xoá.
- [ ] Test RLS cho bảng / cột mới · test tải đạt (0 lỗi, p95 < 1 s).
- [ ] `npm run typecheck && npm run lint && npm test` qua.
- [ ] Cuối sprint: release theo [Spec tổng §4](../index.md#cuối-sprint-mọi-sprint).

## Đã chốt (2026-10-13)

1. Todo lưu **bảng mới** `todos`, `todo_exceptions` (không thêm cột vào `events`).
2. Danh sách todo ở tab **"Ghi chú"** (nút Todo | Ghi chú), giữ tên tab.
3. Gửi email bằng **Gmail**: Edge Function gửi qua SMTP của 1 tài khoản Gmail + mật khẩu ứng dụng (không cần tên miền riêng).
