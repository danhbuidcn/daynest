import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { textOn, toHex } from '@/lib/colors';
import { formatVnd, type CategoryTotal } from '@/lib/expenses';
import { colors, radius, space } from '@/theme';
import { categoryIcon, categoryName, type Expense, type ExpenseCategory } from './expense';

export function CategoryIcon({ category, size = 34 }: { category: ExpenseCategory | undefined; size?: number }) {
  const bg = toHex(category?.color ?? 'mint');
  return (
    <View style={[styles.icon, { width: size, height: size, backgroundColor: bg }]}>
      <Icon name={categoryIcon(category)} size={Math.round(size * 0.6)} color={textOn(bg)} />
    </View>
  );
}

export function TotalCard({ total }: { total: number }) {
  const { t } = useTranslation();
  return (
    <Card style={styles.total}>
      <AppText variant="caption" color={colors.textMuted}>
        {t('expenses.total')}
      </AppText>
      <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit>
        {formatVnd(total)}
      </AppText>
    </Card>
  );
}

export function CategoryTotalsCard({ totals, categories }: { totals: CategoryTotal[]; categories: Map<string, ExpenseCategory> }) {
  const { t } = useTranslation();
  return (
    <Card style={styles.byCategory}>
      <AppText variant="heading" style={styles.section}>
        {t('expenses.byCategory')}
      </AppText>
      {totals.map((c) => {
        const category = categories.get(c.categoryId);
        return (
          <View key={c.categoryId} style={styles.catRow}>
            <CategoryIcon category={category} />
            <View style={styles.grow}>
              <View style={styles.line}>
                <AppText numberOfLines={1} style={styles.grow}>
                  {categoryName(t, category)}
                </AppText>
                <AppText weight="bold">{formatVnd(c.amount)}</AppText>
              </View>
              <View style={styles.line}>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${c.percent}%`, backgroundColor: toHex(category?.color ?? 'mint') }]} />
                </View>
                <AppText variant="caption" color={colors.textMuted} style={styles.percent}>
                  {c.percent}%
                </AppText>
              </View>
            </View>
          </View>
        );
      })}
    </Card>
  );
}

export function ExpenseListCard({
  expenses,
  categories,
  onPress,
}: {
  expenses: Expense[];
  categories: Map<string, ExpenseCategory>;
  onPress: (e: Expense) => void;
}) {
  const { t } = useTranslation();
  return (
    <Card>
      {expenses.map((e, i) => {
        const category = categories.get(e.categoryId);
        return (
          <Pressable key={e.id} accessibilityRole="button" onPress={() => onPress(e)} style={[styles.expRow, i > 0 && styles.divider]}>
            <CategoryIcon category={category} />
            <View style={styles.grow}>
              <AppText numberOfLines={1}>{categoryName(t, category)}</AppText>
              {e.note ? (
                <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {e.note}
                </AppText>
              ) : null}
            </View>
            <AppText weight="bold">{formatVnd(e.amount)}</AppText>
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  icon: { borderRadius: radius.icon, alignItems: 'center', justifyContent: 'center' },
  total: { paddingVertical: 14, paddingHorizontal: space.lg, alignItems: 'center' },
  byCategory: { paddingBottom: space.sm },
  section: { paddingTop: space.md, paddingHorizontal: space.lg, paddingBottom: space.xs },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm, paddingHorizontal: space.lg },
  grow: { flex: 1, minWidth: 0 },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  track: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  percent: { minWidth: 36, textAlign: 'right' },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingVertical: space.sm, paddingHorizontal: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
});
