# Daynest — notes for Claude

- Spec: `docs/specs/index.md` → `docs/specs/sprint-N/`. Todo: `wip/todo_list.md`.
- DB: change only via migrations — `supabase/db new|test|status|migrate` (see `supabase/README.md`).
- App: `app/` — check with `npm run typecheck && npm run lint && npm test`.
- Language: everything outside `docs/` and `wip/` is English (code, READMEs, this file, `playbook/`, commits); `docs/` and `wip/` are Vietnamese. Comments sparse, only to explain "why".
- Secrets live only in `app/.env`, `supabase/.env` (never commit, never print to logs/chat).
- When debugging scripts that hold secrets: no `bash -x` (it once leaked the keystore password to the log).

## When a sprint is done (DoD met) — do it yourself, per the approved todo
Follow "Cuối sprint" in `docs/specs/index.md` §4:
bump version (+MINOR, versionCode +1) → `supabase/db migrate` (if there are migrations) →
`npm run release` → install over the real device → test → commit `chore(release): v<version>` → tag `v<version>` + push the tag to GitHub (required) →
GitHub Release with the APK: `gh release create v<version> app/dist/<file>.apk` (required, no `.aab`).
