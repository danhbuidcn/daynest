# 2026-10-09 — English everywhere except docs/ and wip/ — ✅ xong

**Input:** you said: follow the rule "no Vietnamese, except the `docs/` folder". Today these files outside `docs/` are still Vietnamese:

| File | Plan |
| --- | --- |
| `README.md`, `app/README.md` | Translate to English |
| `playbook/index.md`, `playbook/patterns/index.md`, `playbook/patterns/spec-driven-development.md` | Translate to English |
| `CLAUDE.md` | Translate — governance file, separate todo in `wip/claude-md-todo.md` (Rule 7) |
| `wip/` | Keep Vietnamese (you: "wip là todo không cần dịch") |
| `app/src/locales/vi.json`, label `'Tiếng Việt'` in `i18n/index.ts` | Keep — Vietnamese UI text by nature |

- [x] 1. Translate the 5 files in the first two rows (same content, same structure).
- [x] 2. After the `CLAUDE.md` todo is approved: translate `CLAUDE.md` exactly as listed there.
- [x] 3. Check: grep for Vietnamese characters outside `docs/` → only `vi.json`, the language label and `wip/`.
- [x] 4. Commit `docs: english outside docs folder`, push.
- Kết quả grep: còn `vi.json`, nhãn `'Tiếng Việt'`, và tên mục "Cuối sprint" trong `CLAUDE.md` (trích tên mục trong docs). PNG khớp nhầm (file nhị phân).
