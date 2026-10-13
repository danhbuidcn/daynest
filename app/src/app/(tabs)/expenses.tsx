import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedBar } from '@/components/SegmentedBar';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { CalendarHeader } from '@/features/calendar/CalendarHeader';
import { MonthYearPicker } from '@/features/calendar/MonthYearPicker';
import type { ExpenseCategory } from '@/features/expenses/expense';
import { CategoryTotalsCard, ExpenseListCard, TotalCard } from '@/features/expenses/ExpenseSummary';
import { MiniCalendarPicker } from '@/features/expenses/MiniCalendarPicker';
import { useExpenseCategories, useExpensesInRange, usePrefetchExpenses } from '@/features/expenses/useExpenses';
import { useExpensesNav } from '@/features/expenses/useExpensesNav';
import { periodRange, shiftPeriod, sumAmounts, totalsByCategory, type PeriodMode } from '@/lib/expenses';
import { colors, radius, space } from '@/theme';

const MODES: readonly PeriodMode[] = ['day', 'week', 'month'];

export default function ExpensesScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const { settings } = useAuth();
  const nav = useExpensesNav(settings.timeZone, settings.weekStart);
  const { mode, cursor } = nav;
  const [pickerOpen, setPickerOpen] = useState(false);

  const expensesQuery = useExpensesInRange(nav.range);
  const categoriesQuery = useExpenseCategories();
  const adjacentRanges = useMemo(
    () => [-1, 1].map((d) => periodRange(mode, shiftPeriod(mode, cursor, d), settings.weekStart)),
    [mode, cursor, settings.weekStart],
  );
  usePrefetchExpenses(adjacentRanges, !expensesQuery.isFetching);

  const expenses = expensesQuery.data;
  const categories = useMemo(
    () => new Map<string, ExpenseCategory>((categoriesQuery.data ?? []).map((c) => [c.id, c])),
    [categoriesQuery.data],
  );
  const totals = useMemo(() => totalsByCategory(expenses ?? []), [expenses]);

  // Placeholders until the expense form (step 5) and the categories screen (step 6) exist.
  const comingSoon = () => toast(t('comingSoon'));

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
    body = <Empty text={t('expenses.empty')} action={t('expenses.add')} onAction={comingSoon} plus />;
  } else {
    body = (
      <ScrollView contentContainerStyle={styles.list}>
        <TotalCard total={sumAmounts(expenses)} />
        <CategoryTotalsCard totals={totals} categories={categories} />
        {mode === 'day' ? <ExpenseListCard expenses={expenses} categories={categories} onPress={comingSoon} /> : null}
      </ScrollView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader
        compact
        title={t('tabs.expenses')}
        action={
          <Pressable accessibilityRole="button" accessibilityLabel={t('expenses.categories')} onPress={comingSoon} style={styles.tagButton}>
            <Icon name="tag" size={24} color={colors.primaryDark} />
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  tagButton: { width: 40, height: 40, borderRadius: radius.icon + 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  list: { gap: space.md, paddingHorizontal: space.lg, paddingBottom: 120 },
  loading: { marginVertical: space.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: 40, paddingBottom: 40 },
  bubble: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
