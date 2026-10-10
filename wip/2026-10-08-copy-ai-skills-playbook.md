# 2026-10-08 — Chép skill AI + patterns từ AI_challenge — ✅ xong

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
