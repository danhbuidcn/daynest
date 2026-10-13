import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { colors, radius, space } from '@/theme';
import { categoryName } from './expense';
import { CategoryIcon } from './ExpenseSummary';
import { useExpenseCategories } from './useExpenses';

// S4 màn 7b: tap = pick + close · "Thêm nhóm" opens the category dialog (step 6).
export function ExpenseCategoryPicker({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const categories = useExpenseCategories().data ?? [];

  return (
    <DialogShell visible={visible} onClose={onClose} compact>
      <AppText variant="heading" style={styles.title}>
        {t('expenses.form.category')}
      </AppText>
      <ScrollView style={styles.list}>
        {categories.map((c) => {
          const on = c.id === selected;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onSelect(c.id)}
              style={[styles.option, on && styles.optionOn]}>
              <CategoryIcon category={c} size={28} />
              <AppText weight={on ? 'extrabold' : undefined} numberOfLines={1} style={styles.flex}>
                {categoryName(t, c)}
              </AppText>
              {on ? <Icon name="check" size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable accessibilityRole="button" onPress={() => toast(t('comingSoon'))} style={styles.option}>
        <Icon name="plus" size={20} color={colors.primaryDark} />
        <AppText weight="bold" color={colors.primaryDark}>
          {t('expenses.form.addCategory')}
        </AppText>
      </Pressable>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', marginBottom: space.md },
  list: { maxHeight: 360 },
  option: { height: 52, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, borderRadius: radius.button },
  optionOn: { backgroundColor: colors.primarySoft },
  flex: { flex: 1 },
});
