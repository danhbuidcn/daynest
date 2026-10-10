# 2026-10-10 — Thêm mục Conventions vào `CLAUDE.md` — ✅ xong

## Input

- Quy tắc bạn chốt hôm nay đang chỉ nằm trong Claude memory (`~/.claude/…`, chỉ máy này, không vào git) → đổi máy là mất: tên file tiếng Anh · `wip/` mỗi việc 1 file · câu chữ trang trọng.
- Convention code + format commit chưa ghi ở đâu; Claude đang tự bắt chước code có sẵn.
- `CLAUDE.md` được nạp vào mọi session, mọi máy → nơi đúng để ghi.

## Output

- `CLAUDE.md` có mục **Conventions** (tiếng Anh, ngắn). Memory giữ nguyên (trùng nội dung, không hại).

## Plan

- [x] 1. Thêm vào cuối phần ghi chú đầu `CLAUDE.md` (trước "When a sprint is done") đúng đoạn dưới.
- [x] 2. Commit `docs: add conventions to claude.md`, push.

Nội dung dự định:

```markdown
## Conventions

- Names: files and folders in English kebab-case everywhere, `docs/` and `wip/` included; code keeps its idiom (`PascalCase.tsx` components, `camelCase.ts` modules).
- `wip/`: one file per task `wip/<YYYY-MM-DD>-<english-slug>.md` (Vietnamese: Input · Plan checklist · result) + one row at the top of `wip/index.md`; keep the status in both in sync. Never a single big todo file.
- UI copy (VI + EN): polite, simple, short — `docs/specs/design-system.md` § Câu chữ. No colloquialisms ("cho nhau", "nhé"), no jargon.
- Layout: screens `app/src/app/` (Expo Router) · feature UI + its Supabase calls `app/src/features/<feature>/` · pure logic `app/src/lib/` · shared UI `app/src/components/` · Jest tests `app/src/__tests__/<name>.test.ts` (pure logic always tested).
- UI code: theme tokens only (`@/theme`), text via `AppText`, every string through i18n with the same keys in `en.json` and `vi.json`, `StyleSheet.create` at the bottom, imports via `@/`.
- Commits: Conventional Commits, one line — `feat(app):`, `fix(app):`, `docs:`, `chore(supabase):`, `chore(release): v<version>`. Commit + push when an approved task is done.
- Skills: UI work → `ui-ux-pro-max` (mockups + design-system win on conflict); diagrams → `archify`. `playbook/patterns/` is reference only — read its `index.md` when choosing architecture.
```
