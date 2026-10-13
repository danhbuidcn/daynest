import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
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
export function useExpensesInRange(range: Range) {
  return useQuery({ ...expensesQueryOptions(range), placeholderData: keepPreviousData });
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
