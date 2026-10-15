import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { PopupHeader } from '@/components/PopupHeader';
import { parseIsoDate, weekdayOf } from '@/lib/calendar/monthGrid';
import { formatVnd, sumAmounts, type PeriodMode } from '@/lib/expenses';
import { groupByDay } from '@/lib/expenses/groupByDay';
import { makeStyles, space, useTheme } from '@/theme';
import { categoryName, type Expense, type ExpenseCategory } from './expense';
import { CategoryIcon } from './ExpenseSummary';

// Spec S6 §10: tap a category → its expenses in the viewed period, grouped by day.
export function CategoryExpensesDialog({
  category,
  expenses,
  mode,
  periodLabel,
  canAdd,
  onClose,
  onAdd,
  onPress,
}: {
  category: ExpenseCategory | undefined;
  expenses: readonly Expense[];
  mode: PeriodMode;
  periodLabel: string;
  canAdd: boolean;
  onClose: () => void;
  onAdd: () => void;
  onPress: (e: Expense) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const groups = category ? groupByDay(expenses, category.id) : [];
  const total = sumAmounts(groups.flatMap((g) => g.items));

  return (
    <DialogShell visible={!!category} onClose={onClose} large>
      <PopupHeader
        onClose={onClose}
        onAdd={canAdd ? onAdd : undefined}
        title={
          <View style={styles.title}>
            <CategoryIcon category={category} size={24} />
            <AppText variant="heading" numberOfLines={1} style={styles.flex}>
              {categoryName(t, category)}
            </AppText>
          </View>
        }
      />
      <AppText variant="caption" color={colors.textMuted} style={styles.center}>
        {periodLabel}
      </AppText>
      <AppText variant="title" style={[styles.center, styles.total]}>
        {formatVnd(total)}
      </AppText>
      <ScrollView style={styles.list}>
        {groups.map((g) => {
          const d = parseIsoDate(g.date);
          return (
            <View key={g.date}>
              {mode !== 'day' ? (
                <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.dayLine}>
                  {`${t(`calendar.weekdays.${weekdayOf(d)}`)}, ${d.day}/${d.month} · ${formatVnd(g.total)}`}
                </AppText>
              ) : null}
              {g.items.map((e) => (
                <Pressable key={e.id} accessibilityRole="button" onPress={() => onPress(e)} style={styles.row}>
                  <AppText numberOfLines={1} color={e.note ? colors.text : colors.textMuted} style={styles.grow}>
                    {e.note || t('expenses.noNote')}
                  </AppText>
                  {e.recurrenceId ? <Icon name="repeat" size={16} color={colors.textMuted} /> : null}
                  <AppText weight="bold">{formatVnd(e.amount)}</AppText>
                </Pressable>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </DialogShell>
  );
}

const useStyles = makeStyles(() => ({
  title: { flexDirection: 'row', alignItems: 'center', gap: space.sm, justifyContent: 'center' },
  flex: { flexShrink: 1 },
  grow: { flex: 1 },
  center: { textAlign: 'center' },
  total: { marginBottom: space.sm },
  list: { maxHeight: 420 },
  dayLine: { paddingTop: space.md, paddingBottom: space.xs },
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: space.md },
}));
