# Sprint 8 — DB

Thuộc: [Spec S8](../index.md). Cùng quy ước với [S6 db.md](../../sprint-6/design/db.md).

## Tóm tắt

- Thêm cột `kind` vào `expenses` và `expense_recurrences`. Không thêm bảng. Không đổi RLS.
- Sửa 2 hàm: `generate_due_expenses`, `expense_monthly_totals`.
- **Tăng `app_config.min_version_code`** trong cùng migration: bản cũ không biết `kind`, sẽ cộng khoản Thu vào tổng Chi và hàm tổng đổi cột trả về.

## Cột

| Bảng | Cột | Kiểu | Ghi chú |
| --- | --- | --- | --- |
| `expenses` | `kind` | `text not null default 'expense'` | `check (kind in ('expense','income'))` · `amount` vẫn dương (1 … 1e11) |
| `expense_recurrences` | `kind` | `text not null default 'expense'` | như trên |

Dòng cũ nhận `expense` nhờ giá trị mặc định.

## Hàm

- `generate_due_expenses(p_today)`: câu `insert into expenses` thêm `kind` lấy từ `r.kind`.
- `expense_monthly_totals(p_from, p_to)`: trả `(month date, kind text, total bigint)`, `group by` tháng + `kind`. App ghép thành 2 dãy Thu / Chi.

## Test

- `supabase/db test`: dòng cũ có `kind = 'expense'` · không chèn được `kind` lạ · khoản lặp Thu sinh khoản Thu · tổng theo tháng tách đúng 2 loại.
