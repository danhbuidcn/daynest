# Skill Index

Skill AI gom từ GitHub, đã lọc chỉ giữ phần cần dùng. Lưu sẵn, **chưa kích hoạt**. Cần skill nào thì kích hoạt skill đó.

## Chọn nhanh

### Theo phase

| Phase | Skill |
| --- | --- |
| Planning | [brainstorming, writing-plans](#superpowers), [archify](#archify) (vẽ diagram), [system-design-101](#system-design-101) (tham khảo) |
| Design UI | [ui-ux-pro-max](#ui-ux-pro-max) |
| Code | [executing-plans, subagent-driven-development, dispatching-parallel-agents, using-git-worktrees, test-driven-development](#superpowers) |
| Review | [requesting-code-review, receiving-code-review, finishing-a-development-branch](#superpowers) |
| Test / Debug | [systematic-debugging, verification-before-completion](#superpowers) |
| Xuyên suốt | [i-have-adhd](#i-have-adhd) (output gọn), [headroom](#headroom) (tiết kiệm token) |

## Kích hoạt

Claude Code tự nhận skill trong `.claude/skills/<tên>/SKILL.md` của project. Tạo symlink từ thư mục gốc workspace:

```bash
mkdir -p .claude/skills
ln -s ../../playbook/skills/ui-ux-pro-max .claude/skills/ui-ux-pro-max
ln -s ../../playbook/skills/archify .claude/skills/archify
```

- Tắt skill: xóa symlink. Không đụng vào bản gốc trong `playbook/`.
- Claude Code không nhận symlink → thay `ln -s` bằng `cp -r`.

## Cập nhật / thêm skill

- Cập nhật tất cả: `./sync.sh`. Cập nhật 1 repo: `./sync.sh obra/superpowers`.
- Thêm skill: thêm 1 dòng vào [sources.txt](sources.txt), chạy `./sync.sh <repo>`, rồi thêm mục vào file này.
- `sync.sh` xóa và tải lại thư mục đích → không sửa trực tiếp file trong thư mục skill.

## Chi tiết

### i-have-adhd

- **Nguồn:** [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) — chỉ lấy `skills/i-have-adhd/`.
- **Công dụng:** Ép agent trả lời thẳng: hành động kế tiếp lên đầu, đánh số các bước, bỏ lan man, ước lượng thời gian cụ thể.
- **Dùng khi:** Muốn output ngắn, làm được ngay. Hợp khi chạy đua thời gian.
- **Cách gọi:** Chỉ gọi tay `/i-have-adhd`, Claude không tự kích hoạt. Giữ nguyên tới khi nói `stop adhd mode`.
- **Yêu cầu:** Không.

### ui-ux-pro-max

- **Nguồn:** [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — chỉ lấy skill chính, bỏ 6 skill phụ và CLI.
- **Công dụng:** Kho dữ liệu UI/UX tra cứu offline: 79 style, 192 bảng màu, 74 cặp font, 119 guideline UX, 25 loại chart, 22 stack.
- **Dùng khi:** Thiết kế trang, chọn màu/font/layout, review UI.
- **Cách gọi:** Claude tự dùng khi làm UI. Tra tay:
  ```bash
  python3 playbook/skills/ui-ux-pro-max/scripts/search.py "dashboard saas" --domain style
  python3 playbook/skills/ui-ux-pro-max/scripts/search.py "task management" --design-system -p "Tên dự án"
  ```
- **Yêu cầu:** Python 3, không cần cài thư viện.
- **Lưu ý:** SKILL.md ghi đường dẫn theo dạng plugin (`${CLAUDE_PLUGIN_ROOT}/.claude/skills/...`). Khi chạy dạng skill project, dùng đường dẫn thật ở trên.

### archify

- **Nguồn:** [tt-a1i/archify](https://github.com/tt-a1i/archify) — chỉ lấy `archify/`, bỏ `test/` (435MB → 6.5MB).
- **Công dụng:** Vẽ diagram architecture, workflow, sequence, data-flow, lifecycle thành 1 file HTML độc lập. Có dark/light theme, animation, export PNG/SVG. Nhận input bằng lời hoặc Mermaid.
- **Dùng khi:** Cần diagram cho tài liệu thiết kế, slide demo.
- **Cách gọi:** Claude tự dùng khi được yêu cầu vẽ diagram. Chạy tay:
  ```bash
  cd playbook/skills/archify
  node bin/archify.mjs validate lifecycle examples/agent-run.lifecycle.json --json
  node bin/archify.mjs deliver lifecycle examples/agent-run.lifecycle.json out.html --json
  ```
- **Yêu cầu:** Node ≥ 18, không cần `npm install`. Đã chạy thử `deliver` thành công.
- **Lưu ý:** Mỗi file HTML xuất ra khoảng 800KB.

### superpowers

- **Nguồn:** [obra/superpowers](https://github.com/obra/superpowers) `v6.4.2`, đủ 15 skill.
- **Cài:** plugin, không tải file. Khai báo trong `.claude/settings.json` (`extraKnownMarketplaces` + `enabledPlugins`). Mở Claude Code lần đầu → chấp nhận cài. Hook của plugin nạp `using-superpowers` mỗi session.
- **Cập nhật:** đổi `ref` trong `.claude/settings.json`, test trước khi commit. Không update ngày thi.

| Skill | Công dụng | Mức |
| --- | --- | --- |
| `using-superpowers` | Kiểm skill liên quan trước mọi việc | minimal |
| `brainstorming` | Hỏi từng câu, chốt thiết kế trước khi code | minimal |
| `writing-plans` | Plan chia task nhỏ, mỗi bước là checkbox `- [ ]` | minimal |
| `executing-plans` | Thực thi plan từng task, ngay trong session | minimal |
| `test-driven-development` | Test trước, code sau (red → green → refactor). `minimal`: chỉ luồng chính | minimal |
| `verification-before-completion` | Có bằng chứng chạy lệnh rồi mới báo xong | minimal |
| `subagent-driven-development` | Mỗi task 1 subagent mới, review 2 tầng | standard |
| `requesting-code-review`, `receiving-code-review` | Gửi review, xử lý feedback | standard |
| `systematic-debugging` | Tìm root cause trước khi sửa | standard |
| `finishing-a-development-branch` | Kết thúc nhánh: merge, PR, dọn | standard |
| `using-git-worktrees` | Mỗi task 1 worktree riêng | complex |
| `dispatching-parallel-agents` | Chạy song song nhiều agent | complex |
| `writing-skills` | Viết skill mới | complex |
| `diagnosing-superpowers` | Chẩn đoán lỗi plugin | Khi cần |

- **Lưu ý:**
  - Workspace này dùng Superpowers làm quy trình chính. BMAD, `code-plan` (cài global) chỉ chạy khi gọi đích danh.
  - Tốn token: luôn nạp ~840 tok mỗi session. Mỗi lần gọi skill: ~1–4k, riêng `subagent-driven-development` ~12k, `writing-skills` ~10k. Xem: `claude plugin details superpowers@superpowers-dev`.

### system-design-101

- **Nguồn:** [ByteByteGoHq/system-design-101](https://github.com/ByteByteGoHq/system-design-101) — chỉ lấy guide dạng text, 238/400 bài.
- **Vị trí:** [../patterns/system-design-101/](../patterns/system-design-101/index.md) (tài liệu tham khảo, không phải skill).
- **Nhóm giữ lại:** api-web-development, software-architecture, software-development, database-and-storage, caching-performance, security, devops-cicd.
- **Dùng khi:** Chọn kiến trúc, thiết kế API, cache, auth. Đọc `index.md` mục lục trước, rồi mở đúng bài → đỡ tốn token.
- **Lưu ý:** Ảnh diagram là link ngoài (assets.bytebytego.com), cần internet để xem.

## Không lưu file

### headroom

- **Nguồn:** [headroomlabs-ai/headroom](https://github.com/headroomlabs-ai/headroom)
- **Lý do:** Là tool cài qua pip (repo 84MB), không phải skill.
- **Công dụng:** Proxy nén output tool, log, file trước khi gửi LLM → giảm token. Có memory dùng chung giữa nhiều agent.
- **Cách dùng:**
  ```bash
  pip install "headroom-ai[all]"
  headroom wrap claude --code-memory none   # chạy Claude Code qua proxy
  headroom dashboard                        # xem lượng token tiết kiệm được
  headroom unwrap claude                    # gỡ
  ```
- **Lưu ý:**
  - Không có `--code-memory none`, `wrap` tự cài Serena vào `~/.claude.json` (ảnh hưởng mọi project).
  - Chưa chạy thử. Cần test trước cuộc thi, và hỏi mạng công ty có cho chạy proxy không.

### the-elements-of-style

- **Nguồn:** [obra/the-elements-of-style](https://github.com/obra/the-elements-of-style)
- **Lý do:** Đã cài global với tên `writing-clearly-and-concisely`. Dùng trực tiếp.
