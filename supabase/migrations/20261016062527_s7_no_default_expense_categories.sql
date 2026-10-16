-- S7: no built-in expense categories. New users start with none and pick or create their own.
-- Existing built-in rows become ordinary user categories (expenses stay attached).

drop trigger if exists on_auth_user_created_expense_categories on auth.users;
drop function if exists public.handle_new_user_expense_categories();
drop function if exists public.add_default_expense_categories(uuid);

-- Name in the user's language; a clash with an existing name of theirs gets a " (2)" suffix.
update public.expense_categories c
set name = case
      when exists (
        select 1 from public.expense_categories o
        where o.user_id = c.user_id and o.name is not null and lower(o.name) = lower(n.base)
      ) then n.base || ' (2)'
      else n.base
    end,
    key = null
from (
  select ec.id,
    case coalesce(us.language, 'en')
      when 'vi' then case ec.key when 'food' then 'Ăn uống' when 'transport' then 'Di chuyển' else 'Hoá đơn' end
      else case ec.key when 'food' then 'Food' when 'transport' then 'Transport' else 'Bills' end
    end as base
  from public.expense_categories ec
  left join public.user_settings us on us.user_id = ec.user_id
  where ec.key is not null
) n
where c.id = n.id;
