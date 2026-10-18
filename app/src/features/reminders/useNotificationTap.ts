import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { launchTapData, onNotificationTap } from '@/lib/notifications/scheduler';

// Tapping a reminder opens that lap's detail screen (F3) — an event's, or a todo's (S5); a period reminder opens the calendar on the predicted day; a daily digest opens the todo list. Mounted inside the signed-in tabs so the
// router is ready and the detail screen can load its data.
export function useNotificationTap() {
  const router = useRouter();

  useEffect(() => {
    const open = (data: Record<string, unknown> | null) => {
      if (typeof data?.cycleDate === 'string') {
        router.push({ pathname: '/(tabs)/calendar', params: { date: data.cycleDate } });
        return;
      }
      if (typeof data?.digestDate === 'string') {
        router.push({ pathname: '/(tabs)/manage', params: { digest: String(Date.now()) } });
        return;
      }
      const todoId = data?.todoId;
      const id = todoId ?? data?.eventId;
      const occurrenceDate = data?.occurrenceDate;
      if (typeof id !== 'string' || typeof occurrenceDate !== 'string') return;
      router.push({ pathname: todoId ? '/todo/[id]' : '/event/[id]', params: { id, occurrenceDate } });
    };
    launchTapData()
      .then(open)
      .catch(() => {});
    return onNotificationTap(open);
  }, [router]);
}
