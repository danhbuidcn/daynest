import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { LoadErrorCard, StaleLine } from '@/components/LoadError';
import { ScreenBackground } from '@/components/ScreenBackground';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedBar } from '@/components/SegmentedBar';
import { Skeleton } from '@/components/Skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { CalendarHeader } from '@/features/calendar/CalendarHeader';
import { MonthYearPicker } from '@/features/calendar/MonthYearPicker';
import type { Expense, ExpenseCategory } from '@/features/expenses/expense';
import { DailyChart, MonthlyChart } from '@/features/expenses/ExpenseCharts';
import { CategoryTotalsCard, ExpenseListCard, TotalCard } from '@/features/expenses/ExpenseSummary';
import { CategoryExpensesDialog } from '@/features/expenses/CategoryExpensesDialog';
import { BudgetBar } from '@/features/expenses/BudgetBar';
import { BudgetDialog } from '@/features/expenses/BudgetDialog';
import { MiniCalendarPicker } from '@/features/expenses/MiniCalendarPicker';
import { useExpenseCategories, useExpensesInRange, useMonthlyTotals, usePrefetchExpenses } from '@/features/expenses/useExpenses';
import { useBudget } from '@/features/expenses/useBudget';
import { usePlusAction } from '@/features/tabs/plusAction';
import { useGenerateRecurring } from '@/features/expenses/useGenerateRecurring';
import { useExpensesNav } from '@/features/expenses/useExpensesNav';
import { useOnline } from '@/features/network/useOnline';
import { loadError } from '@/features/network/loadError';
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
import { budgetForMonth, monthKey } from '@/lib/expenses/budget';
import type { SolarDate } from '@/lib/lunar';
import { makeStyles, radius, space, useTheme } from '@/theme';

const MODES: readonly PeriodMode[] = ['day', 'week', 'month'];

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const { settings } = useAuth();
  const { canWrite } = useOnline();
  const nav = useExpensesNav(settings.timeZone, settings.weekStart);
  const { mode, cursor } = nav;
  useGenerateRecurring(settings.timeZone);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  // The category pop-up closes while a form is open (a Modal would sit on top of it) and comes back
  // when this screen is in front again.
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const reopenCategory = useRef<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (reopenCategory.current) setOpenCategory(reopenCategory.current);
      reopenCategory.current = null;
    }, []),
  );
  const budgetQuery = useBudget();
  const budget = useMemo(
    () => (budgetQuery.data ? budgetForMonth(budgetQuery.data.general, budgetQuery.data.months, monthKey(cursor.year, cursor.month)) : null),
    [budgetQuery.data, cursor.year, cursor.month],
  );

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
  usePlusAction(addExpense);
  const editExpense = (e: Expense) => router.push({ pathname: '/expense/edit', params: { id: e.id, date: e.spentOn } });
  const addToCategory = () => {
    if (!openCategory) return;
    reopenCategory.current = openCategory;
    router.push({
      pathname: '/expense/edit',
      params: { date: isoDate(defaultSpentOn(mode, cursor, nav.today, settings.weekStart)), category: openCategory },
    });
    setOpenCategory(null);
  };

  const modeOptions = MODES.map((m) => ({ value: m, label: t(`expenses.modes.${m}`) }));
  const currentLabel = t(`expenses.current.${mode}`);
  const pickCurrent = () => {
    nav.goCurrent();
    setPickerOpen(false);
  };

  let body;
  const failure = loadError(expensesQuery);
  if (failure) {
    body = <LoadErrorCard error={failure} onRetry={() => void expensesQuery.refetch()} />;
  } else if (!expenses) {
    body = (
      <View style={styles.skeleton}>
        <Skeleton height={64} style={styles.skeletonTotal} />
        <View style={styles.skeletonBars}>
          {[40, 90, 60, 120, 80, 50, 100].map((h, i) => (
            <Skeleton key={i} height={h} width={28} />
          ))}
        </View>
      </View>
    );
  } else if (expenses.length === 0) {
    body = <Empty text={t('expenses.empty')} action={t('expenses.add')} onAction={addExpense} plus />;
  } else {
    body = (
      <ScrollView contentContainerStyle={styles.list}>
        <TotalCard total={sumAmounts(expenses)}>
          {mode === 'month' && budgetQuery.data ? <BudgetBar spent={sumAmounts(expenses)} budget={budget} onPress={() => setBudgetOpen(true)} /> : null}
        </TotalCard>
        {mode !== 'day' ? <DailyChart mode={mode} range={nav.range} expenses={expenses} today={nav.today} onDay={openDay} /> : null}
        {mode === 'month' && months ? (
          <MonthlyChart cursor={cursor} totals={months} onMonth={(m) => nav.setCursor({ ...m, day: 1 })} />
        ) : null}
        <CategoryTotalsCard totals={totals} categories={categories} onPress={setOpenCategory} />
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
      {!failure && expensesQuery.isError ? <StaleLine onRetry={() => void expensesQuery.refetch()} /> : null}
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
      <CategoryExpensesDialog
        category={openCategory ? categories.get(openCategory) : undefined}
        expenses={expenses ?? []}
        mode={mode}
        periodLabel={nav.title}
        canAdd={canWrite}
        onClose={() => setOpenCategory(null)}
        onAdd={addToCategory}
        onPress={(e) => {
          reopenCategory.current = e.categoryId;
          setOpenCategory(null);
          editExpense(e);
        }}
      />
      <BudgetDialog visible={budgetOpen} year={cursor.year} month={cursor.month} current={budget} onClose={() => setBudgetOpen(false)} />
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
  skeleton: { gap: space.xl, paddingVertical: space.lg, paddingHorizontal: space.lg },
  skeletonTotal: { borderRadius: radius.card },
  skeletonBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: 40, paddingBottom: 40 },
  bubble: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
}));
