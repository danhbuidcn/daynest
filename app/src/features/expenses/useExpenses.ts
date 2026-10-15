import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { isoDate } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import * as api from './api';

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
