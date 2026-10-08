# Todo

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
