import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import type { WeekStart } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { weekDates } from '@/lib/calendar/week';
import { jdFromDate, MAX_YEAR, MIN_YEAR, type SolarDate } from '@/lib/lunar';
import { periodRange, shiftCursor } from './calendarNav';
import { VIEW_MODES, type ViewMode } from './ViewModeBar';

const MODE_KEY = 'calendar.viewMode';

// Tab Lịch state shared by the 4 views: which view, which day it is centred on (`cursor`),
// header title and the date range to load events for (F1).
export function useCalendarNav(timeZone: string, weekStart: WeekStart) {
  const { t } = useTranslation();
  const [today, setToday] = useState(() => todayIn(timeZone));
  const [mode, setModeState] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState<SolarDate>(today);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(todayIn(timeZone));
    });
    return () => sub.remove();
  }, [timeZone]);

  // F1: reopen the view used last; stored per device only.
  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY)
      .then((saved) => {
        if (saved && (VIEW_MODES as readonly string[]).includes(saved)) setModeState(saved as ViewMode);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((next: ViewMode) => {
    setModeState(next);
    AsyncStorage.setItem(MODE_KEY, next).catch(() => {});
  }, []);

  const go = useCallback(
    (delta: number) => {
      setCursor((c) => {
        const next = shiftCursor(mode, c, delta);
        return next.year < MIN_YEAR || next.year > MAX_YEAR ? c : next;
      });
    },
    [mode],
  );

  const goToday = useCallback(() => {
    const now = todayIn(timeZone);
    setToday(now);
    setCursor(now);
    return now;
  }, [timeZone]);

  const range = useMemo(() => periodRange(mode, cursor, weekStart), [mode, cursor, weekStart]);

  const title = useMemo(() => {
    if (mode === 'week') {
      const days = weekDates(cursor, weekStart);
      const first = days[0];
      const last = days[6];
      const from = first.month === last.month ? `${first.day}` : `${first.day}/${first.month}`;
      return t('calendar.weekTitle', { range: `${from} – ${last.day}/${last.month}` });
    }
    if (mode === 'day') {
      const weekday = (jdFromDate(cursor) + 1) % 7;
      return `${t(`calendar.weekdaysLong.${weekday}`)}, ${cursor.day}/${cursor.month}`;
    }
    return t('calendar.monthTitle', { month: t(`calendar.months.${cursor.month}`), year: cursor.year });
  }, [mode, cursor, weekStart, t]);

  return { today, mode, setMode, cursor, setCursor, go, goToday, range, title };
}
