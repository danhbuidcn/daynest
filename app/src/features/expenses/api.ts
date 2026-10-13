import { ForbiddenError } from '@/features/events/api';
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

export async function fetchExpenses(from: string, to: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, category_id, amount, spent_on, note, updated_at')
    .gte('spent_on', from)
    .lte('spent_on', to)
    .order('spent_on', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(PERIOD_LIMIT);
  if (error) throw classify(error);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    categoryId: r.category_id as string,
    amount: Number(r.amount),
    spentOn: r.spent_on as string,
    note: r.note as string,
    updatedAt: r.updated_at as string,
  }));
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
