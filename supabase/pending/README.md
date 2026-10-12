# Pending migrations

Migrations that older app builds cannot handle, held back until the matching release.
At release time (S4 step 8): move each `.sql` migration into `migrations/` (renaming its timestamp if a newer migration exists),
move its `rls_*.sql` test into `tests/`, run `supabase/db test`, then `supabase/db migrate`.

| File | Release | Why held back |
| --- | --- | --- |
| `20261012102237_s4_any_colour.sql` + `rls_s4_colour.sql` | S4 | Hex colours + `min_version_code = 6`; builds ≤ 3.0.1 only know 6 colour names |
