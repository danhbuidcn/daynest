import { ConflictError, ForbiddenError } from '@/features/events/api';
import type { AppColor } from '@/lib/colors';
import { supabase } from '@/lib/supabase';
import type { Expense, ExpenseCategory } from './expense';

// db.md: one period never holds more than this many rows.
const PERIOD_LIMIT = 1000;

// Unique (user_id, lower(name)): the name is already taken, case ignored.
export class DuplicateNameError extends Error {
  constructor() {
    super('duplicate');
  }
}

function classify(error: unknown): Error {
  const code = error && typeof error === 'object' ? (error as { code?: string }).code : undefined;
  if (code === '42501') return new ForbiddenError();
  if (code === '23505') return new DuplicateNameError();
  if (error instanceof Error) return error;
  return new Error(JSON.stringify(error));
}

const COLUMNS = 'id, category_id, amount, spent_on, note, updated_at, recurrence_id';

type ExpenseTableRow = { id: string; category_id: string; amount: number | string; spent_on: string; note: string; updated_at: string; recurrence_id: string | null };

function toExpense(r: ExpenseTableRow): Expense {
  return { id: r.id, categoryId: r.category_id, amount: Number(r.amount), spentOn: r.spent_on, note: r.note, updatedAt: r.updated_at, recurrenceId: r.recurrence_id };
}

export type ExpenseInput = { categoryId: string; amount: number; spentOn: string; note: string };

const toColumns = (input: ExpenseInput) => ({
  category_id: input.categoryId,
  amount: input.amount,
  spent_on: input.spentOn,
  note: input.note,
});

export async function fetchExpenses(from: string, to: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select(COLUMNS)
    .gte('spent_on', from)
    .lte('spent_on', to)
    .order('spent_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(PERIOD_LIMIT);
  if (error) throw classify(error);
  return ((data ?? []) as ExpenseTableRow[]).map(toExpense);
}

// "Ghi đè" after a conflict reads the current `updated_at`; null when deleted on the other device.
export async function fetchExpense(id: string): Promise<Expense | null> {
  const { data, error } = await supabase.from('expenses').select(COLUMNS).eq('id', id).maybeSingle();
  if (error) throw classify(error);
  return data ? toExpense(data as ExpenseTableRow) : null;
}

// `id` is generated once when the form opens: a retry after a lost response upserts the same row.
export async function createExpense(id: string, input: ExpenseInput): Promise<void> {
  const { error } = await supabase.from('expenses').upsert({ id, ...toColumns(input) }, { onConflict: 'id' });
  if (error) throw classify(error);
}

// Optimistic lock: 0 rows matched → another device saved (or deleted) it first.
export async function updateExpense(id: string, readUpdatedAt: string, input: ExpenseInput): Promise<void> {
  const { data, error } = await supabase
    .from('expenses')
    .update(toColumns(input))
    .eq('id', id)
    .eq('updated_at', readUpdatedAt)
    .select('id');
  if (error) throw classify(error);
  if (!data || data.length === 0) throw new ConflictError();
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw classify(error);
}

// "6 tháng gần đây": the DB sums each month (`expense_monthly_totals`), no rows are downloaded.
export async function fetchMonthlyTotals(from: string, to: string): Promise<{ month: string; total: number }[]> {
  const { data, error } = await supabase.rpc('expense_monthly_totals', { p_from: from, p_to: to });
  if (error) throw classify(error);
  return ((data ?? []) as { month: string; total: number | string }[]).map((r) => ({ month: r.month, total: Number(r.total) }));
}

export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase
    .from('expense_categories')
    .select('id, key, name, icon, color')
    .order('created_at', { ascending: true });
  if (error) throw classify(error);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    key: r.key as string | null,
    name: r.name as string | null,
    icon: r.icon as string,
    color: r.color as AppColor,
  }));
}

export type CategoryInput = { name: string; icon: string; color: AppColor };

// `id` generated once when the dialog opens, so a retried "Lưu" never makes a second category.
export async function saveExpenseCategory(id: string, isNew: boolean, input: CategoryInput): Promise<void> {
  const values = { name: input.name.trim(), icon: input.icon, color: input.color };
  const { error } = isNew
    ? await supabase.from('expense_categories').upsert({ id, ...values }, { onConflict: 'id' })
    : await supabase.from('expense_categories').update(values).eq('id', id);
  if (error) throw classify(error);
}

// The expenses inside go with it (FK on delete cascade, db.md).
export async function deleteExpenseCategory(id: string): Promise<void> {
  const { error } = await supabase.from('expense_categories').delete().eq('id', id);
  if (error) throw classify(error);
}

export type BudgetData = { general: number | null; months: Record<string, number | null> };

export async function fetchBudget(): Promise<BudgetData> {
  const [settings, months] = await Promise.all([
    supabase.from('user_settings').select('monthly_budget').single(),
    supabase.from('expense_month_budgets').select('month, amount'),
  ]);
  if (settings.error) throw classify(settings.error);
  if (months.error) throw classify(months.error);
  const rows: Record<string, number | null> = {};
  for (const r of months.data ?? []) rows[r.month as string] = r.amount == null ? null : Number(r.amount);
  const general = settings.data?.monthly_budget;
  return { general: general == null ? null : Number(general), months: rows };
}

// Switch on: `amount` is the general budget and the month's own row goes away. Off: `amount` is this month's own.
export async function saveBudget(input: { month: string; amount: number | null; everyMonth: boolean }): Promise<void> {
  if (input.everyMonth) {
    const { data: auth } = await supabase.auth.getSession();
    const userId = auth.session?.user.id;
    if (!userId) throw new Error('no session');
    const saved = await supabase.from('user_settings').update({ monthly_budget: input.amount }).eq('user_id', userId);
    if (saved.error) throw classify(saved.error);
    const removed = await supabase.from('expense_month_budgets').delete().eq('month', input.month);
    if (removed.error) throw classify(removed.error);
    return;
  }
  const { error } = await supabase.from('expense_month_budgets').upsert({ month: input.month, amount: input.amount }, { onConflict: 'user_id,month' });
  if (error) throw classify(error);
}
