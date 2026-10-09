# Todo

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
