# Sprint 6 — Nhanh, bền và tính năng

Thuộc: [Spec tổng](../index.md) · S6. Chốt phạm vi: [wip](../../../wip/2026-10-14-speed-ux-improvements-plan.md) (tham khảo Google Calendar, TimeTree, Money Lover, Gmail, Google Keep).

## Mục tiêu

- Bấm Lưu, Xoá, tick thấy kết quả gần như ngay. Đổi tháng, đổi tab ít phải chờ.
- Mất mạng, server lỗi hoặc chậm: app không treo, người dùng biết chuyện gì xảy ra và nên làm gì.
- Dùng sướng tay hơn: rung nhẹ, khung xương khi tải, xoá nhầm thì Hoàn tác.
- Lịch Tháng thêm chỗ cho event: ô cao hơn, cuộn dọc.
- Thêm 3 tính năng: ngân sách tháng, khoản chi lặp lại, đổi giao diện (màu, nền, font) như CalendarCute.
- Vẫn **online-only** ([§2](../index.md#2-quyết-định-chung)): mất mạng chỉ xem, không ghi.

## Phạm vi

| # | Việc | Chi tiết |
| --- | --- | --- |
| 1 | Lưu nhanh | Form Lưu xong cập nhật dữ liệu trên máy ngay, không tải lại · Xoá, tick hiện ngay ([chi tiết](#1-lưu-nhanh)) |
| 2 | Tải nhanh | Event, todo: 1 lượt gọi thay 2 ([chi tiết](#2-tải-nhanh)) |
| 3 | Lỗi API, server, mạng | Thời gian chờ tối đa · tự tải lại khi có mạng, mở lại app · banner mất mạng chung · lỗi trên tab Lịch · thông báo lỗi rõ ([chi tiết](#3-lỗi-api-server-mạng)) |
| 4 | Rung nhẹ, khung xương | ([chi tiết](#4-rung-nhẹ-khung-xương)) |
| 5 | Hoàn tác sau khi xoá | Event, todo, khoản chi ([chi tiết](#5-hoàn-tác-sau-khi-xoá)) |
| 6 | Ngân sách tháng | Dùng cho mọi tháng hoặc riêng 1 tháng · thanh tiến độ ở Chi tiêu › Tháng ([chi tiết](#6-ngân-sách-tháng)) |
| 7 | Khoản chi lặp lại | Hằng tuần / hằng tháng · app tự ghi khoản chi tới hạn ([chi tiết](#7-khoản-chi-lặp-lại)) |
| 8 | Giao diện | Chủ đề màu (cả chế độ tối, tự chọn màu chủ đạo) · nền (cả màu tự chọn) · font + cỡ chữ · đổi xong áp dụng ngay ([chi tiết](#8-giao-diện)) |
| 9 | Lịch Tháng rộng hơn | Ô ngày cao hơn (tới 5 thanh event) · cuộn dọc · cuộn xuống thu gọn đầu lịch ([chi tiết](#9-lịch-tháng-rộng-hơn)) |
| 10 | Chi tiêu theo nhóm | Danh sách nhóm ở mọi chế độ (Ngày còn danh sách khoản chi bên dưới) · bấm nhóm → pop-up các khoản chi của nhóm ([chi tiết](#10-chi-tiêu-theo-nhóm)) |
| 11 | Nút + theo tab | Ở tab Chi tiêu, Ghi chú: nút `+` mở thẳng form của tab ([chi tiết](#11-nút--theo-tab)) |
| 12 | Icon + nhóm gợi ý cho người Việt | 42 icon sát chi tiêu thực tế · 24 nhóm gợi ý chạm là thêm ([chi tiết](#12-icon-và-nhóm-gợi-ý-cho-người-việt)) |

**Không làm ở S6:** ghi khi mất mạng (hàng chờ), widget, sticker, sửa riêng từng token màu (chỉ tự chọn màu chủ đạo), lưu nhiều chủ đề tự tạo, font tải từ mạng, ngân sách theo nhóm / theo tuần, thông báo (toast, đẩy) khi sắp vượt / vượt ngân sách — thanh tiến độ đã đủ, khoản thu, khoản chi lặp hằng năm / có ngày kết thúc, tìm kiếm event / todo / khoản chi (bạn bỏ 2026-10-14: màn Lịch đã đủ nhiều thứ; note vẫn có tìm kiếm riêng), công tắc tắt rung.

## 1. Lưu nhanh

Hiện tại: bấm Lưu → chờ server ghi → tải lại **mọi** khoảng ngày đang mở (mỗi khoảng 2 lượt gọi) → mới thấy thay đổi.

| Thao tác | Cách mới |
| --- | --- |
| Lưu form (event, todo, khoản chi, note) | Form vẫn chờ server ghi xong (giữ khoá lạc quan, hộp "Đã thay đổi ở thiết bị khác", "Lưu lỗi → giữ form" ở [§5](../index.md#5-xử-lý-lỗi-chung)) · server trả về dòng đã lưu → **đặt thẳng vào dữ liệu trên máy**, đóng form ngay · không tải lại · kiểm tra lại với server ở nền (lần tải kế tiếp) |
| Xoá event, todo, khoản chi | Biến mất ngay, gửi server sau khi hết thời gian Hoàn tác ([§5](#5-hoàn-tác-sau-khi-xoá)) |
| Tick todo | Đã hiện ngay từ S5, giữ nguyên |
| Lưu lỗi sau khi đã hiện | Trả dữ liệu về như cũ + toast lỗi ([§3](#3-lỗi-api-server-mạng)) |

- Event lặp, todo lặp: dòng đã lưu đặt vào mọi khoảng ngày đang có trên máy mà nó nằm trong → app tự trải ra các lần lặp như bây giờ.
- Sửa "Chỉ lần này": đặt ngoại lệ vào dữ liệu trên máy cùng cách.
- Hàm "đặt dòng đã lưu vào dữ liệu trên máy" là hàm thuần, có test (thêm mới, sửa, đổi ngày sang khoảng khác, xoá).

## 2. Tải nhanh

- Event: 1 lượt gọi lấy event + ngoại lệ (select lồng bảng của Supabase `events` → `event_exceptions`), thay vì gọi nối tiếp 2 lượt. Todo cùng cách (`todos` → `todo_exceptions`).
- Đọc lỗi tự thử lại **2 lần** (chờ 1 s, rồi 3 s) · ghi không tự thử lại (người dùng bấm lại; `id` do app sinh nên không trùng).
- **Đo trước / sau** trên máy thật, 4G, ghi vào wip: (a) mở app lạnh tới khi thấy lịch, (b) sang tháng chưa có trên máy, (c) Lưu event tới khi form đóng và event hiện trên Lịch. Mục tiêu: (b) và (c) nhanh hơn rõ (≥ 30%).

## 3. Lỗi API, server, mạng

### Thời gian chờ

- Mỗi lượt gọi Supabase (đọc, ghi) chờ tối đa **15 s** · gửi ảnh báo lỗi, Edge Function: **60 s** · quá → coi là lỗi "server chậm".
- Gọi Google Calendar: giữ cách S2 (thử lại 1 lần) + cùng thời gian chờ 15 s.

### Mất mạng hoặc máy chủ sự cố

- Cả hai trường hợp xử lý như nhau: **vẫn hiện dữ liệu đã lưu trên máy** (Lịch, Ghi chú, Todo, Chi tiêu, Cài đặt) · chỉ **không tạo, sửa, xoá được**.
- **Banner chung** ở đầu mọi màn: "Không có kết nối mạng." (mất mạng) hoặc "Máy chủ đang gặp sự cố." (máy chủ lỗi / chậm quá 15 s) · hết sự cố → banner ẩn.
- Khoá (nút mờ, bấm không có tác dụng) mọi thao tác ghi: Lưu, Xoá, tick todo, tick ngày có kinh, Gửi báo lỗi · nút `+` và nút "Thêm …" cũng khoá · dùng chung 1 hook, bỏ các chỗ tự kiểm tra mạng riêng lẻ.
- Máy chủ sự cố: app thử lại ở nền (1 lần mỗi 30 s) · gọi được lại → banner ẩn, nút mở khoá, tự tải lại dữ liệu đang xem.
- Có mạng lại → tự tải lại dữ liệu đang xem.

### Mở lại app

- App từ nền quay lại → tải lại dữ liệu đang xem nếu đã cũ hơn 2 phút (giữ `staleTime` hiện tại).

### Lỗi khi tải

| Tình huống | Hiện |
| --- | --- |
| Có dữ liệu trên máy, tải mới lỗi | Giữ dữ liệu cũ · dòng nhỏ dưới tiêu đề "Chưa cập nhật được · Thử lại" |
| Chưa có dữ liệu trên máy (mở app lần đầu, đăng nhập máy mới), tải lỗi | Thẻ lỗi giữa màn: icon · tiêu đề theo loại lỗi · nút "Thử lại" |

- Áp dụng cho tab Lịch (mọi chế độ), tab Ghi chú (Todo + Ghi chú), tab Chi tiêu · lỗi khác khi tải: "Chưa tải được. Hãy thử lại." Tab Lịch hiện chưa có trạng thái lỗi → lỗi trông như "không có event".

### Thông báo lỗi theo loại

| Loại | Cách nhận ra | Câu (VI) |
| --- | --- | --- |
| Mất mạng | Máy báo không có mạng | "Không có kết nối mạng." |
| Server lỗi / chậm | Hết 15 s · lỗi 5xx · không kết nối được tới Supabase khi máy vẫn có mạng (gồm cả khi project Supabase bị tạm dừng) | "Máy chủ đang gặp sự cố. Hãy thử lại sau ít phút." |
| Bị đăng xuất | Lỗi 42501 / phiên hết hạn | Giữ cách S2 F7 ("Bạn đã bị đăng xuất") |
| Đổi ở thiết bị khác | Khoá lạc quan | Giữ hộp S2 |
| Khác | Còn lại | "Chưa lưu được. Hãy thử lại." |

- Hàm phân loại lỗi là hàm thuần (`lib/`), có test.

## 4. Rung nhẹ, khung xương

- **Rung nhẹ** (`expo-haptics`): tick / bỏ tick todo, việc trong danh sách, ngày có kinh → rung nhẹ · Lưu xong → rung "thành công" · Xoá → rung nhẹ · kéo đổi thứ tự → rung khi nhấc lên.
- **Khung xương** khi tải lần đầu (chưa có dữ liệu trên máy) thay cho màn trống / vòng quay: Lịch Tháng (lưới, số ngày, ngày âm hiện ngay vì tính trên máy — chỉ thanh event là khối xám), Lịch Danh sách, Ghi chú (thẻ xám), Todo, Chi tiêu (khối tổng + cột xám) · nhấp nháy nhẹ.

## 5. Hoàn tác sau khi xoá

Giống Gmail: xoá xong có 4 s để Hoàn tác.

- Áp dụng: xoá event, todo (cả "Chỉ lần này" và "Tất cả"), khoản chi. Note đã có (thùng rác), giữ nguyên.
- Bấm Xoá → mục biến mất ngay · toast "Đã xoá · Hoàn tác" (4 s) · hết 4 s → mới gửi lệnh xoá tới server (cả Google nếu event đang đồng bộ).
- Bấm Hoàn tác → mục hiện lại, không gửi gì.
- App bị chuyển ra nền trong 4 s đó → gửi lệnh xoá ngay (không để mất lệnh).
- Gửi xoá lỗi → mục hiện lại + toast lỗi.
- **Bỏ hộp xác nhận xoá** (Hoàn tác thay cho hộp) · event / todo lặp vẫn có hộp chọn "Chỉ lần này / Tất cả" · xoá nhóm chi tiêu, quy tắc lặp vẫn có hộp (không Hoàn tác).
- Mất mạng hoặc máy chủ sự cố → nút Xoá bị khoá ([§3](#mất-mạng-hoặc-máy-chủ-sự-cố)), nên không có lệnh xoá chờ mạng.

## 6. Ngân sách tháng

- Số tiền VND, 1 → 100.000.000.000 · mặc định chưa đặt · lưu theo tài khoản (cả 2 máy thấy như nhau).
- **2 loại:** ngân sách **chung** (dùng cho mọi tháng) · ngân sách **riêng 1 tháng** (vd tháng Tết đặt cao hơn; ghi đè ngân sách chung của tháng đó, các tháng khác vẫn dùng ngân sách chung).
- Ngân sách của 1 tháng = ngân sách riêng của tháng đó nếu có, không thì ngân sách chung.
- Chi tiêu › **Tháng**: dưới "Tổng chi" có thanh tiến độ.
  - Màu thanh: < 80% `primary` · 80–100% `warning` · > 100% `error`.
  - Chưa đặt → dòng "Đặt ngân sách tháng" (bấm được).
- Bấm thanh / dòng → hộp "Ngân sách tháng 10": ô số tiền (bàn phím số, chấm ngàn như form khoản chi) · công tắc **"Dùng cho mọi tháng"** (mặc định bật; tháng đang có ngân sách riêng → tắt) · Huỷ / Lưu.
  - Lưu, công tắc **bật** → số trong ô là ngân sách chung · tháng này bỏ ngân sách riêng (nếu có).
  - Lưu, công tắc **tắt** → số trong ô là ngân sách riêng của tháng này.
  - Ô để trống = "không có ngân sách" (không có nút "Bỏ ngân sách" riêng).
  - Hàm "ngân sách của tháng" là hàm thuần, có test.
- Chế độ Ngày, Tuần: không hiện ngân sách.
- Dòng dưới thanh: trái "71% ngân sách 7.800.000 ₫" (ngân sách riêng: "71% ngân sách riêng 7.800.000 ₫") · phải "Còn 2.320.000 ₫" (vượt: "Vượt …" chữ `error`) · chưa đặt: nút "Đặt ngân sách tháng" (nền `primarySoft`) trong thẻ Tổng chi.

## 7. Khoản chi lặp lại

Tiền nhà, điện, mạng, học phí… app tự ghi, người dùng không phải nhập mỗi kỳ.

### Tạo

- Form khoản chi có thêm dòng **"Lặp lại"**: Không (mặc định) · Hằng tuần · Hằng tháng · chỉ khi **tạo mới**.
- Chọn lặp → Lưu tạo **1 quy tắc lặp** (số tiền, nhóm, ghi chú, kiểu lặp, ngày bắt đầu = ngày trong form) + ghi ngay các khoản chi tới hạn (ngày bắt đầu ≤ hôm nay → có khoản chi đầu tiên).
- Hằng tháng: cùng ngày mỗi tháng · ngày 29–31 mà tháng không có → ngày cuối tháng · Hằng tuần: cùng thứ.

### Tự ghi

- Mỗi khi mở tab Chi tiêu hoặc app quay lại từ nền: app gọi 1 hàm DB ghi mọi khoản chi tới hạn (ngày ≤ hôm nay theo múi giờ Cài đặt) chưa ghi → có ghi mới thì tải lại Chi tiêu.
- Hàm DB khoá dòng quy tắc khi ghi → 2 máy gọi cùng lúc không ghi trùng ([db.md](design/db.md#khoản-chi-lặp-lại--bảng-expense_recurrences)).
- Lâu không mở app → ghi bù mọi kỳ đã qua (tối đa 60 khoản / lần gọi).
- Khoản chi tự ghi là khoản chi bình thường: sửa, xoá được, không ảnh hưởng quy tắc · xoá rồi không bị ghi lại.
- Chi tiêu › Ngày: khoản chi tự ghi có icon lặp nhỏ.

### Quản lý

- Chi tiêu › nút Nhóm (có sẵn) › màn Nhóm chi tiêu: dòng đầu **"Khoản chi lặp lại ›"** mở màn **"Khoản chi lặp lại"** (không thêm icon ở đầu màn Chi tiêu): danh sách quy tắc (icon nhóm · ghi chú hoặc tên nhóm · số tiền · "Hằng tháng · lần tới 05/11") · trống: "Chưa có khoản chi lặp lại." · nút đáy "Thêm khoản chi lặp lại" → form khoản chi với Lặp lại = Hằng tháng.
- Bấm 1 quy tắc → form sửa quy tắc: số tiền, nhóm, ghi chú, kiểu lặp, ngày lần tới · Lưu → chỉ áp dụng cho các lần **sau** · khoản chi đã ghi giữ nguyên.
- Xoá quy tắc: hộp chỉ có tiêu đề "Xoá khoản chi lặp lại này?" · Huỷ / Xoá → chỉ dừng lặp, khoản chi đã ghi giữ nguyên.
- Xoá nhóm chi tiêu → xoá cả quy tắc thuộc nhóm (như khoản chi, S4).

## 8. Giao diện

Cài đặt › nhóm **"Giao diện"** (đầu danh sách) → màn **Giao diện**, có ô xem trước (lịch tháng thu nhỏ + 1 thẻ) đổi theo lựa chọn. Đổi xong **áp dụng ngay** cho cả app, không cần mở lại app.

### Chủ đề màu

- **8 bộ màu** có sẵn, mỗi bộ đủ các token của [design-system](../design-system.md) (`primary`, `primaryDark`, `primarySoft`, `bg`, `surface`, `border`, `text`, `textMuted`…): Bạc hà (mặc định, như hiện tại) · Hồng đào · Xanh biển · Oải hương · Cam đất · Vàng chanh · Xám than · **Tối** (chế độ tối).
- Thêm lựa chọn **"Theo hệ thống"**: máy đang chế độ tối → bộ Tối, sáng → bộ đã chọn.
- Thêm ô **"Tự chọn"** (bạn yêu cầu 2026-10-14): chọn **màu chủ đạo bất kỳ** (dùng lại hộp chọn màu S4) + **Sáng / Tối** → app tự tính các token còn lại:
  - `primary` = màu đã chọn · `primaryDark` = đậm hơn (sáng) / sáng hơn (tối) · `primarySoft` = pha nhạt màu chủ đạo vào nền.
  - `bg`, `surface`, `border`, `text`, `textMuted` = lấy từ bộ Bạc hà (Sáng) hoặc bộ Tối, pha nhẹ sắc màu chủ đạo.
  - Màu quá nhạt / quá sáng làm chữ link (`primaryDark`) không đọc được trên nền → app tự chỉnh đậm / sáng tới khi đạt tương phản ≥ 4,5:1.
  - Chỉ 1 chủ đề tự chọn (chọn lại là thay) · hàm tính bộ màu là hàm thuần, có test (tương phản, màu rất nhạt, rất đậm).
- Màu event, nhóm chi tiêu, danh mục note giữ nguyên màu người dùng chọn ở mọi bộ · chữ trên nền màu vẫn tự chọn tối / trắng ([S4](../sprint-4/index.md#màu-bất-kỳ)).
- Thêm 1 token mỗi bộ: `toast` (nền toast; bộ sáng = `text`, bộ Tối = `#3A3A42`, vì nền toast = `text` sẽ sáng ở bộ Tối) · bộ Tối: `primaryDark` sáng hơn `primary` (chữ link trên nền tối).
- Chữ / icon trên nền màu event, nhóm chi tiêu: màu tối **cố định** `#2F2D33` ở mọi bộ (không theo `text`, vì `text` của bộ Tối là màu sáng) — vẫn tự đổi sang trắng khi nền màu tối ([S4](../sprint-4/index.md#màu-bất-kỳ)).
- Mọi bộ màu đạt tương phản chữ ≥ 4,5:1 (`text` trên `bg`, `surface`) · có test kiểm tương phản (hàm thuần).
- Thanh trạng thái, nền màn chờ khởi động theo bộ màu (bộ Tối → chữ thanh trạng thái sáng).

### Nền

- Áp dụng cho nền các tab chính (Lịch, Ghi chú, Chi tiêu) · thẻ, hộp thoại vẫn nền `surface` để chữ dễ đọc.
- Chọn (bạn thêm 2026-10-14: nhiều nền đẹp hơn, như CalendarCute):
  - **Trơn** — màu `bg` của bộ màu (mặc định).
  - **Màu** — 8 màu pastel có sẵn (bộ sáng: kem, hồng phấn, xanh nhạt, bạc hà nhạt, tím nhạt, cam nhạt, vàng nhạt, xám nhạt · bộ Tối: 8 màu tối tương ứng) + **Màu khác** (màu bất kỳ, hộp chọn màu S4; quá tối với bộ sáng / quá sáng với bộ Tối → app báo "Màu này làm chữ khó đọc" và không cho chọn).
  - **Chuyển màu** — 8 nền chuyển màu tự làm từ màu bộ màu + màu event.
  - **Hoạ tiết** — 6 hoạ tiết tự vẽ, màu nhạt theo `primary` (hoặc màu event): chấm bi · giấy kẻ ô · kẻ dòng · sọc chéo · sao nhỏ · tim nhỏ · thưa, mờ để không lấn chữ (bộ Tối mờ hơn nữa).
  - **Ảnh của bạn** (chọn từ thư viện máy, app thu nhỏ cạnh dài ≤ 1600 px, chỉ lưu **trên máy**, không lên server) · ô **độ mờ** cho ảnh (0–80%, mặc định 40%) để chữ dễ đọc.
- Không chép hình, sticker của CalendarCute ([design-system](../design-system.md)).
- Ảnh nền chỉ ở máy đã chọn; máy kia thấy nền Trơn · đăng xuất → xoá ảnh trên máy.

### Font

- **6 font** Google Fonts, đủ dấu tiếng Việt, gói sẵn trong app (không tải từ mạng): Nunito (mặc định) · Be Vietnam Pro · Quicksand · Baloo 2 (tròn, dễ thương) · Itim (viết tay) · Patrick Hand (viết tay).
- **Cỡ chữ:** Nhỏ (0,9) · Vừa (1, mặc định) · Lớn (1,15) · nhân vào mọi cỡ trong `type` · gộp với hệ số màn rộng (`WIDE_SCALE`) hiện có.
- Mỗi font cần đủ 3 độ đậm đang dùng (600, 700, 800); font thiếu độ đậm → dùng độ gần nhất.

### Lưu

- Bộ màu (cả màu chủ đạo tự chọn), kiểu nền + màu nền tự chọn (trừ ảnh), font, cỡ chữ lưu theo **tài khoản** (cột trong `user_settings`, [db.md](design/db.md#giao-diện--cột-trong-user_settings)) → 2 máy giống nhau · đồng thời lưu trên máy để mở app là đúng giao diện ngay, không nháy màu mặc định.
- Ảnh nền: chỉ lưu trên máy.
- Mất mạng: vẫn đổi được giao diện trên máy; có mạng lại → lưu lên tài khoản (ngoại lệ duy nhất của "khoá ghi khi mất mạng", vì chỉ là tuỳ chọn hiển thị).

## 9. Lịch Tháng rộng hơn

Bạn yêu cầu 2026-10-14: màn Lịch đã nhiều thứ, cần thêm chỗ cho event.

- Ô ngày ở chế độ **Tháng** cao hơn: hiện tối đa **5 thanh** event / todo (trước: 3) + "+N" khi còn nữa · ô cao theo số thanh tối đa, không co lại theo màn.
- 6 hàng tuần không còn vừa 1 màn → **cuộn dọc** trong tháng · hàng thứ (T2 … CN) dính ở đầu lưới khi cuộn.
- **Cuộn xuống** → đầu lịch thu gọn thành 1 dòng nhỏ (‹ Tháng 10, 2026 › chữ `heading`, nút "Hôm nay") · thanh chế độ ẩn · lưới chiếm phần còn lại · **cuộn lên** (hoặc chạm đầu lưới) → hiện lại đầy đủ.
- Vuốt ngang vẫn đổi tháng · đổi tháng → về đầu lưới, đầu lịch đầy đủ.
- Mở Lịch / bấm "Hôm nay" → cuộn tới tuần có hôm nay.
- Chỉ chế độ Tháng; Danh sách, Tuần, Ngày giữ như cũ.
- Cập nhật design-system: "Ô lịch tháng … tối đa 3 thanh" → 5 thanh.

## 10. Chi tiêu theo nhóm

Bạn yêu cầu 2026-10-14. Thêm pop-up khi bấm nhóm; chế độ Ngày giữ danh sách từng khoản chi như S4 (bạn chốt lại 2026-10-15).

- Mọi chế độ (Ngày, Tuần, Tháng): Tổng chi (+ ngân sách ở Tháng) · biểu đồ cột (Tuần: 7 ngày · Tháng: **theo ngày** + **6 tháng gần nhất**; **mỗi cột ghi số tiền** rút gọn "35k", "1,2tr" — Tháng có 31 cột nên số xoay dọc; bạn thêm 2026-10-15) · **danh sách nhóm** (icon · tên · số tiền · thanh % · %).
- **Ngày:** dưới danh sách nhóm vẫn có **danh sách từng khoản chi** của ngày (icon nhóm · tên nhóm · ghi chú · số tiền · bấm → form sửa) như S4. **Tuần, Tháng:** chỉ danh sách nhóm.
- **Bấm 1 nhóm** → pop-up có tiêu đề (✕ · icon + tên nhóm · `+`): kỳ đang xem ("Tháng 10, 2026") · tổng nhóm · danh sách khoản chi của nhóm trong kỳ, mới nhất trước, nhóm theo ngày (Tuần, Tháng có dòng ngày) · mỗi dòng **chỉ** ghi chú + số tiền (không lặp lại icon, tên nhóm đã ở tiêu đề; không ghi chú → "Không có ghi chú" màu `textMuted`) · khoản chi tự ghi có icon lặp sau ghi chú.
  - Bấm 1 khoản chi → form sửa (như S4) · lưu / xoá xong → về lại pop-up (xoá có Hoàn tác).
  - `+` → form thêm khoản chi, nhóm = nhóm này, ngày = hôm nay hoặc ngày đang xem.
  - Nhiều khoản → cuộn trong pop-up.
- Kỳ chưa có khoản chi: giữ màn trống của S4.

## 11. Nút + theo tab

Bạn yêu cầu 2026-10-15: đang ở tab nào thì tạo nhanh đúng thứ của tab đó, không phải qua pop-up 4 ô.

| Tab | Bấm `+` |
| --- | --- |
| Lịch, Cài đặt | Pop-up 4 ô như S5 (Sự kiện · Todo · Ghi chú · Khoản chi) |
| Chi tiêu | Mở thẳng form **Thêm khoản chi**: ngày = ngày đang xem (Ngày) hoặc hôm nay · nhóm = nhóm dùng gần nhất |
| Ghi chú › Ghi chú | Mở thẳng màn soạn **note mới** (danh mục = danh mục đang lọc, như S3) |
| Ghi chú › Todo | Mở thẳng form **Todo mới**: ngày = ngày đang chọn ở thanh tuần |

- Form tạo vẫn có tiêu đề "Todo ▾" đổi loại như S5 (Sự kiện · Todo · Ghi chú · Khoản chi) — mở từ tab nào cũng được.
- Mất mạng hoặc máy chủ sự cố: nút `+` khoá như mọi nút ghi ([§3](#mất-mạng-hoặc-máy-chủ-sự-cố)).
- Cập nhật Spec S4 (§ Màn hình: "nút + ở thanh tab → pop-up") và S5 (pop-up `+`): chỉ còn ở Lịch, Cài đặt.

## 12. Icon và nhóm gợi ý cho người Việt

Bạn yêu cầu 2026-10-15: nhiều icon của nhóm chi tiêu không liên quan thực tế; cần nhóm sát chi tiêu của người Việt.

- **Bộ icon 42** (thay 36 của S4, [mockup 21c](design/mockups.html): tên hiện dưới mỗi icon, cuộn trong pop-up Thêm nhóm): chung (thẻ tag) · cà phê, trà sữa, bia / nhậu, ăn uống, đi chợ · mua sắm, quần áo · nhà, điện, nước, gas, internet, điện thoại, sửa chữa · xe máy, xăng, xe buýt, taxi / Grab, gửi xe, du lịch · thuốc, khám bệnh, làm đẹp, thể thao · con nhỏ, thú cưng, học phí, sách · công việc, máy tính · trả góp (thẻ), tiền, bảo hiểm · quà tặng, lì xì, hiếu hỉ · xem phim, game, karaoke · rác, chung cư.
- **Bỏ khỏi danh sách chọn:** ly rượu, xe đạp, trái tim, ô, vé, máy ảnh, bóng, cây · nhóm đã lưu bằng các icon này (và `drop` cũ) vẫn hiện đúng, chỉ không chọn được cho nhóm mới. Tên icon nước đổi `drop` → `water` (`drop` giữ cho chu kỳ kinh nguyệt).
- **24 nhóm gợi ý** — khu "Gợi ý" ở màn Nhóm chi tiêu, dưới "Của bạn": Đi chợ · Trà sữa · Ăn nhậu · Tiền nhà · Điện · Nước · Internet · Điện thoại · Xăng xe · Gửi xe · Sửa xe · Học phí · Sức khoẻ · Thuốc · Làm đẹp · Quần áo · Hiếu hỉ · Lì xì · Quà tặng · Giải trí · Du lịch · Thú cưng · Bảo hiểm · Trả góp (mỗi gợi ý có icon + màu sẵn).
  - Chạm 1 gợi ý → thêm ngay thành nhóm tự tạo (toast "Đã thêm nhóm Đi chợ") · đổi tên, icon, màu sau như nhóm thường.
  - Đã có nhóm trùng tên (không phân biệt hoa thường) → gợi ý đó ẩn · đã đủ 30 nhóm → nút "Thêm nhóm" và gợi ý vẫn bấm được, bấm thì hiện hộp "Đã đủ 30 nhóm" ([mockup 21d](design/mockups.html)), không mở form, không thêm.
  - Tên gợi ý theo ngôn ngữ app lúc thêm (EN: Groceries · Bubble tea · Drinks · Rent · Electricity · Water · Internet · Phone · Fuel · Parking · Vehicle repair · Tuition · Health · Medicine · Beauty · Clothes · Weddings & funerals · Lucky money · Gifts · Entertainment · Travel · Pets · Insurance · Installments).
  - 3 nhóm có sẵn (Ăn uống, Di chuyển, Hoá đơn) giữ nguyên.
- Gợi ý là hằng số trong app (không cần bảng DB). Lưu vào `expense_categories` như nhóm tự tạo.

## Màn hình

```text
Mọi màn: banner mất mạng ở đầu (khi mất mạng)
Lịch Tháng: ô cao hơn (5 thanh), cuộn dọc, cuộn xuống → đầu thu gọn 1 dòng · thẻ lỗi / dòng "Chưa cập nhật được · Thử lại" · khung xương khi tải lần đầu
Ghi chú (Todo + Ghi chú): khung xương · thẻ lỗi
Chi tiêu (Ngày / Tuần / Tháng): Tổng chi · thanh ngân sách (Tháng) · biểu đồ (Tuần, Tháng) · danh sách nhóm (Ngày: thêm danh sách khoản chi) → pop-up khoản chi của nhóm (✕ · nhóm · +)
Hộp Ngân sách tháng: ô số tiền (để trống = bỏ ngân sách) · công tắc "Dùng cho mọi tháng" · Huỷ / Lưu
Màn Nhóm chi tiêu: dòng đầu "Khoản chi lặp lại ›"
Nút + ở thanh tab: Lịch, Cài đặt → pop-up 4 ô · Chi tiêu → form Thêm khoản chi · Ghi chú (Ghi chú / Todo) → note mới / Todo mới
Màn Nhóm chi tiêu: thêm khu "Gợi ý" (24 chip, chạm là thêm) · hộp Thêm nhóm: 42 icon kèm tên, cuộn trong pop-up · hộp "Đã đủ 30 nhóm"
Form khoản chi (tạo mới): thêm dòng "Lặp lại"
Màn Khoản chi lặp lại: danh sách quy tắc → form sửa quy tắc (Xoá)
Toast: "Đã xoá · Hoàn tác" · lỗi theo loại
Cài đặt: nhóm "Giao diện" (đầu) → màn Giao diện: xem trước · Chủ đề màu (8 + Theo hệ thống + Tự chọn → hộp chọn màu + Sáng / Tối) · Nền (Trơn / Màu: 8 + Màu khác / Chuyển màu: 8 / Hoạ tiết: 6 / Ảnh của bạn + độ mờ) · Font (6) · Cỡ chữ (Nhỏ / Vừa / Lớn)
```

- Mọi chữ qua i18n (VI + EN), lời lẽ theo [design-system § Câu chữ](../design-system.md).

## Thiết kế

- [DB](design/db.md): cột `monthly_budget` trong `user_settings`, bảng `expense_month_budgets`, bảng `expense_recurrences`, cột `recurrence_id` trong `expenses`, hàm ghi khoản chi tới hạn, cột giao diện trong `user_settings`, test tải.
- [Mockup S6](design/mockups.html) — 47 màn (10 màn mới: nút + theo tab, nhóm gợi ý, 42 icon, đủ 30 nhóm · máy chủ sự cố): mất mạng (Lịch, form), lỗi tải, dữ liệu cũ, khung xương, Hoàn tác, Chi tiêu theo nhóm + pop-up nhóm, ngân sách (đủ / vượt / chưa đặt / hộp mọi tháng / chỉ tháng này), khoản chi lặp (form, chọn kiểu, màn Nhóm, danh sách, sửa, xoá), Lịch Tháng ô cao (+ đã cuộn), Cài đặt, màn Giao diện (+ tự chọn màu, ảnh nền), bộ Tối, Hồng đào + nền chuyển màu, Xanh biển + ảnh + Quicksand, Oải hương + Itim, tự chọn #FF7A59, hoạ tiết (Bạc hà chấm bi · Vàng chanh kẻ ô + Baloo 2 · Tối sao + Patrick Hand) · nút ở đầu trang đổi bộ màu / font cho mọi màn.

## Xong khi (DoD)

- [ ] Lưu form không tải lại; Xoá, tick hiện ngay · số đo trước / sau (a), (b), (c) ghi trong wip, (b) và (c) nhanh hơn ≥ 30%.
- [ ] Tải event, todo 1 lượt gọi · hàm đặt dòng đã lưu vào dữ liệu trên máy có test.
- [ ] Bật chế độ máy bay: banner hiện ở mọi màn, mọi nút ghi bị khoá, vẫn xem dữ liệu đã lưu · tắt chế độ máy bay → banner ẩn, dữ liệu tự tải lại.
- [ ] Giả lập server chậm / sai địa chỉ Supabase: sau ≤ 15 s hiện banner "Máy chủ đang gặp sự cố.", không treo · vẫn xem được dữ liệu đã lưu trên máy, nút tạo / sửa / xoá bị khoá · hết sự cố → banner ẩn, nút mở khoá · máy chưa có dữ liệu → thẻ lỗi + Thử lại.
- [ ] Rung nhẹ, khung xương thấy trên máy thật.
- [ ] Hoàn tác: xoá event (cả event đồng bộ Google), todo, khoản chi → Hoàn tác → còn nguyên, Google không bị xoá · không Hoàn tác → xoá thật sau 4 s · ra nền trong 4 s → vẫn xoá.
- [ ] Ngân sách: đặt / sửa / bỏ chung và riêng 1 tháng (tháng riêng ghi đè, tháng khác dùng chung) · thanh đúng màu theo % · 2 máy thấy cùng ngân sách.
- [ ] Khoản chi lặp: tạo hằng tuần / hằng tháng (cả ngày 31) · tự ghi khi mở tab, ghi bù kỳ đã qua · 2 máy cùng mở không ghi trùng · sửa / xoá quy tắc không đổi khoản chi đã ghi · xoá khoản chi tự ghi không bị ghi lại.
- [ ] Giao diện: đổi bộ màu (cả Tối, Theo hệ thống, Tự chọn với màu rất nhạt / rất đậm vẫn đọc được chữ), nền màu tự chọn, nền (chuyển màu, ảnh + độ mờ), font, cỡ chữ → áp dụng ngay mọi màn, không màn nào còn màu / font cũ · mở lại app đúng giao diện, không nháy · máy thứ 2 nhận cùng giao diện (trừ ảnh).
- [ ] Nút `+`: tab Chi tiêu mở thẳng Thêm khoản chi · Ghi chú › Ghi chú mở note mới · Ghi chú › Todo mở Todo mới · Lịch, Cài đặt vẫn pop-up 4 ô.
- [ ] Nhóm gợi ý: chạm → thêm đúng icon, màu · trùng tên thì ẩn · đủ 30 nhóm → hộp báo · bộ 42 icon hiện đủ, nhóm cũ dùng icon đã bỏ vẫn hiện đúng.
- [ ] Chi tiêu: mọi chế độ có danh sách nhóm (Ngày thêm danh sách khoản chi bên dưới, Tuần / Tháng không) · bấm nhóm → pop-up đúng khoản chi của nhóm trong kỳ · sửa / xoá / thêm từ pop-up rồi về lại pop-up.
- [ ] Lịch Tháng: ô 5 thanh + "+N" · cuộn dọc mượt trên máy thật · cuộn xuống thu gọn đầu, cuộn lên hiện lại · vuốt ngang đổi tháng vẫn đúng · mở Lịch cuộn tới tuần hôm nay.
- [ ] Hàm thuần mới có test: phân loại lỗi, ngân sách của tháng, ngày tới hạn khoản chi lặp, tương phản bộ màu, tính bộ màu tự chọn.
- [ ] Test RLS cho bảng / cột mới · test tải đạt (0 lỗi, p95 < 1 s).
- [ ] `npm run typecheck && npm run lint && npm test` qua.
- [ ] Cuối sprint: release theo [Spec tổng §4](../index.md#cuối-sprint-mọi-sprint).

## Đã chốt (2026-10-14)

1. **Lưu form chờ server** ghi xong rồi mới đóng (~1 lượt gọi, không tải lại) · lỗi → giữ form · giữ hộp "Đã thay đổi ở thiết bị khác".
2. **Bỏ hộp xác nhận xoá** event, todo, khoản chi — dùng Hoàn tác 4 s · event / todo lặp vẫn có hộp "Chỉ lần này / Tất cả".
3. **Ngân sách: chung cho mọi tháng hoặc riêng 1 tháng** (bạn đổi 2026-10-14; ban đầu chỉ 1 số chung) · theo nhóm để sau.
4. **Khoản chi lặp: hằng tuần + hằng tháng** · hằng năm để sau.
5. **Giao diện gộp vào S6** (bạn chọn): đổi quyết định cũ "không làm theme" ([Spec tổng §1](../index.md#1-sản-phẩm), [design-system](../design-system.md)) · làm luôn chế độ tối.
6. **Bỏ tìm kiếm event + todo** (bạn chốt 2026-10-14): màn Lịch đã đủ nhiều thứ, không thêm nút 🔍.
7. **Màn Khoản chi lặp lại mở từ màn Nhóm chi tiêu** (bạn chốt 2026-10-14): không thêm icon ở đầu Chi tiêu.
8. **Tự chọn màu chủ đạo + nền** (bạn chốt 2026-10-14): 1 màu chủ đạo bất kỳ + Sáng / Tối, app tự tính các màu còn lại · nền thêm "Màu khác" · không sửa riêng từng màu.
9. **Lịch Tháng rộng hơn** (bạn chốt 2026-10-14): ô ngày cao hơn (5 thanh) + cuộn dọc + cuộn xuống thu gọn đầu lịch.
10. **Chi tiêu theo nhóm** (bạn chốt 2026-10-14): mọi chế độ có danh sách nhóm, bấm nhóm → pop-up khoản chi · giữ biểu đồ ở Tuần, Tháng. · 2026-10-15: chế độ Ngày giữ danh sách khoản chi bên dưới như S4.
11. **Không báo khi sắp vượt ngân sách** (bạn chốt 2026-10-14): người dùng tự thấy trên thanh tiến độ.
12. **Không có nút "Bỏ ngân sách"** (bạn chốt 2026-10-14): xoá trống số tiền rồi Lưu là bỏ.
13. **Thêm nền + font** (bạn chốt 2026-10-14, giữ phần còn lại như cũ): 8 màu nền có sẵn, 8 chuyển màu, 6 hoạ tiết tự vẽ · thêm font Baloo 2, Patrick Hand (6 font) · không thêm sticker, hiệu ứng, chủ đề trọn gói.
14. **Mất mạng / máy chủ sự cố: vẫn hiện dữ liệu trên máy, chỉ khoá nút ghi** (bạn chốt 2026-10-15).
15. **Nút + mở thẳng form của tab** (Chi tiêu, Ghi chú › Ghi chú, Ghi chú › Todo) · Lịch, Cài đặt giữ pop-up 4 ô (bạn chốt 2026-10-15).
16. **Bộ icon 42 + 24 nhóm gợi ý cho người Việt** (bạn chốt 2026-10-15) · 3 nhóm có sẵn giữ nguyên.
