-- The expenses RLS check "category belongs to the same user" looked up expense_categories by
-- user_id with no usable index (both unique indexes are partial), so the 6-month totals scanned
-- the whole table on every call (S4 load test). Additive only: safe for every app build.
create index expense_categories_user_idx on public.expense_categories (user_id);
