import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView } from 'react-native';

import { AppText } from '@/components/AppText';
import { AlertDialog, DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { makeStyles, radius, space, useTheme } from '@/theme';
import { categoryName, USER_CATEGORY_MAX } from './expense';
import { ExpenseCategoryDialog } from './ExpenseCategoryDialog';
import { CategoryIcon } from './ExpenseSummary';
import { useExpenseCategories } from './useExpenses';

// S4 màn 7b: tap = pick + close · "Thêm nhóm" makes one on the spot and picks it.
export function ExpenseCategoryPicker({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const categories = useExpenseCategories().data ?? [];
  const [adding, setAdding] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const canAdd = categories.filter((c) => !c.key).length < USER_CATEGORY_MAX;

  return (
    <>
      <DialogShell visible={visible && !adding} onClose={onClose} compact>
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
        <Pressable accessibilityRole="button" onPress={() => (canAdd ? setAdding(true) : setLimitOpen(true))} style={styles.option}>
          <Icon name="plus" size={20} color={colors.primaryDark} />
          <AppText weight="bold" color={colors.primaryDark}>
            {t('expenses.form.addCategory')}
          </AppText>
        </Pressable>
      </DialogShell>
      <AlertDialog
        visible={limitOpen}
        tone="warning"
        icon="warn"
        title={t('common.limitTitle')}
        text={t('expenses.categoriesScreen.limitText', { max: USER_CATEGORY_MAX })}
        buttonLabel={t('common.done')}
        onClose={() => setLimitOpen(false)}
      />
      {visible && adding ? (
        <ExpenseCategoryDialog
          onClose={() => setAdding(false)}
          onSaved={(id) => {
            setAdding(false);
            onSelect(id);
          }}
        />
      ) : null}
    </>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  title: { textAlign: 'center', marginBottom: space.md },
  list: { maxHeight: 360 },
  option: { height: 52, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, borderRadius: radius.button },
  optionOn: { backgroundColor: colors.primarySoft },
  flex: { flex: 1 },
}));
