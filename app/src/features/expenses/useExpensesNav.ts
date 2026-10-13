import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { weekdayOf, type WeekStart } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { PERIOD_MODES, periodRange, shiftPeriod, type PeriodMode } from '@/lib/expenses';
import { MAX_YEAR, MIN_YEAR, type SolarDate } from '@/lib/lunar';

const MODE_KEY = 'expenses.periodMode';

// Tab Chi tiêu: which period mode, the day it is centred on (`cursor`), its title and date range.
export function useExpensesNav(timeZone: string, weekStart: WeekStart) {
  const { t } = useTranslation();
  const [today, setToday] = useState(() => todayIn(timeZone));
  const [mode, setModeState] = useState<PeriodMode>('month');
  const [cursor, setCursor] = useState<SolarDate>(today);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setToday(todayIn(timeZone));
    });
    return () => sub.remove();
  }, [timeZone]);

  // Spec: Tháng by default, then the mode used last on this device.
  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY)
      .then((saved) => {
        if (saved && (PERIOD_MODES as readonly string[]).includes(saved)) setModeState(saved as PeriodMode);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((next: PeriodMode) => {
    setModeState(next);
    AsyncStorage.setItem(MODE_KEY, next).catch(() => {});
  }, []);

  const go = useCallback(
    (delta: number) => {
      setCursor((c) => {
        const next = shiftPeriod(mode, c, delta);
        return next.year < MIN_YEAR || next.year > MAX_YEAR ? c : next;
      });
    },
    [mode],
  );

  const goCurrent = useCallback(() => {
    const now = todayIn(timeZone);
    setToday(now);
    setCursor(now);
  }, [timeZone]);

  const range = useMemo(() => periodRange(mode, cursor, weekStart), [mode, cursor, weekStart]);

  const title = useMemo(() => {
    if (mode === 'week') {
      const { from, to } = range;
      const start = from.month === to.month ? `${from.day}` : `${from.day}/${from.month}`;
      return t('calendar.weekTitle', { range: `${start} – ${to.day}/${to.month}` });
    }
    if (mode === 'day') return `${t(`calendar.weekdaysLong.${weekdayOf(cursor)}`)}, ${cursor.day}/${cursor.month}`;
    return t('calendar.monthTitle', { month: t(`calendar.months.${cursor.month}`), year: cursor.year });
  }, [mode, cursor, range, t]);

  return { today, mode, setMode, cursor, setCursor, go, goCurrent, range, title };
}
