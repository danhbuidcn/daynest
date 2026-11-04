import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { textOn, toHex } from '@/lib/colors';
import { formatKindVnd, formatVnd, type CategoryTotal, type Kind } from '@/lib/expenses';
import { makeStyles, radius, space, useTheme } from '@/theme';
import { categoryIcon, categoryName, type Expense, type ExpenseCategory } from './expense';

export function CategoryIcon({ category, size = 28 }: { category: ExpenseCategory | undefined; size?: number }) {
  const styles = useStyles();
  const bg = toHex(category?.color ?? 'mint');
  return (
    <View style={[styles.icon, { width: size, height: size, backgroundColor: bg }]}>
      <Icon name={categoryIcon(category)} size={Math.round(size * 0.6)} color={textOn(bg)} />
    </View>
  );
}

// Two totals side by side (spec S8): income on the left in `primaryDark`, expense on the right.
export function TotalCard({ income, expense, children }: { income: number; expense: number; children?: ReactNode }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Card style={styles.total}>
      <View style={styles.totalRow}>
        <View style={styles.totalCell}>
          <AppText variant="caption" color={colors.textMuted}>
            {t('expenses.totalIncome')}
          </AppText>
          <AppText variant="title" color={colors.primaryDark} numberOfLines={1} adjustsFontSizeToFit style={styles.totalText}>
            {formatKindVnd(income, 'income')}
          </AppText>
        </View>
        <View style={styles.totalDivider} />
        <View style={styles.totalCell}>
          <AppText variant="caption" color={colors.textMuted}>
            {t('expenses.total')}
          </AppText>
          <AppText variant="title" numberOfLines={1} adjustsFontSizeToFit style={styles.totalText}>
            {formatVnd(expense)}
          </AppText>
        </View>
      </View>
      {children}
    </Card>
  );
}

// The Chi | Thu chips of the "Theo ngày" and "Theo nhóm" cards.
export function useKindChips(kind: Kind, onKind: (k: Kind) => void) {
  const { t } = useTranslation();
  return (['expense', 'income'] as const).map((k) => ({ label: t(`expenses.kind.${k}`), active: k === kind, onPress: () => onKind(k) }));
}

export function CategoryTotalsCard({
  totals,
  categories,
  kind,
  onKind,
  onPress,
}: {
  totals: CategoryTotal[];
  categories: Map<string, ExpenseCategory>;
  kind: Kind;
  onKind: (k: Kind) => void;
  onPress: (categoryId: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const chips = useKindChips(kind, onKind);
  return (
    <Card style={styles.byCategory}>
      <AppText variant="heading" style={[styles.section, styles.sectionText]}>
        {t('expenses.byCategory')}
      </AppText>
      <View style={styles.chips}>
        {chips.map((c) => (
          <Pressable key={c.label} accessibilityRole="button" accessibilityState={{ selected: c.active }} onPress={c.onPress} style={[styles.chip, c.active && styles.chipOn]}>
            <AppText variant="caption" weight="bold" color={c.active ? colors.white : colors.primaryDark}>
              {c.label}
            </AppText>
          </Pressable>
        ))}
      </View>
      {totals.map((c) => {
        const category = categories.get(c.categoryId);
        return (
          <Pressable key={c.categoryId} accessibilityRole="button" onPress={() => onPress(c.categoryId)} style={styles.catRow}>
            <CategoryIcon category={category} />
            <View style={styles.grow}>
              <View style={styles.line}>
                <AppText numberOfLines={1} style={[styles.grow, styles.rowText]}>
                  {categoryName(t, category)}
                </AppText>
                <AppText weight="bold" color={kind === 'income' ? colors.primaryDark : undefined} style={styles.rowText}>{formatKindVnd(c.amount, kind)}</AppText>
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
          </Pressable>
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
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  return (
    <Card>
      {expenses.map((e, i) => {
        const category = categories.get(e.categoryId);
        return (
          <Pressable key={e.id} accessibilityRole="button" onPress={() => onPress(e)} style={[styles.expRow, i > 0 && styles.divider]}>
            <CategoryIcon category={category} />
            <View style={styles.grow}>
              <AppText numberOfLines={1} style={styles.rowText}>{categoryName(t, category)}</AppText>
              {e.note ? (
                <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
                  {e.note}
                </AppText>
              ) : null}
            </View>
            {e.recurrenceId ? <Icon name="repeat" size={16} color={colors.textMuted} /> : null}
            <AppText weight="bold" color={e.kind === 'income' ? colors.primaryDark : undefined} style={styles.rowText}>{formatKindVnd(e.amount, e.kind)}</AppText>
          </Pressable>
        );
      })}
    </Card>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  icon: { borderRadius: radius.icon, alignItems: 'center', justifyContent: 'center' },
  total: { paddingVertical: 10, paddingHorizontal: space.lg },
  totalRow: { flexDirection: 'row', alignItems: 'center' },
  totalCell: { flex: 1, alignItems: 'center', minWidth: 0 },
  totalDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  totalText: { fontSize: 17, lineHeight: 24 },
  chips: { flexDirection: 'row', gap: 6, paddingHorizontal: space.lg, paddingBottom: space.xs },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.primarySoft },
  chipOn: { backgroundColor: colors.primary },
  rowText: { fontSize: 14, lineHeight: 20 },
  sectionText: { fontSize: 15, lineHeight: 20 },
  byCategory: { paddingBottom: space.sm },
  section: { paddingTop: space.md, paddingHorizontal: space.lg, paddingBottom: space.xs },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6, paddingHorizontal: space.lg },
  grow: { flex: 1, minWidth: 0 },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  track: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  percent: { minWidth: 36, textAlign: 'right' },
  expRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48, paddingVertical: space.sm, paddingHorizontal: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
}));
