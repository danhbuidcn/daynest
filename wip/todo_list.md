# Todo

## 2026-10-09 — S2 spec: 1 account tối đa 2 thiết bị — ⏳ chờ duyệt

**Bạn chốt:** đăng nhập trên máy thứ 3 → tự đăng xuất máy **đăng nhập sớm nhất**, có thông báo.

**Đề xuất cách làm:**

| Việc | Cách làm |
| --- | --- |
| Nhận diện máy | Mỗi lần cài app sinh 1 `device_id` (uuid) lưu trên máy + tên máy (vd "Samsung SM-A556E") |
| Ghi máy lúc đăng nhập | Bảng `user_devices` (`user_id`, `device_id`, `device_name`, `session_id`, `signed_in_at`, `last_seen_at`) · đăng nhập xong gọi hàm DB `register_device()` |
| Đá máy cũ | `register_device()` (chạy quyền DB, trong 1 transaction có khoá theo user → 2 máy đăng nhập cùng lúc vẫn đúng) : quá 2 máy → xoá máy `signed_in_at` sớm nhất + xoá phiên Supabase của máy đó (`auth.sessions`) |
| Máy bị đá dừng ngay | RLS mọi bảng thêm điều kiện: phiên hiện tại (`session_id` trong token) phải còn trong `user_devices` → máy cũ gọi API là bị từ chối, không đợi token hết hạn |
| Thông báo máy bị đá | Lần gọi API kế tiếp (mở app, về foreground, lưu…) bị từ chối → app đăng xuất, hiện hộp "Bạn đã bị đăng xuất vì tài khoản vừa đăng nhập trên thiết bị khác (tối đa 2 thiết bị)." |
| Thông báo máy mới | Hộp ngay sau đăng nhập: "Đã đăng xuất <tên máy cũ>" · "Mỗi tài khoản đăng nhập tối đa 2 thiết bị. <Tên máy cũ> (đăng nhập 01/10) đã bị đăng xuất." · nút **Đã hiểu** |
| Màn xem thiết bị (bạn yêu cầu thêm màn) | Cài đặt → Tài khoản → **Thiết bị đăng nhập** (`settings/devices`): 2 dòng (tên máy · "Đăng nhập 01/10 · Dùng lần cuối hôm nay" · nhãn "Máy này") + chú thích "Tối đa 2 thiết bị. Đăng nhập máy thứ 3 sẽ đăng xuất máy đăng nhập sớm nhất." |
| Tự đăng xuất | Xoá dòng của máy mình trong `user_devices` |
| Đăng nhập lại trên cùng máy | Cùng `device_id` → cập nhật dòng cũ, không tính thêm máy |

- Hạn chế: không có server push → máy bị đá chỉ biết khi app mở/gọi API, không báo lúc app đang đóng.
- Thêm cuối danh sách §6 "Trước khi lên Google Play": không đổi.

**Plan:**

- [ ] 1. Viết `docs/specs/sprint-2/F7-gioi-han-thiet-bi.md` (mục tiêu, logic như bảng trên, luồng, mô tả, test) + thêm dòng F7 vào `sprint-2/index.md` (phạm vi, luồng, DoD: "đăng nhập máy thứ 3 → máy sớm nhất bị đăng xuất, thấy hộp thông báo; máy mới thấy toast").
- [ ] 2. `design/db.md`: bảng `user_devices`, hàm `register_device()`, điều kiện RLS mới cho mọi bảng; `rls_s2.sql` thêm test máy bị đá không đọc/ghi được.
- [ ] 3. `design/screens.md` + `mockups.html`: màn 23 hộp "Bạn đã bị đăng xuất…" (máy cũ, trên màn Đăng nhập) · màn 24 hộp "Đã đăng xuất <máy cũ>" (máy mới) · màn 25 "Thiết bị đăng nhập" · Cài đặt thêm dòng "Thiết bị đăng nhập" (nhóm Tài khoản).
- [ ] 4. `docs/specs/index.md` §2: thêm dòng "Thiết bị: 1 account tối đa 2 thiết bị".
- [ ] 5. Kiểm tra link + chụp mockup. Commit `docs: limit two devices per account`, push.

## 2026-10-09 — Sửa 2 câu chữ khó hiểu (đồng bộ Google) — ✅ xong

| Chỗ | Cũ | Mới |
| --- | --- | --- |
| Hộp "Tắt đồng bộ?" (màn 21c) | Sự kiện ở 2 bên vẫn giữ nguyên, sau đó không còn cập nhật cho nhau. | Sự kiện đã có vẫn còn ở cả Daynest và Google. Từ giờ, sửa ở bên này sẽ không đổi bên kia. |
| Hộp đang đồng bộ (màn 22) | Kéo sự kiện năm 2026 và đẩy sự kiện Daynest lên lịch chính. | Đang lấy sự kiện năm 2026 từ Google về Daynest, và gửi sự kiện của Daynest lên Google. |

- [x] Sửa trong `F6-cai-dat.md` (dòng hộp xác nhận), `F4-google-calendar.md` (thêm câu cho hộp tiến độ), `mockups.html` (màn 21c, 22).
- [x] Commit `docs: simplify google sync texts`, push.

## 2026-10-09 — S2 spec: giới hạn ký tự mọi field + cách hiển thị chữ dài — ✅ xong

Bạn yêu cầu: field nào cũng có giới hạn ký tự; chữ dài hiện hết hoặc 1 phần để không vỡ giao diện.

**Giới hạn (nhập trong app):**

| Field | Giới hạn | Đã có trong spec? |
| --- | --- | --- |
| Tên hiển thị (S1) | 1–50 | Có |
| Tiêu đề event | 1–100 | Có |
| Chi tiết event | ≤ 2000 | Có |
| Tiêu đề note | ≤ 200 | Có |
| Nội dung note | ≤ 20.000 | Có |
| Mục checklist | ≤ 200 / mục, ≤ 100 mục | Có |
| Tên danh mục | 1–30 | Có |
| Ô tìm kiếm note | ≤ 100 | **Mới** |
| Số N lặp | 1–99 | Có |

- Ô nhập dùng `maxLength` (dán chữ dài → tự cắt). Gõ tới ≥ 80% giới hạn → hiện bộ đếm "85/100" dưới ô; chạm giới hạn → đếm màu `error`.
- Cắt khoảng trắng 2 đầu trước khi lưu; chỉ toàn khoảng trắng = trống.
- DB `check` cùng giới hạn để chặn ghi sai từ API.
- **Event từ Google** (không theo giới hạn của app): DB cho tiêu đề ≤ 1000, chi tiết ≤ 8000 (đủ cho gần như mọi event Google); dài hơn → cắt lúc kéo về và đánh dấu chỉ xem (không đẩy bản cắt ngược lên Google). Sửa event Google có tiêu đề > 100 trong app → phải rút gọn ≤ 100 mới lưu được (báo lỗi dưới ô).

**Hiển thị chữ dài:**

| Chỗ hiện | Cách hiện |
| --- | --- |
| Thanh event (ô tháng), tên lễ trong ô | 1 dòng, `…` |
| Thẻ event (tuần, danh sách, pop-up ngày) | Tiêu đề 1 dòng `…` · chi tiết 1 dòng `…` |
| Khối event (xem ngày) | Tiêu đề xuống dòng vừa chiều cao khối, dư thì `…` |
| Chi tiết event, editor note | **Hiện hết**, xuống dòng, cuộn màn |
| Ô tiêu đề trong form event | Tự giãn tối đa 3 dòng, quá thì cuộn trong ô |
| Ô chi tiết event | Tự giãn tối đa 6 dòng, quá thì cuộn trong ô |
| Thẻ note | Tiêu đề 1 dòng `…` · nội dung 3 dòng `…` |
| Mục checklist (editor) | Hiện hết, xuống dòng |
| Chip danh mục, tên danh mục trong dòng | 1 dòng `…`, chip rộng tối đa 140 |
| Tên trong hộp xác nhận (vd "Xoá danh mục …?") | Tối đa 2 dòng `…` |
| Thông báo nhắc (hệ điều hành) | Tiêu đề event cắt 1 dòng do hệ điều hành |
| Toast | Tối đa 2 dòng |

- Chữ không có khoảng trắng (URL, chuỗi dài) cũng phải xuống dòng/cắt, không tràn ngang.

**Plan:**

- [x] 1. `design-system.md`: thêm mục "Chữ dài" (quy tắc chung: 1 dòng `…`, N dòng, hiện hết + cuộn; bộ đếm ký tự; không tràn ngang).
- [x] 2. `sprint-2/design/screens.md`: thêm bảng "Giới hạn ký tự + hiển thị" (2 bảng trên), F2/F5 trỏ tới bảng này thay vì ghi rải rác (bỏ lặp).
- [x] 3. `design/db.md` + `F4-google-calendar.md`: giới hạn DB cho event Google (≤ 1000 / ≤ 8000), cắt + chỉ xem khi dài hơn.
- [x] 4. `mockups.html`: thêm 1 màn "Chữ dài" — ô tháng + thẻ event + thẻ note + chip danh mục với chữ dài, và ô tiêu đề có bộ đếm "92/100".
- [x] 5. Kiểm tra: chụp mockup, không tràn; không link hỏng. Commit `docs: add field limits and long text rules`, push.

## 2026-10-09 — Mockup màn 18, 19: xoá danh mục qua menu ⋯ — ✅ xong

Bạn chốt: màn 18 có `⋯` góc trên phải để chọn xoá; màn 19 bỏ icon xoá.

- [x] `mockups.html`:
  - màn 18: thêm `⋯` góc trên phải → menu "Chọn để xoá"; dòng danh mục không có icon xoá (giữ icon bút);
  - màn 18b (chế độ chọn): mỗi dòng có ô tick tròn bên trái · thanh trên: ✕ thoát · "Đã chọn 2" · nút đáy **Xoá (2)** màu `error`;
  - màn 18c: hộp xác nhận "Xoá 2 danh mục? 3 ghi chú sẽ về Chưa phân loại." · Huỷ / Xoá;
  - màn 19: bỏ nút 🗑, còn Huỷ / Lưu.
  - đổi chữ "Không danh mục" → **"Chưa phân loại"** ở mọi chỗ (chú thích màn 18, `F5-notes.md` dòng 35 + 75).
- [x] `F5-notes.md` (mục Danh mục) + `design/screens.md` (màn 18, 18b, 18c, 19): ghi theo trên.
- [x] Commit `docs: delete categories via select mode`, push.

## 2026-10-09 — Quy trình release: đính kèm APK vào GitHub Release — ✅ xong

Tag chỉ có source code → thêm bước tạo GitHub Release kèm APK (không kèm `.aab`). Dùng `gh` CLI.

- [x] 0. **Bạn làm** (cần sudo + đăng nhập trình duyệt): `sudo apt install gh` → `gh auth login` (GitHub.com, SSH).
- [x] 1. `docs/specs/index.md` §4 "Cuối sprint": thêm bước 7 — `gh release create v<version> app/dist/daynest-<version>-<versionCode>.apk --title v<version> --notes "<tóm tắt>"` · chỉ APK, không `.aab`.
- [x] 2. `CLAUDE.md` (project): thêm "→ GitHub Release kèm APK (`gh release create`)" vào cuối dòng quy trình release.
- [x] 3. Bổ sung release v1.0.1: chạy lệnh ở bước 1 với `daynest-1.0.1-2.apk` (bỏ qua nếu bạn đã tạo tay trên web).
- [x] 4. Kiểm tra: `gh release view v1.0.1` có asset `.apk`.
- [x] 5. Commit `docs: attach apk to github release` (chỉ `CLAUDE.md`), push. Phần `docs/specs/index.md` đang có sửa đổi S2 chưa commit → đi chung commit spec S2 (bước 1 todo S2 bên dưới), không tách hunk.

## 2026-10-09 — S2 bước 2: thiết kế (design system bổ sung + mockup) — ✅ xong

**Input:** spec S2 đã ok (`docs/specs/sprint-2/`), danh sách màn ở `design/screens.md` (23 màn), design system S1. Cùng cách làm mockup S1.

- [x] 1. Commit spec S2 trước (tách khỏi mockup): `docs: add sprint-2 spec` (`docs/specs/sprint-2/`, `docs/specs/index.md`, `docs/index.md`, `wip/todo_list.md`) kèm Co-Authored-By, push.
- [x] 2. `docs/specs/design-system.md` — thêm thành phần mới (chỉ token có sẵn, không thêm màu/cỡ chữ):
  - ô lịch tháng (số dương, ngày âm, tên lễ, thanh event, "+N", hôm nay, ngày tháng khác, CN/lễ);
  - thanh event (tháng) + thẻ event (tuần/danh sách/sheet ngày) + khối event (xem ngày);
  - thanh chọn chế độ (segmented: Tháng · Danh sách · Tuần · Ngày — giống Cute);
  - sheet từ đáy (có Huỷ bỏ / tiêu đề / Hoàn tất);
  - công tắc + dòng cài đặt có công tắc;
  - chip danh mục, thẻ note, dòng checklist;
  - icon nhỏ trạng thái event: lặp · nhắc · Google · chờ đồng bộ · chỉ trên Daynest.
- [x] 3. Vẽ `docs/specs/sprint-2/design/mockups.html` — 1 file, khung điện thoại 360×780, chữ tiếng Việt, mở bằng trình duyệt; chia 4 nhóm:
  - **Lịch:** màn 1–7 (tháng có ngày âm + lễ + event mẫu; tuần; ngày; danh sách; chọn chế độ; chọn tháng/năm; sheet ngày);
  - **Event:** màn 8–15 (sheet `+`, form tạo, chọn lặp có "Hằng năm (âm lịch)", sheet mốc nhắc, mẹo pin, chi tiết, hỏi lần lặp, xung đột);
  - **Notes:** màn 16–20 (danh sách, editor có checklist, danh mục, sửa danh mục, thùng rác);
  - **Cài đặt:** màn 21–22 (Cài đặt có nhóm Thông báo / Lịch / Google Calendar ở cả trạng thái tắt và bật; tiến độ đồng bộ).
  - Màn 12 (picker ngày/giờ hệ điều hành): không vẽ.
- [x] 4. `design/screens.md` + `sprint-2/index.md`: thêm link mockup, bỏ chữ "bước 2 (chưa làm)"; `F6-cai-dat.md`: bỏ ghi chú "thêm vào design-system ở bước 2".
- [x] 5. Kiểm tra: mở `mockups.html` (chụp màn bằng trình duyệt headless) — đủ màn, không vỡ bố cục; chỉ dùng token trong design system; không link hỏng.
- [x] Góp ý của bạn (đã sửa): màn 7, 8 → pop-up giữa màn như màn 6; bỏ chữ "(ngày giỗ)" trong dòng gợi ý lặp âm.
- [x] 6. Gửi bạn xem. Góp ý thì sửa; ok thì commit `docs: add sprint-2 mockups` (1 dòng, không body, không Co-Authored-By), push → sang bước code (todo riêng, chia nhiều bước nhỏ).

## 2026-10-09 — S2 spec: mục Nhắc nhở trong form event giống hệt Cute Calendar — ✅ xong

~~Thêm cài đặt "Nhắc mặc định" 5/10/15 phút~~ — đã bỏ (hiểu sai: bạn muốn chọn mốc nhắc ngay trong event).

Spec hiện có: chọn mốc trong form (Đúng giờ · 5 · 10 · 15 · 30 phút · 1 giờ · 1 ngày trước), mặc định 15 phút. Còn thiếu so với [Cute 12](../docs/research/cute-calendar/screenshots/12-create-event-more.png), [14](../docs/research/cute-calendar/screenshots/14-event-add-reminder.png):

- [x] `F3-nhac-nho.md` + `F2-event.md`: thêm công tắc **"Cài đặt nhắc nhở"** đầu mục (bật = có nhắc, hiện danh sách mốc; tắt = không nhắc, ẩn danh sách) · mỗi mốc 1 dòng icon đồng hồ + "15 phút trước" + ✕ · "+ Thêm nhắc nhở" mở sheet từ đáy: Huỷ bỏ · "Chọn nhắc nhở lúc" · Hoàn tất, danh sách mốc có ✓.
- [x] `design/screens.md` màn 11: đổi "Hộp chọn" → sheet từ đáy như trên.
- [x] Khảo sát Cute trên máy thật (bạn cho phép, không lưu gì): danh sách mốc = Đúng giờ · 5 · 10 · 30 phút · 1 · 2 giờ · 1 · 2 ngày · 1 tuần trước (cả ngày dùng chung); mặc định 15 phút (không có trong danh sách); icon `!` = mẹo tắt tối ưu pin + nút Loại trừ → đã cập nhật F3 + thêm màn 11b.

## 2026-10-09 — S2 bước 1: viết spec Sprint 2 + sắp lại danh sách sprint — ✅ xong (bạn đã ok)

### Input

- Bạn chốt: S2 = **Lịch, Event, Notes, Cài đặt thông báo**, giống Cute Calendar.
- Bạn chốt: **mỗi tính năng làm trọn trong 1 sprint**, không chia nhiều sprint. "Trọn" = toàn bộ phạm vi GĐ1 đã chốt; mục "Sau / Không làm" giữ nguyên ngoài.
- Bạn chốt: kéo Google Calendar là một phần của Lịch → làm ở S2.
- Bạn chốt (đổi): **bật đồng bộ → Daynest ↔ Google 2 chiều**; tắt → 2 bên độc lập. Thay quyết định cũ "kéo 1 chiều" (§2 Spec tổng). Chi tiết đã chốt: lịch chính · bật → đẩy hết event có sẵn · tắt → giữ event Google thành event thường · lặp âm không đẩy · thêm lựa chọn "Hằng năm (âm lịch)" cho ngày giỗ (bỏ lặp tháng âm). Xem `F4-google-calendar.md`.
- Cài đặt: công tắc **Cho phép thông báo**; event chỉ nhắc khi công tắc bật.
- Bạn chốt: app sẽ **lên Google Play** → thiết kế code mở rộng được, **nhiều user dùng đồng thời không lỗi** (bỏ "GĐ1 dùng 1 user").

### Output

- `docs/specs/sprint-2/` đủ spec + thiết kế màn hình/DB để code. Mockup để bước 2.
- Bảng sprint §4 trong `docs/specs/index.md` sắp lại theo nguyên tắc "1 tính năng = 1 sprint".

### Context

Phạm vi S2 (gom S2–S6, S8 cũ + phần cài đặt liên quan của S9):

| Phần | Làm | Không làm (đã chốt Sau / Không làm) |
| --- | --- | --- |
| Lịch | Xem tháng (lưới 6 tuần, ngày âm, ngày lễ, thanh màu event) / tuần / ngày / danh sách · bấm ngày → sheet event + `+` · nút Hôm nay · vuốt đổi tháng | Thời tiết, sticker, theme, tìm kiếm event |
| Event | Tiêu đề, chi tiết, cả ngày / giờ, 6 màu · lặp dương ngày/tuần/tháng/năm, mỗi N, ngày kết thúc · lặp âm (ngày giỗ) · sửa/xoá lần lặp "Chỉ lần này" / "Tất cả" · xoá hỏi xác nhận | Vị trí, URL, đếm ngược, báo thức, sao chép |
| Nhắc | Nhiều mốc (0, 5, 15, 30, 60 phút, 1 ngày) · local notification · đặt cho 30 ngày tới, < 60 thông báo chờ | Âm thanh/rung tuỳ chỉnh |
| Google Calendar | Kéo 1 chiều (`calendar.readonly`) · `syncToken` · 410 kéo lại · event Google chỉ đọc, không nhắc | Đẩy lên Google |
| Notes | Tiêu đề, nội dung text, checklist, danh mục (màu), ghim, tìm kiếm · Back tự lưu · thùng rác | Định dạng chữ, ảnh, ghi âm, vẽ, khoá, PDF |
| Nút `+` | Sheet: Event / Note | Todo, Diary (sprint của nó) |
| Cài đặt | Cho phép thông báo (tắt → huỷ hết nhắc, bật → đặt lại, xin quyền Android) · tuần bắt đầu từ · 24 giờ · bật/tắt ngày âm, ngày lễ · Google Calendar: kết nối, chọn lịch, Đồng bộ ngay | Giờ nhắc tổng hằng ngày |

Giá trị mặc định đề xuất: tuần bắt đầu **Thứ Hai**, **24 giờ** bật, ngày âm + ngày lễ bật, thông báo bật.

Danh sách sprint mới (GĐ1 = S1–S4):

| Sprint | Chức năng |
| --- | --- |
| S1 | Nền móng (đã xong) |
| S2 | Lịch + Event + Nhắc + Google Calendar + Notes + Cài đặt liên quan |
| S3 | Todo (tiêu đề, hạn, ghim, subtask, %, lọc) |
| S4 | Diary (+ nhắc diary hằng ngày) + Thống kê → xong GĐ1 |

Nhiều user + mở rộng (S1 đã có `user_id` + RLS; S2 áp cho mọi bảng mới):

| Vấn đề | Cách làm đề xuất |
| --- | --- |
| Lộ dữ liệu giữa user | Mọi bảng: RLS `user_id = auth.uid()` · test RLS từng bảng (như `rls_s1.sql`) |
| Chậm khi dữ liệu nhiều | Index `(user_id, …)` theo cách truy vấn · chỉ tải theo khoảng ngày đang xem · Notes phân trang |
| Event lặp phình DB | Lưu 1 dòng quy tắc lặp + ngoại lệ · app tự trải ra các lần (hàm thuần, có test) |
| Bấm Lưu 2 lần / mạng chập chờn tạo trùng | App tự sinh `id` (uuid) trước khi gửi → gửi lại không tạo dòng mới |
| 1 user sửa cùng lúc trên 2 máy | Lưu kèm `updated_at` đã đọc; nếu dòng đã đổi ở máy khác → báo "Đã thay đổi ở thiết bị khác", tải lại · không ghi đè im lặng |
| 2 máy cùng kéo Google | Upsert theo khoá duy nhất `(user_id, google_event_id)` → không trùng event |
| Múi giờ | Event có giờ lưu `timestamptz`; cả ngày lưu `date`; ngày âm tính theo +7 |
| Không có server riêng | App gọi thẳng Supabase (đã chốt) → tải do Supabase lo |
| Code dễ mở rộng | Mỗi tính năng `features/<x>/`: `api` (gọi Supabase) tách khỏi UI · logic thuần ở `lib/` có test · không trạng thái dùng chung giữa user |

Mục tiêu tải (bạn chốt): **100 user dùng cùng lúc, tổng ~10.000 user**.

| Hạng mục | Ước tính | Gói Free Supabase | Kết luận |
| --- | --- | --- | --- |
| User đăng nhập/tháng | ≤ 10.000 | 50.000 MAU | Đủ |
| Request cùng lúc | 100 user × ~1 req/s lúc cao điểm ≈ 100 req/s | Chịu được nếu truy vấn có index, tải theo khoảng ngày | Đủ |
| Dung lượng DB | ~10–50 KB/user (event, note) → 100–500 MB; event Google có thể nhiều hơn | 500 MB | **Sát giới hạn** |
| Storage ảnh | Avatar nén ~50 KB × 10.000 ≈ 500 MB | 1 GB | Đủ nếu nén |
| Project bỏ không 7 ngày | — | Free bị tạm dừng | Ổn — bạn dùng app hằng ngày |

Quyết định đề xuất:

- Bạn chốt: **dùng gói Free**, kể cả khi lên Play. Bạn dùng app mỗi ngày → project không bị tạm dừng. Theo dõi dung lượng DB; gần 500 MB thì tính lại.
- Bạn chốt: chỉ kéo event Google trong **năm hiện tại** (1/1 → 31/12) để giới hạn số dòng.
- Avatar nén trước khi tải lên (≤ 512 px, JPEG).
- Mỗi bảng có index theo cách truy vấn; viết sẵn query mẫu + `explain` trong `design/db.md`.
- DoD S2 thêm: **test tải** — script giả 100 user đăng nhập + đọc lịch tháng + ghi event đồng thời, không lỗi, p95 < 1 s. Seed 10.000 user giả trên DB local để đo, không chạy trên DB thật.

Ghi riêng mục "Trước khi lên Google Play" (chưa làm ở S2): xoá tài khoản trong app (Play bắt buộc), chính sách quyền riêng tư, khai báo Data safety, Google xác minh OAuth cho scope `calendar.readonly`.

Rủi ro: S2 rất lớn (≈ 5 sprint cũ). Code sẽ chia nhiều bước nhỏ, mỗi bước 1 todo riêng, chạy được trên máy thật sau mỗi bước.

### Plan

- [x] 1. Tạo `docs/specs/sprint-2/index.md`: mục tiêu, bảng phạm vi F1–F6, luồng tổng, "Bạn chuẩn bị" (bật Google Calendar API + scope `calendar.readonly` ở OAuth consent), DoD.
- [x] 2. Viết 6 file chức năng (mục tiêu, logic, luồng, mô tả — như S1):
  - `F1-lich.md` — 4 chế độ xem, lịch âm (Hồ Ngọc Đức, +7), ngày lễ cố định, test Tết 2020–2030 + năm nhuận.
  - `F2-event.md` — form, lặp dương + âm, ngoại lệ.
  - `F3-nhac-nho.md` — mốc nhắc, lịch đặt thông báo, công tắc Cho phép thông báo.
  - `F4-google-calendar.md` — kết nối, chọn lịch, đồng bộ.
  - `F5-notes.md` — danh sách, editor, danh mục, thùng rác, tìm kiếm.
  - `F6-cai-dat.md` — các mục cài đặt mới + giá trị mặc định.
- [x] 3. Viết `design/screens.md` (danh sách màn) + `design/db.md` (bảng `events`, `event_exceptions`, `event_reminders`, `google_sync_state`, `notes`, `note_categories`, cột mới `user_settings`, RLS).
- [x] 4. `docs/specs/index.md`: §1 "GĐ1 = sprint 1–4"; §2 dòng "Người dùng" → nhiều user thật; §3 thêm "Nguyên tắc mở rộng" + "Mục tiêu tải" (2 bảng trên) + mục "Trước khi lên Google Play"; §4 thay bảng sprint; chuyển các "ghi chú đã chốt" S2–S6, S8 vào file F tương ứng (xoá khỏi index, không lặp); sửa ghi chú S7 → S3, S9 → S4.
- [x] 5. `docs/index.md`: thêm dòng Sprint 2.
- [x] 6. Kiểm tra: link giữa các file chạy đúng, không lặp nội dung giữa index và F. Không commit — chờ bạn review spec.

Khác plan (do đổi sang đồng bộ 2 chiều / đơn giản hơn): scope `calendar.events` thay `calendar.readonly`; F4 chỉ lịch chính, không "chọn lịch"; không có bảng `event_reminders` (dùng cột `events.reminder_minutes`).

Bước sau (todo riêng, chưa làm): bước 2 mockup → bước 3+ code theo từng phần.

## 2026-10-09 — Quy trình release: bắt buộc tag GitHub — ✅ xong

- [x] "Cuối sprint" bước 6 + `CLAUDE.md`: ghi rõ `git tag v<version> && git push origin main v<version>` mỗi lần release. Release S1 gắn tag `v1.0.1`.

## 2026-10-09 — Sửa chữ bị cắt trên Samsung (nút "Đăng xuất", "Tiếng Việt") — ✅ xong

- **Nguyên nhân:** Samsung đo chiều rộng chữ font Nunito thiếu. Từ cuối bị đẩy xuống dòng 2 rồi bị che. Cỡ chữ hệ thống = 1.0, không phải do cài đặt máy.
- [x] `AppText`: mặc định `textBreakStrategy="simple"` trên Android (cách sửa phổ biến cho lỗi này).
- [x] Chữ chỉ được 1 dòng thì đặt `numberOfLines={1}`: nhãn nút (`Button`), giá trị bên phải dòng cài đặt (`SettingRow`).
- [x] Kiểm tra trên điện thoại thật: hộp Đăng xuất, dòng Ngôn ngữ (VI + EN), nút Lưu. Gộp vào bản build 1.0.1 đang test; commit `fix(app): text clipped on samsung` rồi push.

## 2026-10-09 — Cho phép comment code có chọn lọc (tiếng Anh) — ✅ xong (chưa commit)

Đổi quy ước (bạn chốt): **được comment nhưng hạn chế**. Đề xuất tiêu chí: chỉ comment khi giải thích **vì sao** / điều không đọc code mà thấy được, hoặc chia mục trong SQL/script. Không comment lặp lại việc code đã nói. Comment viết tiếng Anh.

- [x] 1. Khôi phục (dịch sang tiếng Anh) các comment đạt tiêu chí:
  - `supabase/migrations/20261009000000_init.sql`: cả 9 comment (link spec, chia mục, lý do quyền/trigger/storage);
  - `supabase/tests/rls_s1.sql`: 4 comment (mục đích, cách chạy, 2 user giả, đóng vai user A);
  - `authService.ts`: mã lỗi `'7'` của Play Services + lỗi supabase-js không phải `Error`; lý do kiểm tra mạng trước khi gửi;
  - `_layout.tsx`: lý do ẩn cảnh báo InteractionManager; vuốt back trên cả Android/iOS;
  - `settings.tsx`: đổi ngôn ngữ ngay, lưu DB lỗi thì báo;
  - `withReleaseSigning.js`: cách keystore được truyền qua `DAYNEST_KEYSTORE_FILE`;
  - `release.sh`: dòng mô tả + SHA-1 là keystore đã đăng ký OAuth;
  - `app.config.ts`, `theme/index.ts`: link tới spec (`build.md`, `design-system.md`).
- [x] 2. **Không khôi phục:** JSDoc mô tả component/hàm (Avatar, Dialog, Toast…), `profile.ts`, `validateName.ts`, `i18n`, `lib/supabase.ts`, `index.tsx`, `eslint.config.js`, tiêu đề mục trong `.gitignore`, `.env.example` (đã sang README), `supabase/config.toml` (comment CLI tự sinh).
- [x] 3. Kiểm tra: typecheck, lint, `npm test`, `bash -n` 2 script, `supabase/db test`.
- [x] 4. Cập nhật Claude memory `code-english-no-comments` theo quy ước mới. Chưa commit.

## 2026-10-09 — Xoá comment code, code toàn tiếng Anh — ✅ xong (chưa commit)

Quy ước mới (bạn chốt): code không comment, mọi chỗ ngoài docs dùng tiếng Anh. Docs giữ tiếng Việt (sau này làm thêm bản tiếng Anh).

**Phạm vi:** `app/`, `supabase/`, `.gitignore`. **Không đụng:** `docs/`, `wip/`, `playbook/` (tài liệu tham khảo), các `README.md` / `AGENTS.md` (là docs), `app/src/locales/vi.json` (bản dịch UI), nhãn `'Tiếng Việt'` trong `i18n/index.ts` (tên ngôn ngữ hiển thị cho user).

- [x] 1. Xoá mọi comment trong ~30 file code: `.ts/.tsx/.js/.sh/.sql`, `supabase/db`, `.gitignore`, `.env.example`, `supabase/config.toml` (~220 dòng comment do Supabase CLI sinh). Giữ shebang `#!`.
- [x] 2. Comment trong 2 file `.env.example` đang là hướng dẫn lấy key → chuyển nội dung sang `app/README.md` / `supabase/README.md` (tiếng Việt) nếu README chưa có, để không mất thông tin.
- [x] 3. Dịch sang tiếng Anh các chuỗi tiếng Việt còn lại trong code:
  - lỗi/log: `withReleaseSigning.js`, `scripts/release.sh`, `supabase/db`, `lib/supabase.ts`;
  - tên test: `__tests__/*.test.ts` (3 file), `supabase/tests/rls_s1.sql`.
- [x] 4. Kiểm tra: `grep` không còn comment + không còn chữ tiếng Việt ngoài phạm vi loại trừ; `npm run lint`, `npx tsc --noEmit`, `npm test` trong `app/`; `bash -n` 2 script.
- [x] 5. Lưu quy ước vào Claude memory (để session sau tuân theo). Chưa commit — chờ bạn bảo.

## 2026-10-09 — S1 bước 4: keystore release, APK cài máy thật — ✅ xong (release v1.0.1)

### Input

- Spec: `F4-ky-app-version.md`, `design/build.md` (keystore RSA 2048, 10000 ngày, alias `daynest`).
- **Đã chốt (bạn):** keystore nằm trong `app/.env` → máy khác chỉ cần chép `app/.env`.
- Hiện bản release Gradle đang ký bằng keystore **debug** (template Expo) → chưa dùng được để phát hành.
- DoD S1 còn 3 mục: cài APK release lên máy thật + đăng nhập Google; build từ máy thứ 2 cài đè được; `versionCode` 2 cài đè bản 1.

### Output

- 1 keystore release dùng chung mọi máy, ngoài repo.
- 1 lệnh build ra APK (cài thử) + AAB (Google Play sau này), ký bằng keystore release.
- App release cài trên điện thoại thật của bạn, đăng nhập Google được.

### Context

- Keystore trong `app/.env` (không commit, `.gitignore` đã chặn `.env*`), 3 biến **không** có tiền tố `EXPO_PUBLIC_` → không bị nhúng vào app:
  - `ANDROID_KEYSTORE_BASE64` = file `.jks` mã hoá base64;
  - `ANDROID_KEYSTORE_PASSWORD` (dùng chung cho store + key);
  - `ANDROID_KEY_ALIAS=daynest`.
- Lúc build, script giải base64 ra file tạm (xoá sau khi build) → Gradle ký bằng file đó. `android/` sinh tự động nên gắn chữ ký bằng 1 config plugin nhỏ `app/plugins/withReleaseSigning.js` (đọc biến môi trường, thiếu thì báo lỗi rõ).
- **Hệ quả:** `app/.env` giờ là **bí mật quan trọng nhất** — mất = không cập nhật được app đã cài; lộ = người khác ký giả app. Lưu `app/.env` vào password manager + 1 bản dự phòng; gửi sang máy khác qua kênh riêng (không chat, không email thường).
- Mật khẩu keystore: tôi sinh ngẫu nhiên bằng `openssl`, ghi thẳng vào `app/.env`, không in ra chat.
- Mỗi keystore có 1 SHA-1 riêng → cần thêm **OAuth client Android thứ 2** (release) trên Google Cloud, rồi thêm Client ID đó vào ô Client IDs của Supabase. Việc này làm trên web: bạn nhờ Claude extension, tôi đưa prompt.
- Build release nhúng sẵn JS, không cần Metro; giá trị `app/.env` được nhúng lúc build.

### Bạn chuẩn bị

1. Điện thoại Android: bật **Tuỳ chọn nhà phát triển** → **Gỡ lỗi USB**, cắm cáp vào máy, bấm "Cho phép" khi máy hỏi.
2. Sau bước 2 dưới đây: gửi prompt tôi đưa cho Claude extension để đăng ký SHA-1 release.

### Plan

- [x] 1. Tạo keystore:
  - alias `daynest_alias` (bạn chọn), RSA 2048, 10000 ngày, mật khẩu ngẫu nhiên. Đã tạo lại 1 lần vì mật khẩu bản đầu lỡ in ra log khi debug. SHA-1 release: `47:FA:14:1E:96:20:68:4B:AC:C8:32:C2:6C:AE:3D:DD:17:9B:A5:93`;
  - ghi 3 biến vào `app/.env`, xoá file `.jks` tạm;
  - `app/.env.example` thêm 3 biến (để trống, có comment);
  - in SHA-1 release.
- [x] 2. Đưa bạn prompt cho Claude extension: tạo OAuth client Android "Daynest Android (release)" với SHA-1 release; thêm Client ID mới vào Supabase → Google → Client IDs (Web vẫn đứng đầu).
- [x] 3. Config plugin `app/plugins/withReleaseSigning.js`: bản release ký bằng keystore từ biến môi trường; thiếu biến thì build dừng, báo lỗi rõ.
- [x] 4. Script `app/scripts/release.sh` (= `npm run release`):
  - đọc `app/.env`, giải keystore ra file tạm, kiểm tra SHA-1 đúng (ghi SHA-1 mong đợi trong script), xoá file tạm khi xong;
  - `prebuild` → `assembleRelease` + `bundleRelease`;
  - in đường dẫn APK, AAB, version, versionCode.
- [x] 5. Build `1.0.0 (versionCode 1)`, kiểm tra chữ ký bằng `apksigner verify --print-certs` → SHA-1 release.
- [x] 6. Cài lên điện thoại thật (`adb install`) → đăng nhập Google OK, ngôn ngữ lấy từ DB. Phát hiện chữ bị cắt trên Samsung → todo riêng.
- [x] 7. Test cài đè:
  - tạm đổi `versionCode` 2 (`1.0.1`), build → `adb install -r` đè lên bản 1 → vẫn đăng nhập, dữ liệu còn;
  - sau đó đặt lại `versionCode` 1? **Không** — giữ 2 vì máy đã có bản 2 (Android không cho hạ `versionCode`) → commit version `1.0.1 (2)`.
- [x] 8. Test "máy thứ 2" ngay trên máy này:
  - `git clone` repo sạch vào thư mục tạm → build bằng cùng keystore → `adb install -r` đè lên → vẫn đăng nhập. ✅ Gộp với mục 7: bản 1.0.1 (2) build từ clone (chỉ chép `app/.env`) cài đè 1.0.0 (1) trên Samsung SM-A556E, giữ phiên + ngôn ngữ.
  - Laptop thật: chép `app/.env` sang rồi `npm run release`.
- [x] 9. Cập nhật `design/build.md` (keystore nằm trong `app/.env`, lệnh `npm run release`, SHA-1 release). Tick DoD S1.
- [x] 10. Commit `feat(app): release signing and build script` rồi push.

**Thêm (bạn yêu cầu): ghi quy trình release cuối sprint để lần sau tự làm đúng format — chờ duyệt**

- [x] 11. `docs/specs/index.md` §4: thêm mục ngắn "Cuối sprint" (áp dụng mọi sprint), từng bước:
  1. Tick DoD sprint;
  2. tăng version: `version` +MINOR (S2 = `1.1.0`…), `versionCode` +1 trong `app.config.ts`;
  3. `supabase/db migrate` nếu sprint có migration mới;
  4. `npm run release` → `app/dist/daynest-<version>-<versionCode>.apk|.aab`;
  5. cài đè lên máy thật (`adb install -r`), test nhanh luồng chính + luồng của sprint;
  6. commit `chore(release): v<version>` + tag `v<version>`, push.
- [x] 12. `design/build.md`:
  - keystore trong `app/.env` (alias `daynest_alias`);
  - SHA-1 debug + release;
  - lệnh `npm run release`;
  - máy mới chỉ cần chép `app/.env`.
- [x] 13. CLAUDE.md của project (tài liệu governance → theo Rule 7): nội dung dự định ghi ở `wip/claude-md-todo.md`. Bạn ok file đó thì tôi mới tạo `CLAUDE.md`.


## 2026-10-09 — `supabase/db`: comment bỏ nhắc Rails — ✅ xong

- [x] Dòng 2: "Migrate DB kiểu Rails" → "Quản lý migration DB". Commit `chore(supabase): drop rails wording in script` rồi push.

## 2026-10-09 — `supabase/README.md`: bỏ nhắc Rails — ✅ xong

- [x] Bỏ "(giống Rails)" ở câu đầu; cột "Giống Rails" → "Làm gì": tạo file migration mới / chạy lại migration + test RLS trên DB local (Docker) / so migration local với project thật / áp dụng migration lên project thật. Commit `docs(supabase): drop rails wording` rồi push.

## 2026-10-09 — DB migrate kiểu Rails, Claude CLI tự chạy được — ✅ xong

(Thay 2 todo "Rút gọn README" và "Quản lý Supabase bằng CLI" — gộp, đã bỏ.)

**Mục tiêu:** mỗi thay đổi DB = 1 file migration có timestamp (giống Rails). 1 lệnh chạy được mà không phải gõ tay mật khẩu hay mở trình duyệt, nên Claude CLI tự chạy.

**Cách chạy (script `supabase/db`, tự đọc `supabase/.env`):**

| Lệnh | Giống Rails | Làm gì |
| --- | --- | --- |
| `supabase/db new <ten>` | `rails g migration` | Tạo `migrations/<timestamp>_<ten>.sql` |
| `supabase/db test` | `rails test` | Chạy Supabase local (Docker), chạy lại mọi migration, chạy `tests/*.sql` |
| `supabase/db status` | `db:migrate:status` | So migration local và project thật |
| `supabase/db migrate` | `db:migrate` | Đẩy migration mới lên project thật |

- [x] 1. `supabase/.env.example`, có comment ghi lấy giá trị ở đâu:
  - `SUPABASE_PROJECT_REF=xxfsqxuymswnbomxbpfs`;
  - `SUPABASE_ACCESS_TOKEN=` (Supabase → Account → Access Tokens → Generate) → thay cho `supabase login`, không cần mở trình duyệt;
  - `SUPABASE_DB_PASSWORD=` (Project Settings → Database) → thay cho việc gõ mật khẩu.
- [x] 2. Script `supabase/db` (bash, ~30 dòng):
  - đọc `.env`;
  - tự `link` nếu chưa link;
  - 4 lệnh trên;
  - `migrate` chạy `--dry-run` in danh sách trước, rồi mới push.
- [x] 3. **Bạn** (1 lần/máy): `cp supabase/.env.example supabase/.env` → điền access token + mật khẩu DB.
- [x] 4. Tôi đồng bộ lịch sử: migration `init` đã chạy tay qua SQL Editor → `migration repair --status applied 20261009000000`. Sau đó `supabase/db status` phải khớp.
- [x] 5. README rút gọn (~10 dòng mỗi file):
  - `supabase/README.md`: copy `.env` → điền; bảng 4 lệnh; quy tắc: không sửa DB trên dashboard, migration đã chạy thì không sửa, tạo file mới.
  - `app/README.md`: copy `.env` → điền; `npm install && npm run android`; lệnh kiểm tra. Chú thích "lấy ở đâu" chuyển vào comment trong `app/.env.example`.
- [x] 6. Kiểm tra: `test` 14/14, `new` OK, `status` khớp, `migrate` up to date. Token cần full access (scoped token thiếu `project_admin_read`, `api_gateway_keys_read`…). Đổi tên `init` → `20261009000000_init.sql` để migration tạo trong ngày (giờ UTC) không xếp trước init:
  - `supabase/db test` → 14/14;
  - `supabase/db new thu` → tạo đúng file rồi xoá;
  - `supabase/db status` khớp;
  - `supabase/db migrate` → "up to date".
- [x] 7. Commit `chore(supabase): rails-like migrate script, short readmes` rồi push.

## 2026-10-09 — S1 bước 3: nối Supabase + đăng nhập Google thật — ✅ xong

### Input

- Supabase project `xxfsqxuymswnbomxbpfs`: URL + publishable key (bạn đã gửi).
- Spec: `F2`, `F3`, `design/db.md` (2 bảng, RLS, trigger, bucket `avatars`).
- Code bước 1: `authService` (đang là bản giả), `i18n` (ngôn ngữ lưu trên máy).

### Output

- Đăng nhập Google thật → Supabase. Profile, ngôn ngữ, tên và ảnh lưu trên DB/Storage.
- Migration + test RLS trong `supabase/`.
- Chạy được trên emulator với tài khoản Google thật của bạn.

### Context

- **SHA-1 debug** để tạo OAuth client Android: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`.
  - Đây là keystore debug Expo sinh sẵn trong `android/app/`. Mọi máy chạy `prebuild` đều có cùng SHA-1 này, nên PC và laptop dùng chung được.
  - SHA-1 release làm ở bước 4.
- **Emulator** `Pixel_5_API_34` là image `google_apis`, có Google Play Services. Cần thêm 1 tài khoản Google vào emulator để test.
- **Key trong app:** chỉ dùng URL + publishable key, ghi vào `app/.env` (không commit). Mật khẩu DB không nằm trong app hay repo.
- **Migration:**
  - Test trước trên Supabase local (Docker, `supabase start`).
  - Đẩy lên project thật bằng `npx supabase db push`. Lệnh này cần mật khẩu DB → **bạn tự chạy** bằng `! <lệnh>`, tôi không giữ mật khẩu.

### Bạn chuẩn bị (làm song song)

1. Google Cloud → tạo project → OAuth consent screen: chế độ Testing, thêm email của bạn làm test user.
2. Tạo OAuth client **Web** → gửi tôi **Client ID**. Client secret bạn tự dán vào Supabase, không gửi qua chat.
3. Tạo OAuth client **Android**: package `com.danhbuidcn.daynest`, SHA-1 ở trên.
4. Supabase → Authentication → Sign In / Providers → Google: bật, dán Web Client ID + secret.
5. Nên làm: đổi mật khẩu DB (Database → Settings → Reset password), vì mật khẩu cũ đã nằm trong chat.

### Plan

- [x] 1. `supabase/`: `npx supabase init`; migration `<timestamp>_init.sql` gồm:
  - bảng `profiles` + `user_settings` (có cột `language`);
  - RLS: chỉ đọc/sửa dòng của mình; `profiles` chỉ cho sửa `display_name` + `avatar_url`;
  - trigger tạo 2 dòng khi có user mới (lấy tên, email, ảnh từ Google); trigger `updated_at`;
  - bucket `avatars` (public read) + policy chỉ ghi vào folder `{user_id}`.
- [x] 2. `supabase/tests/rls_s1.sql` (pgTAP), giả 2 user A, B, kiểm tra:
  - A không đọc/sửa được dòng của B;
  - A không sửa được `email`;
  - A không ghi được ảnh vào folder của B.
  - Chạy `supabase start` + `supabase test db` trên Docker local.
- [x] 3. App: cài `@supabase/supabase-js`, `@react-native-google-signin/google-signin` (config plugin); tạo `src/lib/supabase.ts` (lưu phiên bằng AsyncStorage, tự làm mới token).
- [x] 4. `supabaseAuthService` thay `mockAuthService`, giữ nguyên interface `AuthService`:
  - `signIn`: Google → `idToken` → `signInWithIdToken` → đọc `profiles`;
  - huỷ chọn tài khoản → không báo lỗi;
  - mất mạng → toast "Không có kết nối";
  - `signOut`: Supabase + Google;
  - `updateProfile`: tải ảnh lên `avatars/{uid}/avatar.jpg` (ghi đè, URL kèm `?v=`), cập nhật `profiles`.
  - Xoá `mockAuthService`.
- [x] 5. Ngôn ngữ: sau đăng nhập, đọc `user_settings.language` → áp dụng + ghi về máy. Đổi trong Cài đặt → ghi cả DB.
- [x] 6. Kiểm tra code: `tsc`, lint, Jest (thêm test hàm chuyển dữ liệu DB → `Profile`).
- [x] 7. Đẩy migration: bạn (qua Claude extension) chạy SQL trong SQL Editor; tôi kiểm tra bảng/bucket đã có trên project thật.
- [x] 8. Build lại, chạy emulator với tài khoản Google thật, đi các luồng:
  - đăng nhập → profile tạo đúng;
  - đổi tên + ảnh, mở lại app vẫn đúng;
  - đổi ngôn ngữ → DB lưu;
  - đăng xuất → đăng nhập lại vẫn giữ tên/ảnh/ngôn ngữ;
  - tắt mạng → toast lỗi.
- [x] 9. Cập nhật `app/README.md` (Supabase, `.env`), `F2`/`F3` nếu khác spec. Tick DoD S1 các mục đã đạt.
- [x] 10. Commit `feat: supabase auth with google sign-in` rồi push.

## 2026-10-09 — S1 bước 1: code giao diện, đăng nhập giả, chạy trên emulator — ✅ xong

### Input

- Spec S1: `docs/specs/sprint-1/` (F1–F4, `design/screens.md`), `docs/specs/design-system.md`, `mockups.html` (10 màn).
- Kiến trúc: `docs/specs/index.md` §3.
- Máy: Node 24, Java 17, Android SDK, emulator `Pixel_5_API_34`.

### Output

- App Expo trong `app/`, chạy trên emulator. Đủ 10 màn giống mockup, đổi được ngôn ngữ EN/VI.
- Đăng nhập và tài khoản dùng dữ liệu giả lưu trên máy. Bước 3 thay bằng Supabase + Google thật.
- `app/README.md`: lệnh cài, chạy, kiểm tra.

### Context

- Chưa có Supabase/Google → bấm "Đăng nhập bằng Google" tạo user giả `Nguyễn An / an.nguyen@gmail.com`, lưu phiên vào AsyncStorage.
- Code auth tách sau 1 interface `authService` (signIn, signOut, getSession, updateProfile) → bước 3 chỉ thay phần cài đặt, không sửa màn hình.
- Chưa cài `google-signin`, `supabase-js`, chưa làm keystore release (bước 3, 4).
- **Đã chốt:** S1 = `1.0.0` (bạn chọn) → sửa `build.md` cho khớp.

### Plan

- [x] 1. Dựng project:
  - `create-expo-app` bản ổn định mới nhất, template TypeScript, vào `app/`;
  - package `com.danhbuidcn.daynest`, `version` + `android.versionCode` trong `app.config.ts`;
  - `.gitignore` thêm `!.env.example`; tạo `.env.example` với 3 key để trống.
- [x] 2. Cài thư viện:
  - `expo-router`, `@react-native-async-storage/async-storage`;
  - `i18next` + `react-i18next`;
  - `@expo-google-fonts/nunito`, `@expo/vector-icons`;
  - `expo-image-picker`, `expo-image-manipulator`.
- [x] 3. Theme: `src/theme/` chứa token đúng `design-system.md` (màu, cỡ chữ, khoảng cách, bo góc). Màn hình chỉ dùng token, không hard-code.
- [x] 4. Thành phần dùng chung (`src/components/`):
  - Button (chính, phụ, nguy hiểm), Card, SettingRow, Toast, ConfirmDialog, ChoiceDialog;
  - TextField, Avatar, Logo, ScreenHeader, EmptyState;
  - TabBar có nút `+` nổi.
- [x] 5. i18n: `src/locales/en.json`, `vi.json`. Ngôn ngữ mặc định `en`, lưu trên máy, đổi xong chữ đổi ngay.
- [x] 6. Màn hình (Expo Router):
  - Splash, `(auth)/login`;
  - `(tabs)`: calendar, manage, stats, settings;
  - `settings/account`;
  - hộp xác nhận đăng xuất, hộp chọn ngôn ngữ;
  - guard: chưa đăng nhập → login;
  - nút `+` → toast "In development" / "Đang phát triển".
- [x] 7. Sửa tài khoản (giả):
  - đổi tên với validate 1–50 ký tự, cắt khoảng trắng;
  - chọn ảnh, cắt vuông, thu nhỏ 512px;
  - lưu trên máy, toast "Đã lưu".
- [x] 8. Kiểm tra code:
  - `tsc --noEmit`, `expo lint`;
  - Jest: test validate tên; test `en.json` và `vi.json` đủ cùng bộ key.
- [x] 9. Chạy trên emulator `Pixel_5_API_34` (`npx expo run:android`).
  - Đi hết luồng: đăng nhập → 4 tab → `+` → đổi ngôn ngữ → sửa tên/ảnh → tắt mở lại vẫn đăng nhập → đăng xuất.
  - Chụp màn bằng `adb`, so với mockup.
- [x] 10. Viết `app/README.md`. Cập nhật `build.md`: chốt build bằng local Gradle qua `expo run:android` / `expo prebuild`.
- [x] 10b. Đổi chữ tab trống "Tính năng này đang được phát triển. Bạn quay lại sau nhé!" → "Tính năng đang được phát triển."
  - Sửa ở `vi.json`, `mockups.html`, `screens.md`.
  - `en.json` đổi tương ứng: "This feature is in development."
- [x] 10c. Xoá chip "Đang phát triển" ở 3 tab trống: app (`EmptyState`, key `empty.badge`), `mockups.html`, `screens.md`. Tiêu đề "<Tab> đang phát triển" và dòng mô tả giữ nguyên.
- [x] 10d. Nút cố định đáy + vuốt để back:
  - Màn Sửa tài khoản: nút Lưu cố định ở đáy màn (trên vùng an toàn), nội dung cuộn phía trên; bàn phím mở thì nút đẩy lên trên bàn phím.
  - Tạo thành phần `FormScreen` (tiêu đề + nội dung cuộn + nút đáy) để các màn form sau dùng chung.
  - `design-system.md`: thêm quy tắc "Màn form: nút hành động chính cố định ở đáy". Mockup màn 10 sửa theo.
  - Vuốt từ mép trái sang phải → về màn trước, cho mọi màn con (không áp dụng cho tab). Bật `gestureEnabled` + `fullScreenGestureEnabled` của Stack. Nếu Android không hỗ trợ vuốt trong native stack → dùng JS stack của expo-router cho các màn con.
- [x] 11. Commit `feat(app): sprint-1 UI with mock auth` rồi push. Báo bạn cách tự chạy để xem.

## 2026-10-09 — Sửa tài khoản: bỏ gợi ý dưới ô Email + bớt chữ màn Đăng nhập — ✅ xong

- [x] `mockups.html` màn 10: xoá dòng "Email lấy từ Google, không sửa được." (ô Email vẫn khoá, giữ icon khoá).
- [x] `mockups.html` màn 2 (Đăng nhập): xoá dòng "Dữ liệu của bạn được đồng bộ an toàn." và toast "Không có kết nối". Chú thích màn 2 bỏ "toast lỗi khi mất mạng". Chỉ bỏ trong mockup; F2 vẫn giữ quy tắc: mất mạng → toast "Không có kết nối".
- [x] Chụp mockup kiểm tra. Commit `docs: trim hint texts on login and account screens` rồi push.

## 2026-10-09 — Màn Cài đặt: bỏ dòng chân trang, chuyển Đăng xuất xuống cuối — ✅ xong

- [x] `mockups.html` (màn 7, 8, 9 vì cùng nền Cài đặt):
  - xoá dòng "Daynest · làm với ♥";
  - chuyển dòng Đăng xuất ra khỏi nhóm Tài khoản, đặt thành 1 thẻ riêng ở cuối màn, dưới nhóm Ứng dụng;
  - nhóm Tài khoản còn dòng "Đăng nhập bằng Google".
- [x] `screens.md` màn 7: ghi thứ tự: tài khoản → Ứng dụng (Ngôn ngữ, Phiên bản) → Đăng xuất ở cuối.
- [x] Sửa tài khoản: cho sửa tên hiển thị và ảnh đại diện. Email lấy từ Google, chỉ xem.
  - `F2-dang-nhap-google.md`, thêm mục Sửa tài khoản:
    - Bấm thẻ tài khoản (có icon bút) → mở màn Sửa tài khoản.
    - Tên bắt buộc, 1–50 ký tự, cắt khoảng trắng 2 đầu.
    - Ảnh: chọn từ thư viện (`expo-image-picker`), cắt vuông, thu nhỏ 512px JPEG (`expo-image-manipulator`), tải lên Storage.
    - Bấm Lưu: cập nhật `profiles.display_name`, `profiles.avatar_url`, toast "Đã lưu", quay lại Cài đặt.
    - Lỗi mạng: toast lỗi, ở lại màn.
    - Đăng nhập lại không ghi đè tên/ảnh đã sửa, vì trigger chỉ chạy lần đầu.
  - `design/db.md`:
    - thêm Storage bucket `avatars` (public read), file `avatars/{user_id}/avatar.jpg`;
    - RLS: user chỉ ghi/xoá trong folder `{user_id}` của mình;
    - `profiles.avatar_url` ghi rõ: ảnh Google lúc đầu, ảnh tự tải sau khi sửa.
  - `F3-db-supabase.md`: thêm bucket vào phạm vi migration.
  - `screens.md`: màn 7 thẻ tài khoản có icon bút; thêm màn 10 "Sửa tài khoản": ảnh tròn kèm nút máy ảnh, ô Tên, ô Email (khoá), nút Lưu, nút quay lại.
  - `mockups.html`: thẻ tài khoản có icon bút; thêm màn 10.
  - `sprint-1/index.md` DoD: thêm "Sửa tên + ảnh, mở lại app vẫn đúng; user A không ghi được ảnh của user B."
- [x] Bỏ toast "Đang phát triển ✨" ở màn Lịch (màn 3).
  - Màn 3 lúc đó trùng màn 4 → gộp thành 1 khung "3–4. Lịch (trống) + thanh tab" trong mockup. `screens.md` giữ dòng 3 (thanh tab là thành phần chung).
  - Nút `+` ở S1 vẫn hiện toast "Đang phát triển", bỏ ✨, theo F1. Chỉ không vẽ toast trong mockup.
- [x] Đồng bộ mọi màn — chỉ dùng token trong `design-system.md`, không dùng mã màu hay cỡ chữ ngoài token:
  - **Màu tab trống:** ô minh hoạ của Lịch, Quản lý, Thống kê cùng dùng nền `primarySoft` + icon `primary`. Bỏ tím `#8B74D6`, cam `#E6A35C`.
  - **Màu icon dòng cài đặt:** mọi dòng dùng nền `primarySoft` + icon `primaryDark`, riêng Đăng xuất dùng `error`. Bỏ xanh dương, tím.
  - **Màu ảnh đại diện mặc định:** nền `primary` thay gradient cam-hồng.
  - **Cỡ chữ:** chỉ dùng 4 cỡ token: 22 (title), 17 (heading), 15 (body), 12 (caption). Đổi các chỗ 13–14px (mô tả tab trống, email, giá trị dòng cài đặt, toast, mô tả hộp thoại, mã EN/VI) sang 15 hoặc 12.
  - **Độ đậm tiêu đề:** tiêu đề hộp thoại và tiêu đề tab trống cùng dùng 700, theo token `heading`.
  - **Tiêu đề tab trống ngắn, 1 dòng:** "Lịch đang phát triển", "Quản lý đang phát triển", "Thống kê đang phát triển".
- [x] Dòng Phiên bản chỉ hiện `1.0.0` (bỏ `(versionCode)`): sửa `mockups.html` và `screens.md` ("Cài đặt hiện `version`").
- [x] `design-system.md`: thêm mục "Quy tắc đồng bộ": mọi màn chỉ dùng token màu, cỡ chữ, khoảng cách, bo góc; màu event chỉ dùng cho event; icon dòng cài đặt cùng 1 kiểu màu.
- [x] Kiểm tra: chụp mockup, so từng màn: cùng font Nunito, cùng màu nền, cùng cỡ tiêu đề, không còn mã màu ngoài token (grep `#` trong phần màn hình). Không có link hỏng. Commit `docs: settings layout, account editing, consistent mockups` rồi push.

## 2026-10-09 — Màn chọn ngôn ngữ: đổi sang hộp pop-up giữa màn — ✅ xong

- [x] `mockups.html` màn 9: bỏ bảng trượt từ dưới lên, dùng hộp giữa màn giống màn 8 (nền mờ, bo 24). Hộp có tiêu đề "Ngôn ngữ" và 2 dòng English / Tiếng Việt; dòng đang chọn có nền `primarySoft` và dấu ✓. Bấm 1 dòng là đổi ngay rồi đóng hộp; không có nút xác nhận; bấm ra ngoài thì đóng.
- [x] `screens.md` màn 9 và `design-system.md`: đổi "Bảng chọn từ dưới lên" thành "Hộp chọn", ghi chung kiểu với Hộp xác nhận.
- [x] Kiểm tra: chụp mockup, không có link hỏng. Commit `docs: use centered dialog for language picker` rồi push.

## 2026-10-09 — S1: thêm cài đặt ngôn ngữ (Việt / Anh) — ✅ xong

**Đã chốt:**

- Hỗ trợ 2 ngôn ngữ: tiếng Việt và tiếng Anh.
- Mặc định tiếng Anh.
- Lưu lựa chọn trên máy để màn Đăng nhập dùng được. Sau khi đăng nhập, đồng bộ vào `user_settings.language` để đổi máy vẫn giữ.

**Việc cần làm:**

- [x] `F1-khung-app.md`: thêm mục i18n.
  - Dùng `i18next` + `react-i18next`; file chữ `locales/en.json`, `locales/vi.json`.
  - Mở app: đọc ngôn ngữ trên máy (AsyncStorage), chưa có thì dùng `en`.
  - Đăng nhập xong: nếu DB có `language` thì áp dụng và ghi về máy.
  - Đổi trong Cài đặt: đổi ngay, không cần mở lại app; ghi máy + DB.
- [x] `design/db.md`: `user_settings` thêm cột `language text` mặc định `'en'`, chỉ nhận `'en'` hoặc `'vi'`, dùng từ S1.
- [x] `design/screens.md`:
  - Màn 7 (Cài đặt) thêm dòng "Ngôn ngữ".
  - Thêm màn 9: bảng chọn ngôn ngữ, trượt từ dưới lên, có 2 lựa chọn: English, Tiếng Việt.
- [x] `sprint-1/index.md`: thêm dòng vào DoD: "Đổi ngôn ngữ Việt ↔ Anh, chữ đổi ngay; đăng nhập trên máy khác vẫn giữ lựa chọn."
- [x] `specs/index.md` §2 Quyết định chung: thêm dòng "Ngôn ngữ: EN (mặc định) + VI".
- [x] `mockups.html`:
  - Màn Cài đặt thêm dòng Ngôn ngữ, hiển thị "Tiếng Việt" vì mockup đang dùng tiếng Việt.
  - Thêm màn 9 là bảng chọn ngôn ngữ.
  - Các màn khác giữ chữ tiếng Việt.
- [x] `mockups.html`: đổi chữ ở 3 tab trống sang kiểu "đang phát triển", không nhắc số sprint.
  - Lịch: "Lịch đang phát triển".
  - Quản lý: "Việc cần làm, ghi chú, nhật ký đang phát triển".
  - Thống kê: "Thống kê đang phát triển".
  - Dòng mô tả của cả 3 tab: "Tính năng này đang được phát triển. Bạn quay lại sau nhé!"
  - Chip và toast nút `+` đổi từ "Sắp có" thành "Đang phát triển". Cập nhật `screens.md` và `F1-khung-app.md` cho khớp.
- [x] Logo tạm: đổi icon tờ lịch thành **sổ ghi chú**. Mục xoay 180° bỏ, vì đã thay hình.
  - Hình: cuốn sổ trắng đứng, có gáy lò xo (các khoen tròn) bên trái, 3 dòng kẻ màu `primary`, góc phải dưới có chấm tròn nhỏ màu `event.pink` cho dễ thương. Nét bo tròn, đặt trên ô nền `primary` như cũ.
  - `mockups.html`: thay SVG logo ở màn Splash và màn Đăng nhập.
  - `design-system.md` mục Logo tạm: sửa mô tả icon.
- [x] `design-system.md`: thêm thành phần "Bảng chọn từ dưới lên".
- [x] Kiểm tra: chụp mockup bằng Chrome headless, đủ 9 màn; không có link hỏng.
- [x] Gộp vào commit `docs: add design system and sprint-1 mockups` (todo trước, chưa commit) sau khi bạn ok mockup.

## 2026-10-09 — Sprint 1: thiết kế (design system + mockup) — ✅ xong

**Đã chốt:** phong cách dễ thương, pastel, giống tinh thần Cute Calendar. Không chép sticker, icon hay hình của app gốc.

- [x] Viết `docs/specs/design-system.md`, dùng chung cho mọi sprint, gạch đầu dòng ngắn:
  - **Màu:**
    - màu chính pastel, màu nền, màu chữ;
    - 6 màu event (S3 dùng);
    - màu báo thành công, lỗi, cảnh báo;
    - chỉ làm theme sáng, chế độ tối để sau.
  - **Chữ:**
    - 1 font sans bo tròn, hỗ trợ đủ tiếng Việt (vd Nunito);
    - cỡ chữ cho tiêu đề, nội dung, chú thích.
  - **Khoảng cách và bo góc:** bước 4px; bo góc lớn cho thẻ và nút.
  - **Icon:** một bộ có sẵn trong Expo (`@expo/vector-icons`), kiểu nét tròn.
  - **Thành phần dùng chung:** nút chính và nút phụ, thẻ, thanh tab có nút `+` nổi, toast, hộp xác nhận, dòng cài đặt.
  - **Logo tạm:** chữ "Daynest" kèm 1 icon đơn giản. Logo thật làm trước khi lên store.
- [x] Vẽ mockup `docs/specs/sprint-1/design/mockups.html`:
  - 1 file HTML gồm 8 màn S1, đặt trong khung điện thoại 360×780 (Android), theo `screens.md`;
  - chữ trên giao diện bằng tiếng Việt;
  - dùng đúng màu, chữ, thành phần trong design system;
  - mở bằng trình duyệt, không cần cài gì.
- [x] `screens.md`: thêm link tới mockup. `docs/index.md`: thêm dòng cho `design-system.md`.
- [x] Kiểm tra:
  - mở `mockups.html` trong trình duyệt, đủ 8 màn, không lỗi hiển thị;
  - không còn link hỏng.
- [x] Gửi bạn xem mockup. Bạn góp ý thì sửa, ok thì sang bước code S1 (todo riêng).
- [x] Commit `docs: add design system and sprint-1 mockups` kèm Co-Authored-By, push.

## 2026-10-09 — Tổ chức lại docs dạng cây + viết docs Sprint 1 — ✅ xong

**Cây mới:**

```text
docs/
  index.md                    # mô tả từng file/folder trong docs/
  research/                   # giữ nguyên (cute-calendar, memrise)
  specs/
    index.md                  # sản phẩm, quyết định chung, kiến trúc, danh sách sprint + chức năng sơ bộ
    sprint-1/                 # S1 nền móng
      index.md                # mục tiêu, phạm vi, luồng tổng, DoD, link chức năng + màn hình
      F1-khung-app.md         # mỗi file: mục tiêu, logic, luồng, mô tả
      F2-dang-nhap-google.md
      F3-db-supabase.md
      F4-ky-app-version.md
      design/
        screens.md            # danh sách màn: Đăng nhập, 5 tab trống, Cài đặt (tài khoản + đăng xuất)
        db.md                 # bảng profiles, user_settings: cột, RLS
        build.md              # keystore, versionCode, cách build trên PC/laptop
```

**Cách viết:** gạch đầu dòng ngắn, bám mục tiêu chính, không lan man.

- [x] Viết `docs/specs/index.md`, gộp từ 3 file cũ:
  - từ `features.md`: sản phẩm và quyết định;
  - từ `backlog.md`: quy tắc sprint và danh sách sprint;
  - từ spec GĐ1: kiến trúc chung, danh sách bảng dự kiến, các quy tắc đã chốt cho S2–S9 (âm lịch, lặp, sync Google, nhắc nhở). Mỗi quy tắc ghi 1–2 dòng dưới sprint tương ứng.
- [x] Tạo `docs/specs/sprint-1/`, gồm `index.md`, F1–F4 và `design/` (`screens.md`, `db.md`, `build.md`).
  - `screens.md` chỉ ghi danh sách màn, mục đích và thành phần chính của từng màn.
  - Mockup giao diện để sang bước thiết kế, có todo riêng.
- [x] Xoá 3 file cũ: `docs/features.md`, `docs/backlog.md`, `docs/specs/2026-10-09-giai-doan-1-design.md`.
- [x] Viết `docs/index.md` mô tả cây tài liệu.
- [x] Sửa link:
  - `README.md` trỏ sang `docs/index.md` và `docs/specs/index.md`;
  - `research/cute-calendar/features.md` không còn link tới file đã xoá.
- [x] Kiểm tra: không còn link hỏng (grep các đường dẫn `.md`), không còn nội dung trùng giữa các file.
- [x] Commit `docs: restructure specs as tree, add sprint-1 docs` kèm Co-Authored-By, push. Không add ảnh Memrise.

## 2026-10-09 — Đổi tên thành Daynest + thu hẹp phạm vi — ✅ xong

**Đã chốt:**
- Tên: **Daynest**. Repo `daynest`, package `com.danhbuidcn.daynest`.
- Sản phẩm chỉ còn 2 phần:
  - **Ghi chú:** note, diary, todo, chi tiêu.
  - **Lịch:** âm lịch, dương lịch, event, nhắc nhở, **chu kỳ kinh nguyệt** (cho user nữ).
- Bỏ các module Học tập, Thể dục, Task hằng ngày (đã gộp vào todo), Dashboard, Tùy chỉnh.

**Giả định:**
- Phạm vi GĐ1 theo spec giữ nguyên.
- Chi tiêu (gồm đọc bill bằng AI) và chu kỳ kinh nguyệt làm sau GĐ1.

- [x] **Bạn làm:** đổi tên repo trên GitHub: Settings → Repository name → `daynest`. Máy chưa có `gh` nên tôi không tự đổi được. GitHub tự chuyển hướng URL cũ.
- [x] Đổi remote sang `git@github-personal:danhbuidcn/daynest.git`, rồi chạy `git fetch` để kiểm tra.
- [x] `README.md`:
  - đổi tiêu đề thành `# Daynest`;
  - viết lại mô tả theo 2 phần Ghi chú và Lịch.
- [x] `docs/features.md`, viết lại theo 2 phần:
  - **Ghi chú:**
    - Note, Diary, Todo: lấy nội dung từ Daily note và Task hằng ngày.
    - Chi tiêu: giữ nội dung cũ.
    - Thống kê: thống kê todo, mood, chi tiêu.
  - **Lịch:**
    - Event, lịch âm, lặp âm lịch, Google Calendar.
    - Nhắc nhở: lấy từ module Nhắc nhở cũ.
    - **Chu kỳ kinh nguyệt** (mục mới, chỉ ghi ý chính, chi tiết sẽ brainstorm riêng):
      - ghi ngày bắt đầu và kết thúc kỳ;
      - dự đoán kỳ tiếp theo và ngày rụng trứng từ độ dài trung bình các kỳ trước;
      - hiện trên lịch;
      - nhắc trước kỳ;
      - chỉ bật khi giới tính trong hồ sơ là nữ.
  - Xoá các mục Học tập, Thể dục, Task hằng ngày, Dashboard, Tùy chỉnh.
  - Bảng Quyết định thêm 2 dòng:
    - Tên / package;
    - Dữ liệu sức khoẻ: Google Play và App Store bắt buộc có chính sách quyền riêng tư và khai báo dữ liệu sức khoẻ.
  - Thứ tự làm: GĐ1 → Chi tiêu, Chu kỳ → web.
- [x] Spec `docs/specs/2026-10-09-giai-doan-1-design.md`:
  - thêm tên app và package vào mục Quyết định;
  - sửa mục "Ngoài GĐ1": bỏ Học tập và Dashboard, thêm Chu kỳ kinh nguyệt.
- [x] Tạo `docs/backlog.md`, cách làm theo Scrum:
  - Mỗi sprint đi đủ vòng docs → thiết kế → code.
  - Cuối mỗi sprint phải có bản chạy được trên Android.
  - Thứ tự sprint:

    | Sprint | Nội dung |
    | --- | --- |
    | S1 | Nền móng: khung Expo + dev build, điều hướng 5 tab (màn trống), đăng nhập Google qua Supabase (giữ phiên, đăng xuất), DB tối thiểu `profiles` + `user_settings` + RLS |
    | S2 | Lịch tháng: dương, âm, ngày lễ |
    | S3 | Event đơn giản |
    | S4 | Lặp dương lịch + nhắc nhở + xem tuần/ngày |
    | S5 | Lặp âm lịch + ngoại lệ |
    | S6 | Kéo Google Calendar |
    | S7 | Todo |
    | S8 | Notes |
    | S9 | Diary + Thống kê + Cài đặt (xong GĐ1) |
    | Sau GĐ1 | Chi tiêu, Chu kỳ kinh nguyệt, web |

  - Mỗi sprint thêm bảng DB của riêng nó qua migration.
- [x] Spec: thay mục 9 "Mốc M1–M6" bằng link tới `docs/backlog.md`.
- [x] `docs/research/cute-calendar/features.md`:
  - đổi chữ "personal-hub" thành "Daynest";
  - sửa tên module trong bảng map cho khớp 2 phần mới.
- [x] Không sửa các mục cũ trong todo, vì đó là lịch sử.
- [x] Commit `docs: rename project to Daynest and narrow scope` kèm Co-Authored-By, push.
  - Chỉ add các file trên (gồm `docs/backlog.md`) và `wip/` (`todo.md` đã đổi tên thành `todo_list.md`).
  - Không add ảnh Memrise.
- [ ] Kiểm tra:
  - [x] `grep -ri personal-hub` chỉ còn trong các mục cũ của todo;
  - [x] `git fetch` qua remote mới chạy được.
- [x] **Bạn làm sau khi đóng phiên (không bắt buộc):** đổi tên thư mục local (bạn đã đổi 2026-10-09) thành `~/Documents/daynest`. Memory của Claude Code gắn với đường dẫn thư mục, nên đổi thư mục thì phải chép thư mục memory sang tên mới.

**Memrise:** giữ lại. Khảo sát Cute Calendar và Memrise là tài liệu tham khảo để thiết kế giao diện và tính năng, không gắn với module Học tập.
- Trong đợt này không đụng tới phần Memrise.
- Ảnh 36–44 chưa commit, để nguyên.

**Quy trình đã chốt:** docs → thiết kế → code.
- Sau khi xong đợt đổi tên, bước tiếp theo là **Sprint 1: docs → thiết kế → code**.
- Todo của bước thiết kế viết riêng, bạn duyệt rồi mới làm.
- Implementation plan chỉ viết sau khi thiết kế xong.

## 2026-10-09 — Viết spec Giai đoạn 1 (app lịch kiểu Cute Calendar) — ✅ xong, chờ review spec

Thiết kế đã chốt qua chat (phần 1–3). Việc này chỉ ghi tài liệu, chưa code.

- [x] Tạo `docs/specs/2026-10-09-giai-doan-1-design.md`, gồm:
  - Mục tiêu và phạm vi: Lịch, Event, Todo, Notes, Diary, lịch âm, Google login, kéo Google Calendar. Liệt kê rõ phần ngoài GĐ1.
  - Quyết định:
    - làm mobile trước (Expo, chỉ test Android), web làm sau;
    - GĐ1 không dùng Go;
    - đồng bộ Google **1 chiều** do app tự kéo (`calendar.readonly` + `syncToken`);
    - event Google chỉ đọc trong app;
    - event có lặp hằng năm âm lịch, không đẩy lên Google.
  - Kiến trúc và bảng dữ liệu, gồm cả `event_exceptions`.
  - Quy tắc âm lịch: không tính tháng nhuận, ngày 30 lùi về 29.
  - Màn hình và luồng chính.
  - Xử lý lỗi.
  - Test: unit test cho lunar, recurrence, google; kiểm RLS; test thủ công trên Android.
  - Cấu trúc code `app/`.
  - Các mốc M1–M6.
  - Việc bạn tự làm: tạo Supabase project và Google Cloud OAuth.
- [x] Tự rà spec: không còn TBD, không có chỗ mâu thuẫn hay hiểu được 2 cách.
- [x] Cập nhật `docs/features.md`:
  - thêm mục "Giai đoạn 1" link tới spec;
  - sửa bảng Quyết định: mobile trước, sync 1 chiều, GĐ1 chưa dùng Go;
  - đổi thứ tự làm: Học tập lùi sau GĐ1.
- [x] Commit `docs: add phase 1 calendar app spec` kèm Co-Authored-By, push `main`.
  - Chỉ add 2 file trên, không đụng ảnh Memrise chưa commit.
- [x] Gửi bạn review spec. Sau khi bạn duyệt mới viết implementation plan.

## 2026-10-08 — Ghi kết quả làm rõ MVP vào docs — ✅ xong

- [x] `docs/features.md`:
  - Điền cột Ưu tiên: **MVP** = Daily note, Học tập, Chi tiêu, Nhắc nhở, Dashboard. **Sau** = Thể dục, Task hằng ngày, Tùy chỉnh.
  - Thêm thứ tự làm: Daily note + Học tập trước → Chi tiêu + Dashboard sau.
  - Viết lại từng module MVP theo tính năng đã chốt; đánh dấu phần "Sau" trong module:
    - Daily note: Diary (mood, ảnh) + Notes (danh mục, checklist, ghim, tìm kiếm) + Event trên lịch (lặp, nhắc, màu). Sau: vẽ tay, ghi âm, khoá note, PDF.
    - Học tập: lộ trình, checklist bài học có link + %, nhập lộ trình từ file (CSV/Markdown), streak + thống kê. Sau: từ vựng spaced repetition, Pomodoro.
    - Chi tiêu: thu/chi, danh mục tự tạo, chụp bill, biểu đồ tháng, đọc bill bằng AI (Claude API qua Go). Sau: ngân sách, nhiều ví.
    - Dashboard: màn Hôm nay, thống kê học tập, thống kê chi tiêu. Sau: mood, tuỳ chỉnh khối.
    - Nhắc nhở: thông báo mobile (event, nhắc học, nhắc viết diary); web chỉ hiện trong app.
  - Thay mục "Chưa quyết định" bằng **"Quyết định"** (bảng: chủ đề → chốt → lý do ngắn):
    - Nền tảng: web + mobile cùng lúc; mobile Android + iOS.
    - Người dùng: thiết kế nhiều user, MVP 1 user.
    - Dữ liệu: online-only, không offline.
    - Stack: app Expo (React Native, TS) · web Nuxt 3 + Nuxt UI · api Go trên nền Supabase (Postgres, Auth, Storage) · OCR Claude API gọi từ Go.
- [x] `README.md`: thêm cột Công nghệ vào bảng cấu trúc.
- [x] Commit `docs: define MVP scope and tech stack` + Co-Authored-By, push `main`.

## 2026-10-08 — Khảo sát app Memrise trên điện thoại — ⏸ tạm dừng (làm tiếp 2026-10-09)

Mục tiêu: chụp mọi màn hình + liệt kê tính năng của Memrise (`com.memrise.android.memrisecompanion`, Samsung, qua `adb`) để lấy ý tưởng thiết kế cho module **Học tập** (từ vựng, ôn tập, tiến độ). Hình minh hoạ/icon/mascot không chép — tự design sau.

**Lưu ở:** `docs/research/memrise/`

- `screenshots/NN-<tên-màn>.png` — đánh số theo thứ tự duyệt.
- `features.md` — tính năng theo màn, map sang module personal-hub, link ảnh, gợi ý MVP.
- ⚠️ Repo **public**: ảnh có thể lộ tên tài khoản, email, tiến độ học. Màn có email (Profile/Settings) → hỏi bạn trước khi commit.

**Các bước:**

- [x] Ghi version app: `2026.09.28.0` (versionCode 209426065), máy SM-A556E.
- [x] Mở app, chụp (`screencap`) + `uiautomator dump` để biết nút bấm được.
- [x] Duyệt lần lượt: từng tab dưới → menu/nút → màn con → Settings. Mỗi màn: chụp, ghi tính năng.
- [x] Popup mua Pro/quảng cáo: chụp rồi đóng, không bấm mua. Không đổi setting, không xoá, không đăng xuất.
- [ ] Luồng học (bạn cho làm 1 bài): đang làm dở bài "汉字 (Ký Tự) 1" (tab Tình huống). Còn: hết bài → chụp màn kết quả; xem lại Home/Hoạt động/Từ vựng sau khi học; tab Ôn tập; thử mở đối thoại AI (thoát nếu bắt mua Pro).
- [ ] Viết `features.md`: bảng tính năng theo màn + map module Học tập + ghi chú nên đưa vào MVP.
- [ ] Cập nhật `docs/features.md`: link tới `research/memrise/features.md` ở mục 5. Học tập.
- [ ] Commit `docs: add Memrise research` + Co-Authored-By, push `main`.
- [ ] Kiểm tra: số ảnh khớp danh sách trong `features.md`, `git status` sạch.

**Tiến độ (2026-10-08):** 42 ảnh trong `screenshots/`. Ảnh 01–35 đã lọt vào commit `0efba1b` của phiên khác. Ảnh 36–44 lỡ vào commit `b99ffc3` (2026-10-09); bạn chọn giữ nguyên.

- 01–03: onboarding (màn chào, chọn ngôn ngữ, đăng ký). Bạn đã tự đăng nhập: tài khoản tiếng Trung, cấp 1, 0 điểm.
- 04–27: Home, Settings, Hoạt động, Từ vựng, Streak, Đổi ngôn ngữ, Cấp độ, Pro, các tab Tình huống/Video/Đối thoại.
- 30–44: trong bài học — loading, thẻ giới thiệu từ, tuỳ chỉnh bài học, nghe → chọn nghĩa/chữ, ghép từ thành câu, popup "học được từ mới", chọn sai → popup "Từ khó" + màn sửa, nghĩa → chữ, video → chữ.
- Ghi chú: trả lời đúng là app chuyển câu ngay, chưa chụp được màn "đúng" riêng (ảnh 35 thực ra là thẻ từ kế tiếp).

## 2026-10-08 — Khảo sát app Cute Calendar trên điện thoại — ✅ xong

Mục tiêu: chụp mọi màn hình + liệt kê toàn bộ tính năng của Cute Calendar (Samsung, qua `adb`) để làm module Daily note và các module khác tương tự. Sticker/icon/hình ảnh không chép — tự design sau.

**Điều kiện:** `adb devices` thấy điện thoại (bạn bật USB debugging + cho phép máy tính).

**Lưu ở:** `docs/research/cute-calendar/`

- `screenshots/NN-<tên-màn>.png` — đánh số theo thứ tự duyệt.
- `features.md` — danh sách tính năng theo màn, map sang module personal-hub, link ảnh tương ứng.
- ⚠️ Repo đang **public**: ảnh có dữ liệu nhật ký/ghi chú thật. Bạn đã chọn vẫn commit. Muốn kín thì đổi repo sang private trên GitHub.

**Kết quả:** 82 ảnh, `features.md` 6 nhóm tính năng + bảng map MVP. 5 mục `[TEST]` đã xoá (tìm "TEST" trong app: không còn).

**Các bước:**

- [x] Tìm package app (`pm list packages`), ghi version.
- [x] Mở app, chụp màn đầu (`screencap`) + dump giao diện (`uiautomator dump`) để biết nút nào bấm được.
- [x] Duyệt lần lượt: từng tab dưới → từng menu/nút → màn con → Settings. Mỗi màn: chụp ảnh, ghi tính năng.
- [x] Màn tạo/sửa (diary, note, event, todo...): chỉ mở, chụp, rồi **Back — không lưu**. Không xoá, không đổi setting, không mua gói.
- [x] Popup quảng cáo / mua Pro: chụp rồi đóng, không bấm mua.
- [x] (Bạn cho phép thêm) Test luồng: tạo mục thử tiêu đề bắt đầu `[TEST]` (event, todo, note, diary...), xem luồng sửa/hoàn thành/hiển thị. Cuối buổi **xoá hết mục `[TEST]`**. Vẫn không sửa/xoá dữ liệu thật, không đổi setting.
- [x] Viết `features.md`: bảng tính năng theo màn + map module + ghi chú tính năng nên đưa vào MVP.
- [x] Cập nhật `docs/features.md`: link tới `research/cute-calendar/features.md` ở mục Daily note.
- [x] Commit `docs: add Cute Calendar research` + Co-Authored-By, push `main`.
- [x] Kiểm tra: số ảnh khớp danh sách màn trong `features.md`, `git status` sạch.

## 2026-10-08 — Chép skill AI + patterns từ AI_challenge — ✅ xong

Nguồn: `~/Documents/AI_challenge/playbook/`. Đích: `personal-hub/playbook/`. Giữ tên `playbook/` để `sync.sh` chạy được không cần sửa (nó lấy thư mục cha của `skills/` làm gốc).

**Chép (~11MB):**

- [x] `skills/`: 3 skill (`i-have-adhd`, `archify`, `ui-ux-pro-max`), `index.md`, `sources.txt`, `sync.sh`.
- [x] `patterns/`: `index.md`, `spec-driven-development.md`, `system-design-101/` (238 bài).

**Không chép** (riêng cho cuộc thi / làm nhóm / mạng công ty):

| Bỏ | Lý do |
| --- | --- |
| `tools/lan-check/` | Kiểm tra mạng LAN cho máy khác |
| `tools/hub/` | Giao tiếp giữa nhiều Claude account qua IP riêng |
| `tools/gitlab/` | Hook push + Kanban GitLab công ty |
| `contest.md`, `teamwork.md` | Bối cảnh thi, chia việc nhóm |
| `rules.md`, `conventions.md`, `complexity.md` | Quy trình nhiều account; trùng với `CLAUDE.md` global |
| Hook trong `.claude/settings.json` | Pull GitLab + inbox hub, không dùng ở đây |

**Superpowers dùng được trên mọi máy:**

- [x] Tạo `personal-hub/.claude/settings.json`, chỉ gồm `enabledPlugins` (`superpowers@superpowers-dev`) + `extraKnownMarketplaces` (`obra/superpowers`, `ref: v6.4.2`), chép y nguyên từ AI_challenge. Không có `permissions`, không có `hooks`.
  - Máy mới clone repo → Claude Code hỏi cài plugin khi trust folder → cài 1 lần là dùng được.
  - Pin `v6.4.2` để mọi máy cùng phiên bản.

**Chỉnh sau khi chép:**

- [x] `playbook/index.md` mới: chỉ liệt kê `skills/`, `patterns/`.
- [x] `skills/index.md`: bỏ mục "Theo `COMPLEXITY`" (link tới file không chép). Phần còn lại giữ nguyên.
- [x] Skill chưa kích hoạt (giống bản gốc). Cần skill nào thì tạo symlink vào `.claude/skills/` theo hướng dẫn trong `skills/index.md`.
- [x] `README.md`: thêm dòng `playbook/` vào bảng cấu trúc.

**Kiểm tra + đẩy lên:**

- [x] `diff -r` thư mục `skills/<skill>` và `patterns/system-design-101` với bản gốc: không khác.
- [x] Commit `chore: add AI skills and patterns playbook` + Co-Authored-By, push `main`.

- Thêm ngoài todo: `skills/index.md` bỏ thêm 1 link tới `teamwork.md` và câu "Giữ đúng mức `COMPLEXITY`" (cùng lý do: trỏ tới file không chép).

**Sau đó:** làm rõ MVP — hỏi từng câu, ghi kết quả vào cột Ưu tiên của `docs/features.md`.

## 2026-10-08 — Khởi tạo repo + liệt kê tính năng — ✅ xong

App quản lý cá nhân "tất cả trong một", tùy chỉnh cao. Monorepo gồm 4 thư mục: `api/`, `web/`, `app/`, `docs/`.
Git setup giống `password-vault-android`: remote SSH `github-personal`, user `danhbuidcn`, branch `main`.

### A. Khung repo

- [x] Tạo thư mục `api/`, `web/`, `app/` (mỗi thư mục có `.gitkeep` vì chưa chọn stack).
- [x] `README.md` ngắn: mục tiêu app, cấu trúc 4 thư mục, link `docs/features.md`.
- [x] `.gitignore` tối thiểu: `node_modules/`, `.env*`, `build/`, `dist/`, `.DS_Store`, `.idea/`. Bổ sung khi chọn stack.

### B. `docs/features.md` — danh sách tính năng theo module

| Module | Tính năng |
| --- | --- |
| Daily note | Nhật ký/ghi chú mỗi ngày, tag, tìm kiếm, đính kèm ảnh |
| Thể dục thể thao | Ghi buổi tập (môn, thời lượng, ghi chú), lịch tập, streak |
| Task hằng ngày | Checklist ngày, task lặp lại, tick hoàn thành |
| Chi tiêu | Ghi thu/chi, danh mục, chụp ảnh bill/hóa đơn, biểu đồ theo tháng |
| Học tập | Lộ trình (vd: IELTS 6.5 / 120 ngày), bài học, link tài liệu, tiến độ |
| Nhắc nhở | Thông báo hằng ngày, đặt giờ, lặp lại — dùng chung cho mọi module |
| Thống kê / Dashboard | Màn tổng quan hôm nay, biểu đồ tuần/tháng cho từng module |
| Tùy chỉnh | Bật/tắt module, tự thêm danh mục/trường dữ liệu, sắp xếp dashboard |

- Mỗi module ghi: mô tả ngắn + danh sách tính năng.
- Cột "Ưu tiên" (MVP / Sau) để trống — bạn chọn sau khi đọc file.
- Chưa ghi stack, kiến trúc, data model (bước sau).

### C. Git + push GitHub

- [x] Bạn đã tạo repo `danhbuidcn/personal-hub` (public). Remote đã có 1 commit `Initial commit` với `README.md` (`# personal-hub`).
- [x] `git init -b main`, set local `user.name=danhbuidcn`, `user.email=danhbuidcn@gmail.com`.
- [x] `git remote add origin git@github-personal:danhbuidcn/personal-hub.git` (alias SSH key cá nhân, giống `password-vault-android`; `git@github.com:` trên máy này dùng key công ty).
- [x] `git fetch origin` + `git checkout main` để nối tiếp commit có sẵn (không force push).
- [x] Ghi đè `README.md` bằng nội dung ở mục A.
- [x] Commit `docs: init repo structure and feature list` (có dòng Co-Authored-By), push `main`.
- [x] Kiểm tra: `git log`, `git status` sạch, `git ls-remote origin` thấy `main`.
