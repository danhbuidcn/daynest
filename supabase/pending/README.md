# Pending migrations

Migrations that older app builds cannot handle, held back until the matching release.
At release time (S4 step 8): move each `.sql` migration into `migrations/` (renaming its timestamp if a newer migration exists),
move its `rls_*.sql` test into `tests/`, run `supabase/db test`, then `supabase/db migrate`.

| File | Release | Why held back |
| --- | --- | --- |
| 20261104000000_s8_income_expense_kind.sql (+ tests/rls_s8.sql) | S8 (v8.0.0, versionCode 13) | Older builds add income to the expense totals |
