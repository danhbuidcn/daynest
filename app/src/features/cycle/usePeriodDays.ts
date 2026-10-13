import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { resyncReminders } from '@/features/reminders/reminderSync';
import { addMonths, isoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import * as api from './api';

export const PERIOD_DAYS_KEY = 'periodDays';

// Days with a period over the last 12 months — enough for the 6 cycles the prediction averages.
export function usePeriodDays(timeZone: string, enabled = true) {
  const today = todayIn(timeZone);
  const from = addMonths(today.year, today.month, -api.PERIOD_LOAD_MONTHS);
  const fromIso = isoDate({ ...from, day: 1 });
  return useQuery({
    queryKey: [PERIOD_DAYS_KEY, fromIso],
    queryFn: () => api.fetchPeriodDays(fromIso),
    enabled,
  });
}

export function useSavePeriodDays() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { add: string[]; remove: string[] }) => api.savePeriodDays(vars.add, vars.remove),
    onSuccess: () => {
      void resyncReminders();
      return queryClient.invalidateQueries({ queryKey: [PERIOD_DAYS_KEY] });
    },
  });
}
