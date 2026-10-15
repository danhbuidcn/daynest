import { useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useOnline } from '@/features/network/useOnline';
import { isoDate } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { generateDue } from './recurrenceApi';
import { EXPENSES_KEY } from './useExpenses';

// Spec S6 §7: each time Chi tiêu comes into view and when the app returns from the background, write the
// expenses that came due; new rows → reload the lists. A failure is silent: the next call retries.
export function useGenerateRecurring(timeZone: string) {
  const queryClient = useQueryClient();
  const { canWrite } = useOnline();
  const running = useRef(false);

  const run = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      const written = await generateDue(isoDate(todayIn(timeZone)));
      if (written > 0) await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
    } catch {
      // offline or server fault: try again on the next focus
    } finally {
      running.current = false;
    }
  }, [queryClient, timeZone]);

    useFocusEffect(
    useCallback(() => {
      if (canWrite) void run();
    }, [canWrite, run]),
  );

  useEffect(() => {
    if (!canWrite) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void run();
    });
    return () => sub.remove();
  }, [canWrite, run]);
}
