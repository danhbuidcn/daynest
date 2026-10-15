import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { LoadErrorCard } from '@/components/LoadError';
import { ScreenHeader } from '@/components/ScreenHeader';
import { categoryName, type ExpenseCategory } from '@/features/expenses/expense';
import { CategoryIcon } from '@/features/expenses/ExpenseSummary';
import { useRecurrences } from '@/features/expenses/useRecurrences';
import { useExpenseCategories } from '@/features/expenses/useExpenses';
import { loadError } from '@/features/network/loadError';
import { useOnline } from '@/features/network/useOnline';
import { formatVnd } from '@/lib/expenses';
import { makeStyles, space, useTheme } from '@/theme';

// Spec S6 §7 "Quản lý": rules in order of the next date · tap = edit · button = new monthly rule.
export default function RecurrencesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const { canWrite } = useOnline();
  const query = useRecurrences();
  const categories = new Map<string, ExpenseCategory>((useExpenseCategories().data ?? []).map((c) => [c.id, c]));
  const failure = loadError(query);
  const rules = query.data;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader title={t('expenses.recurring.title')} onBack={() => router.back()} compact />
      <ScrollView contentContainerStyle={styles.content}>
        {failure ? (
          <LoadErrorCard error={failure} onRetry={() => void query.refetch()} />
        ) : rules && rules.length === 0 ? (
          <AppText color={colors.textMuted} style={styles.empty}>
            {t('expenses.recurring.empty')}
          </AppText>
        ) : rules ? (
          <Card>
            {rules.map((r, i) => {
              const category = categories.get(r.categoryId);
              const [, month, day] = r.nextOn.split('-');
              return (
                <Pressable
                  key={r.id}
                  accessibilityRole="button"
                  onPress={() => router.push({ pathname: '/expense/recurrence', params: { id: r.id } })}
                  style={[styles.row, i > 0 && styles.divider]}>
                  <CategoryIcon category={category} />
                  <View style={styles.flex}>
                    <AppText numberOfLines={1}>{r.note || categoryName(t, category)}</AppText>
                    <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                      {t('expenses.recurring.next', { frequency: t(`expenses.form.repeatOptions.${r.frequency}`), date: `${day}/${month}` })}
                    </AppText>
                  </View>
                  <AppText weight="bold">{formatVnd(r.amount)}</AppText>
                  <Icon name="chevron" size={18} color={colors.textMuted} />
                </Pressable>
              );
            })}
          </Card>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label={t('expenses.recurring.add')}
          icon={<Icon name="plus" size={20} color={colors.white} />}
          disabled={!canWrite}
          onPress={() => router.push({ pathname: '/expense/edit', params: { repeat: 'monthly' } })}
        />
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xl, flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: space.xl },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  flex: { flex: 1, minWidth: 0 },
  footer: { paddingHorizontal: space.lg, paddingBottom: space.lg },
}));
