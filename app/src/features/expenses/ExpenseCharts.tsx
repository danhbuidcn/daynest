import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { BarChart } from '@/components/BarChart';
import { useToast } from '@/components/Toast';
import { sameDay, weekdayOf } from '@/lib/calendar/monthGrid';
import { addDays } from '@/lib/calendar/week';
import { compactVnd, dailyTotals, formatVnd, isMonthAxisDay, recentMonths } from '@/lib/expenses';
import type { SolarDate } from '@/lib/lunar';
import type { Expense } from './expense';

// "Theo ngày" (Tuần, Tháng): one bar per day, today in `primaryDark`, tap → that day.
export function DailyChart({
  mode,
  range,
  expenses,
  today,
  onDay,
}: {
  mode: 'week' | 'month';
  range: { from: SolarDate; to: SolarDate };
  expenses: Expense[];
  today: SolarDate;
  onDay: (day: SolarDate) => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const values = useMemo(() => dailyTotals(expenses, range.from, range.to), [expenses, range]);
  const days = useMemo(() => values.map((_, i) => addDays(range.from, i)), [values, range.from]);
  const labels = days.map((d) =>
    mode === 'week' ? t(`calendar.weekdays.${weekdayOf(d)}`) : isMonthAxisDay(d.day, days.length) ? String(d.day) : '',
  );
  const describe = (i: number) => `${days[i].day}/${days[i].month}: ${formatVnd(values[i])}`;
  return (
    <BarChart
      title={t('expenses.byDay')}
      values={values}
      labels={labels}
      highlight={days.findIndex((d) => sameDay(d, today))}
      formatTop={compactVnd}
      describe={describe}
      onPress={(i) => onDay(days[i])}
      onLongPress={(i) => toast(describe(i))}
    />
  );
}

// "6 tháng gần đây" (Tháng): the viewed month is the last bar, in `primaryDark`; tap → that month.
export function MonthlyChart({
  cursor,
  totals,
  onMonth,
}: {
  cursor: SolarDate;
  totals: number[];
  onMonth: (month: { year: number; month: number }) => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const months = useMemo(() => recentMonths(cursor), [cursor]);
  const describe = (i: number) =>
    `${t('calendar.monthTitle', { month: t(`calendar.months.${months[i].month}`), year: months[i].year })}: ${formatVnd(totals[i])}`;
  return (
    <BarChart
      title={t('expenses.recentMonths')}
      values={totals}
      labels={months.map((m) => t(`calendar.monthsShort.${m.month}`))}
      highlight={months.length - 1}
      formatTop={compactVnd}
      describe={describe}
      onPress={(i) => onMonth(months[i])}
      onLongPress={(i) => toast(describe(i))}
    />
  );
}
