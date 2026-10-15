import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { isoDate } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import { editCached } from '@/features/cache/editCached';
import * as api from './api';
import type { Expense } from './expense';

export const EXPENSES_KEY = 'expenses';
export const EXPENSE_CATEGORIES_KEY = 'expenseCategories';

type Range = { from: SolarDate; to: SolarDate };

function expensesQueryOptions(range: Range) {
  const from = isoDate(range.from);
  const to = isoDate(range.to);
  return { queryKey: [EXPENSES_KEY, from, to] as const, queryFn: () => api.fetchExpenses(from, to) };
}

// Under EXPENSES_KEY so saving an expense refreshes the chart too.
function monthlyTotalsQueryOptions(range: Range) {
  const from = isoDate(range.from);
  const to = isoDate(range.to);
  return { queryKey: [EXPENSES_KEY, 'monthly', from, to] as const, queryFn: () => api.fetchMonthlyTotals(from, to) };
}

// Paging keeps the last period on screen until the next one arrives (same as the calendar).
export function useExpensesInRange(range: Range, enabled = true) {
  return useQuery({ ...expensesQueryOptions(range), enabled, placeholderData: keepPreviousData });
}

export function useMonthlyTotals(range: Range, enabled: boolean) {
  return useQuery({ ...monthlyTotalsQueryOptions(range), enabled, placeholderData: keepPreviousData });
}

export function usePrefetchExpenses(ranges: Range[], monthlyRanges: Range[], enabled: boolean) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    for (const range of ranges) void queryClient.prefetchQuery(expensesQueryOptions(range));
    for (const range of monthlyRanges) void queryClient.prefetchQuery(monthlyTotalsQueryOptions(range));
  }, [queryClient, ranges, monthlyRanges, enabled]);
}

// Undoable delete (spec S6 §5): the expense leaves every loaded period at once (the 6-month totals
// reload after the write); the returned function puts the lists back.
export function hideExpense(queryClient: QueryClient, id: string): () => void {
  return editCached<unknown>(queryClient, EXPENSES_KEY, (data, key) =>
    key[1] !== 'monthly' && Array.isArray(data) ? (data as Expense[]).filter((e) => e.id !== id) : data,
  );
}

export function useExpenseCategories() {
  return useQuery({ queryKey: [EXPENSE_CATEGORIES_KEY], queryFn: api.fetchExpenseCategories });
}

// Any write refreshes every period and the 6-month chart (all under EXPENSES_KEY) in the
// background — the form closes without waiting for those reloads.
export function useExpenseWrites() {
  const queryClient = useQueryClient();
  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
  };
  const save = useMutation({
    mutationFn: ({ id, updatedAt, input }: { id: string; updatedAt?: string; input: api.ExpenseInput }) =>
      updatedAt ? api.updateExpense(id, updatedAt, input) : api.createExpense(id, input),
    onSuccess,
  });
  const remove = useMutation({ mutationFn: api.deleteExpense, onSuccess });
  return { save, remove };
}

export function useExpenseCategoryWrites() {
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: ({ id, isNew, input }: { id: string; isNew: boolean; input: api.CategoryInput }) => api.saveExpenseCategory(id, isNew, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [EXPENSE_CATEGORIES_KEY] }),
  });
  // Deleting drops the category's expenses too, so every period and chart reloads.
  const remove = useMutation({
    mutationFn: api.deleteExpenseCategory,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [EXPENSE_CATEGORIES_KEY] }),
        queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] }),
      ]),
  });
  return { save, remove };
}
