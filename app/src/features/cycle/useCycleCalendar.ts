import { useCallback, useMemo } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { isoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { cycleOnDay, groupPeriods, periodLength, predictPeriods, type CycleDay } from '@/lib/cycle';
import type { SolarDate } from '@/lib/lunar';
import { usePeriodDays } from './usePeriodDays';

// The calendar's view of the cycle: `dayOf` is null for every day while tracking is off.
export function useCycleCalendar() {
  const { settings } = useAuth();
  const enabled = settings.cycleEnabled;
  const query = usePeriodDays(settings.timeZone, enabled);
  const today = isoDate(todayIn(settings.timeZone));
  const days = query.data;

  const model = useMemo(() => {
    if (!enabled || !days) return null;
    const periods = groupPeriods(days);
    const length = periodLength(periods, settings.periodLength);
    const predicted = predictPeriods(periods, today, { cycleLength: settings.cycleLength, periodLength: length });
    return { periods, predicted };
  }, [enabled, days, today, settings.cycleLength, settings.periodLength]);

  // Mark on a calendar cell.
  const dayOf = useCallback((d: SolarDate): CycleDay | null => (model ? cycleOnDay(isoDate(d), model.periods, model.predicted, today) : null), [model, today]);

  // Line for the day popup: today also gets the countdown to the next period.
  const summaryOf = useCallback(
    (d: SolarDate): CycleDay | null => {
      const c = dayOf(d);
      const next = model?.predicted[0];
      if (c || !next || isoDate(d) !== today) return c;
      return cycleOnDay(next.start, [], model.predicted, today);
    },
    [dayOf, model, today],
  );

  return { enabled, dayOf, summaryOf };
}
