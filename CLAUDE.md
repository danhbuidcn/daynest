# Daynest — ghi chú cho Claude

- Spec: `docs/specs/index.md` → `docs/specs/sprint-N/`. Todo: `wip/todo_list.md`.
- DB: chỉ đổi qua migration — `supabase/db new|test|status|migrate` (xem `supabase/README.md`).
- App: `app/` — kiểm tra `npm run typecheck && npm run lint && npm test`.
- Bí mật chỉ nằm trong `app/.env`, `supabase/.env` (không commit, không in ra log/chat).

## Khi xong 1 sprint (DoD đạt) — tự làm, theo todo đã duyệt
Làm đúng mục "Cuối sprint" trong `docs/specs/index.md` §4:
tăng version (+MINOR, versionCode +1) → `supabase/db migrate` (nếu có migration) →
`npm run release` → cài đè máy thật → test → commit `chore(release): v<version>` → tag `v<version>` + push tag lên GitHub (bắt buộc).
