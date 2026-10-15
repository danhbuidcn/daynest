import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './api';

export const BUDGET_KEY = 'expenseBudget';

export function useBudget() {
  return useQuery({ queryKey: [BUDGET_KEY], queryFn: api.fetchBudget });
}

export function useSaveBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.saveBudget,
    onSuccess: (_, { month, amount, everyMonth }) =>
      queryClient.setQueryData<api.BudgetData>([BUDGET_KEY], (old) => {
        const prev = old ?? { general: null, months: {} };
        if (everyMonth) {
          const { [month]: _gone, ...rest } = prev.months;
          return { general: amount, months: rest };
        }
        return { ...prev, months: { ...prev.months, [month]: amount } };
      }),
  });
}
