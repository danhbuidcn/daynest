# Daynest — notes for Claude

- Spec: `docs/specs/index.md` → `docs/specs/sprint-N/`. Todo: `wip/index.md` → one file per task `wip/<date>-<english-slug>.md`.
- DB: change only via migrations — `supabase/db new|test|status|migrate` (see `supabase/README.md`).
- App: `app/` — check with `npm run typecheck && npm run lint && npm test`.
- Language: everything outside `docs/` and `wip/` is English (code, READMEs, this file, `playbook/`, commits); `docs/` and `wip/` are Vietnamese. Comments sparse, only to explain "why".
- Secrets live only in `app/.env`, `supabase/.env` (never commit, never print to logs/chat).
- When debugging scripts that hold secrets: no `bash -x` (it once leaked the keystore password to the log).

## Conventions

- Names: files and folders in English kebab-case everywhere, `docs/` and `wip/` included; code keeps its idiom (`PascalCase.tsx` components, `camelCase.ts` modules).
- `wip/`: one file per task `wip/<YYYY-MM-DD>-<english-slug>.md` (Vietnamese: Input · Plan checklist · result) + one row at the top of `wip/index.md`; keep the status in both in sync. Never a single big todo file.
- UI copy (VI + EN): polite, simple, short — `docs/specs/design-system.md` § Câu chữ. No colloquialisms ("cho nhau", "nhé"), no jargon.
- Layout: screens `app/src/app/` (Expo Router) · feature UI + its Supabase calls `app/src/features/<feature>/` · pure logic `app/src/lib/` · shared UI `app/src/components/` · Jest tests `app/src/__tests__/<name>.test.ts` (pure logic always tested).
- UI code: theme tokens only (`@/theme`), text via `AppText`, every string through i18n with the same keys in `en.json` and `vi.json`, `StyleSheet.create` at the bottom, imports via `@/`.
- Commits: Conventional Commits, one line — `feat(app):`, `fix(app):`, `docs:`, `chore(supabase):`, `chore(release): v<version>`. Commit + push when an approved task is done.
- Skills: UI work → `ui-ux-pro-max` (mockups + design-system win on conflict); diagrams → `archify`. `playbook/patterns/` is reference only — read its `index.md` when choosing architecture.

## When a sprint is done (DoD met) — do it yourself, per the approved todo
Follow "Cuối sprint" in `docs/specs/index.md` §4:
bump version (+MINOR, versionCode +1) → `supabase/db migrate` (if there are migrations) →
`npm run release` → install over the real device → test → commit `chore(release): v<version>` → tag `v<version>` + push the tag to GitHub (required) →
GitHub Release with the APK: `gh release create v<version> app/dist/<file>.apk` (required, no `.aab`).
