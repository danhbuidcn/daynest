import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { budgetProgress } from '@/lib/expenses/budget';
import { formatVnd } from '@/lib/expenses';
import { makeStyles, radius, space, useTheme } from '@/theme';

// Under "Tổng chi" in Chi tiêu › Tháng (spec S6 §6). Pressing it opens the budget dialog.
export function BudgetBar({
  spent,
  budget,
  onPress,
}: {
  spent: number;
  budget: { amount: number; kind: 'general' | 'month' } | null;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  if (!budget) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.setButton}>
        <AppText weight="bold" color={colors.primaryDark} style={styles.setText}>
          {t('expenses.budget.set')}
        </AppText>
      </Pressable>
    );
  }
  const { percent, remaining, level } = budgetProgress(spent, budget.amount);
  const fill = level === 'over' ? colors.error : level === 'warn' ? colors.warning : colors.primary;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.bar}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(percent, 100)}%`, backgroundColor: fill }]} />
      </View>
      <View style={styles.line}>
        <AppText variant="caption" color={colors.textMuted} numberOfLines={1} style={styles.grow}>
          {t(budget.kind === 'month' ? 'expenses.budget.usedMonth' : 'expenses.budget.used', { percent, amount: formatVnd(budget.amount) })}
        </AppText>
        <AppText variant="caption" weight="bold" color={level === 'over' ? colors.error : colors.text}>
          {level === 'over' ? t('expenses.budget.over', { amount: formatVnd(-remaining) }) : t('expenses.budget.left', { amount: formatVnd(remaining) })}
        </AppText>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  bar: { alignSelf: 'stretch', gap: space.xs, marginTop: space.sm },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  grow: { flex: 1 },
  setButton: { alignSelf: 'center', marginTop: space.sm, paddingVertical: space.xs, paddingHorizontal: space.lg, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  setText: { fontSize: 14, lineHeight: 20 },
}));
