import { ConflictError, ForbiddenError } from '@/features/events/api';
import type { AppColor } from '@/lib/colors';
import { supabase } from '@/lib/supabase';
import type { Expense, ExpenseCategory } from './expense';

// db.md: one period never holds more than this many rows.
const PERIOD_LIMIT = 1000;

function classify(error: unknown): Error {
  if (error && typeof error === 'object' && (error as { code?: string }).code === '42501') return new ForbiddenError();
  if (error instanceof Error) return error;
  return new Error(JSON.stringify(error));
}

const COLUMNS = 'id, category_id, amount, spent_on, note, updated_at';

type ExpenseTableRow = { id: string; category_id: string; amount: number | string; spent_on: string; note: string; updated_at: string };

function toExpense(r: ExpenseTableRow): Expense {
  return { id: r.id, categoryId: r.category_id, amount: Number(r.amount), spentOn: r.spent_on, note: r.note, updatedAt: r.updated_at };
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
