import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedBar } from '@/components/SegmentedBar';
import { useAuth } from '@/features/auth/AuthProvider';
import { CalendarHeader } from '@/features/calendar/CalendarHeader';
import { MonthYearPicker } from '@/features/calendar/MonthYearPicker';
import type { Expense, ExpenseCategory } from '@/features/expenses/expense';
import { DailyChart, MonthlyChart } from '@/features/expenses/ExpenseCharts';
import { CategoryTotalsCard, ExpenseListCard, TotalCard } from '@/features/expenses/ExpenseSummary';
import { MiniCalendarPicker } from '@/features/expenses/MiniCalendarPicker';
import { useExpenseCategories, useExpensesInRange, useMonthlyTotals, usePrefetchExpenses } from '@/features/expenses/useExpenses';
import { useExpensesNav } from '@/features/expenses/useExpensesNav';
import {
  defaultSpentOn,
  monthlyTotals,
  periodRange,
  recentMonthsRange,
  shiftPeriod,
  sumAmounts,
  totalsByCategory,
  type PeriodMode,
} from '@/lib/expenses';
import { isoDate } from '@/lib/calendar/monthGrid';
import type { SolarDate } from '@/lib/lunar';
import { makeStyles, radius, space, useTheme } from '@/theme';

const MODES: readonly PeriodMode[] = ['day', 'week', 'month'];

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const { settings } = useAuth();
  const nav = useExpensesNav(settings.timeZone, settings.weekStart);
  const { mode, cursor } = nav;
  const [pickerOpen, setPickerOpen] = useState(false);

  const expensesQuery = useExpensesInRange(nav.range);
  const categoriesQuery = useExpenseCategories();
  const monthlyRange = useMemo(() => recentMonthsRange(cursor), [cursor]);
  const monthlyQuery = useMonthlyTotals(monthlyRange, mode === 'month');
  const adjacentRanges = useMemo(
    () => [-1, 1].map((d) => periodRange(mode, shiftPeriod(mode, cursor, d), settings.weekStart)),
    [mode, cursor, settings.weekStart],
  );
  const adjacentMonthlyRanges = useMemo(
    () => (mode === 'month' ? [-1, 1].map((d) => recentMonthsRange(shiftPeriod('month', cursor, d))) : []),
    [mode, cursor],
  );
  usePrefetchExpenses(adjacentRanges, adjacentMonthlyRanges, !expensesQuery.isFetching);

  const expenses = expensesQuery.data;
  const categories = useMemo(
    () => new Map<string, ExpenseCategory>((categoriesQuery.data ?? []).map((c) => [c.id, c])),
    [categoriesQuery.data],
  );
  const totals = useMemo(() => totalsByCategory(expenses ?? []), [expenses]);
  const months = useMemo(() => (monthlyQuery.data ? monthlyTotals(monthlyQuery.data, cursor) : null), [monthlyQuery.data, cursor]);

  const openDay = (day: SolarDate) => {
    nav.setMode('day');
    nav.setCursor(day);
  };

  const addExpense = () =>
    router.push({
      pathname: '/expense/edit',
      params: { date: isoDate(defaultSpentOn(mode, cursor, nav.today, settings.weekStart)) },
    });
  const editExpense = (e: Expense) => router.push({ pathname: '/expense/edit', params: { id: e.id, date: e.spentOn } });

  const modeOptions = MODES.map((m) => ({ value: m, label: t(`expenses.modes.${m}`) }));
  const currentLabel = t(`expenses.current.${mode}`);
  const pickCurrent = () => {
    nav.goCurrent();
    setPickerOpen(false);
  };

  let body;
  if (!expenses) {
    body = expensesQuery.isError ? (
      <Empty text={t('expenses.loadFailed')} action={t('expenses.retry')} onAction={() => void expensesQuery.refetch()} />
    ) : (
      <ActivityIndicator color={colors.primary} style={styles.loading} />
    );
  } else if (expenses.length === 0) {
    body = <Empty text={t('expenses.empty')} action={t('expenses.add')} onAction={addExpense} plus />;
  } else {
    body = (
      <ScrollView contentContainerStyle={styles.list}>
        <TotalCard total={sumAmounts(expenses)} />
        {mode !== 'day' ? <DailyChart mode={mode} range={nav.range} expenses={expenses} today={nav.today} onDay={openDay} /> : null}
        {mode === 'month' && months ? (
          <MonthlyChart cursor={cursor} totals={months} onMonth={(m) => nav.setCursor({ ...m, day: 1 })} />
        ) : null}
        <CategoryTotalsCard totals={totals} categories={categories} />
        {mode === 'day' ? <ExpenseListCard expenses={expenses} categories={categories} onPress={editExpense} /> : null}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenBackground />
      <ScreenHeader
        compact
        title={t('tabs.expenses')}
        action={
          <Pressable accessibilityRole="button" accessibilityLabel={t('expenses.categories')} onPress={() => router.push('/expense/categories')} style={styles.tagButton}>
            <Icon name="tag" size={20} color={colors.primaryDark} />
          </Pressable>
        }
      />
      <SegmentedBar options={modeOptions} value={mode} onChange={nav.setMode} />
      <CalendarHeader title={nav.title} onPrev={() => nav.go(-1)} onNext={() => nav.go(1)} onTitle={() => setPickerOpen(true)} />
      <View style={styles.body}>{body}</View>
      {mode === 'month' ? (
        <MonthYearPicker
          visible={pickerOpen}
          year={cursor.year}
          month={cursor.month}
          onClose={() => setPickerOpen(false)}
          onSelect={(year, month) => {
            nav.setCursor({ year, month, day: 1 });
            setPickerOpen(false);
          }}
          current={{ label: currentLabel, onPress: pickCurrent }}
        />
      ) : (
        <MiniCalendarPicker
          visible={pickerOpen}
          mode={mode}
          selected={cursor}
          weekStart={settings.weekStart}
          currentLabel={currentLabel}
          onClose={() => setPickerOpen(false)}
          onSelect={(date) => {
            nav.setCursor(date);
            setPickerOpen(false);
          }}
          onCurrent={pickCurrent}
        />
      )}
    </SafeAreaView>
  );
}

function Empty({ text, action, onAction, plus }: { text: string; action: string; onAction: () => void; plus?: boolean }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.empty}>
      <View style={styles.bubble}>
        <Icon name="wallet" size={36} color={colors.primaryDark} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {text}
      </AppText>
      <Button label={action} onPress={onAction} icon={plus ? <Icon name="plus" size={20} color={colors.white} /> : undefined} />
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1 },
  tagButton: { width: 36, height: 36, borderRadius: radius.icon + 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  list: { gap: space.sm, paddingHorizontal: space.lg, paddingBottom: 120 },
  loading: { marginVertical: space.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: 40, paddingBottom: 40 },
  bubble: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
}));
