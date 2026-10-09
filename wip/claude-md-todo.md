# Đề xuất tạo `CLAUDE.md` cho project Daynest — ✅ đã duyệt, đã tạo `CLAUDE.md`

Mục đích: Claude ở phiên sau (máy nào cũng vậy) tự làm đúng quy trình khi xong sprint, không cần nhắc lại.

Nội dung dự định (file `daynest/CLAUDE.md`, ngắn):

```markdown
# Daynest — ghi chú cho Claude

- Spec: `docs/specs/index.md` → `docs/specs/sprint-N/`. Todo: `wip/todo_list.md`.
- DB: chỉ đổi qua migration — `supabase/db new|test|status|migrate` (xem `supabase/README.md`).
- App: `app/` — kiểm tra `npm run typecheck && npm run lint && npm test`.
- Bí mật chỉ nằm trong `app/.env`, `supabase/.env` (không commit, không in ra log/chat).

## Khi xong 1 sprint (DoD đạt) — tự làm, theo todo đã duyệt
Làm đúng mục "Cuối sprint" trong `docs/specs/index.md` §4:
tăng version (+MINOR, versionCode +1) → `supabase/db migrate` (nếu có migration) →
`npm run release` → cài đè máy thật → test → commit `chore(release): v<version>` + tag → push.
```

## Đề xuất bổ sung — ✅ đã duyệt, đã thêm vào `CLAUDE.md`

Thêm 2 dòng vào danh sách đầu `CLAUDE.md`:

- `Code (app/, supabase/): tiếng Anh; comment ít, chỉ giải thích "vì sao". Docs tiếng Việt.` (quy ước đã chốt ở commit a5b07d9)
- `Khi debug script có bí mật: không dùng bash -x (đã từng làm lộ mật khẩu keystore ra log).`

## Proposal — translate `CLAUDE.md` to English (2026-10-09) — ✅ approved, done

Reason: rule "no Vietnamese outside `docs/`". Same rules, no new content. Planned text:

```markdown
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
```

Only change in meaning: the "Code … tiếng Anh … Docs tiếng Việt" line now states the wider rule you gave.
