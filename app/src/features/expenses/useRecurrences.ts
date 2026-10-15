import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as api from './recurrenceApi';

export const RECURRENCES_KEY = 'expenseRecurrences';

export function useRecurrences() {
  return useQuery({ queryKey: [RECURRENCES_KEY], queryFn: api.fetchRecurrences });
}

export function useRecurrenceWrites() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: [RECURRENCES_KEY] });
  const save = useMutation({
    mutationFn: ({ id, updatedAt, input }: { id: string; updatedAt: string | null; input: api.RecurrenceInput }) =>
      api.updateRecurrence(id, updatedAt, input),
    onSuccess,
  });
  const remove = useMutation({ mutationFn: api.deleteRecurrence, onSuccess });
  return { save, remove };
}
