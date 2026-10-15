import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BarChart } from '@/components/BarChart';
import { sameDay, weekdayOf } from '@/lib/calendar/monthGrid';
import { addDays } from '@/lib/calendar/week';
import { compactVnd, dailyTotals, formatVnd, isMonthAxisDay, recentMonths } from '@/lib/expenses';
import type { SolarDate } from '@/lib/lunar';
import type { Expense } from './expense';

// Ranges of the month chart: whole month, then 10-day blocks — fewer, wider bars that all show their amount.
function rangeBounds(dayCount: number): [number, number][] {
  const out: [number, number][] = [[0, dayCount - 1]];
  for (let from = 0; from < dayCount; from += 10) out.push([from, Math.min(from + 9, dayCount - 1)]);
  return out;
}

// "Theo ngày" (Tuần, Tháng): one bar per day, today in `primaryDark`. Tap → shows that day under the
// title; tap the shown day again → opens it.
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
  const [rangeIndex, setRangeIndex] = useState(0);
  const [picked, setPicked] = useState<SolarDate | null>(null);
  const allValues = useMemo(() => dailyTotals(expenses, range.from, range.to), [expenses, range]);
  const allDays = useMemo(() => allValues.map((_, i) => addDays(range.from, i)), [allValues, range.from]);
  const bounds = useMemo(() => (mode === 'month' ? rangeBounds(allDays.length) : null), [mode, allDays.length]);
  const activeRange = bounds && rangeIndex < bounds.length ? rangeIndex : 0; // February has no 21–31
  const [start, end] = bounds?.[activeRange] ?? [0, allDays.length - 1];
  const values = allValues.slice(start, end + 1);
  const days = allDays.slice(start, end + 1);

  const pickedIndex = picked ? days.findIndex((d) => sameDay(d, picked)) : -1;
  const shown = pickedIndex >= 0 ? pickedIndex : days.findIndex((d) => sameDay(d, today));
  const showAll = days.length <= 10;
  const labels = days.map((d) =>
    mode === 'week' ? t(`calendar.weekdays.${weekdayOf(d)}`) : showAll || isMonthAxisDay(d.day, allDays.length) ? String(d.day) : '',
  );
  const describe = (i: number) => `${days[i].day}/${days[i].month}: ${formatVnd(values[i])}`;
  const readout = shown >= 0 ? `${t(`calendar.weekdays.${weekdayOf(days[shown])}`)}, ${describe(shown).replace(':', ' ·')}` : undefined;
  const chips = bounds?.map(([a, b], i) => ({
    label: i === 0 ? t('expenses.rangeAll') : `${a + 1}–${b + 1}`,
    active: i === activeRange,
    onPress: () => setRangeIndex(i),
  }));
  return (
    <BarChart
      title={t('expenses.byDay')}
      values={values}
      labels={labels}
      highlight={shown}
      formatTop={compactVnd}
      showAll={showAll}
      readout={readout}
      chips={chips}
      describe={describe}
      onPress={(i) => (i === pickedIndex ? onDay(days[i]) : setPicked(days[i]))}
    />
  );
}

// "6 tháng gần đây" (Tháng): the viewed month is the last bar, in `primaryDark`. Tap → shows that month
// under the title; tap it again → opens it.
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
  const months = useMemo(() => recentMonths(cursor), [cursor]);
  const [picked, setPicked] = useState<number | null>(null);
  const shown = picked ?? months.length - 1;
  const describe = (i: number) =>
    `${t('calendar.monthTitle', { month: t(`calendar.months.${months[i].month}`), year: months[i].year })} · ${formatVnd(totals[i])}`;
  return (
    <BarChart
      title={t('expenses.recentMonths')}
      values={totals}
      labels={months.map((m) => t(`calendar.monthsShort.${m.month}`))}
      highlight={shown}
      formatTop={compactVnd}
      showAll
      readout={describe(shown)}
      describe={describe}
      onPress={(i) => (i === picked ? onMonth(months[i]) : setPicked(i))}
    />
  );
}
