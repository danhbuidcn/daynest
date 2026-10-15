import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Crypto from 'expo-crypto';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionMenu } from '@/components/ActionMenu';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { AlertDialog, ConfirmDialog } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';
import { toHex, textOn } from '@/lib/colors';
import { categoryName, USER_CATEGORY_MAX, type ExpenseCategory } from '@/features/expenses/expense';
import { SUGGESTED_CATEGORIES, visibleSuggestions } from '@/features/expenses/suggestedCategories';
import { ExpenseCategoryDialog } from '@/features/expenses/ExpenseCategoryDialog';
import { CategoryIcon } from '@/features/expenses/ExpenseSummary';
import { useExpenseCategories, useExpenseCategoryWrites } from '@/features/expenses/useExpenses';
import { makeStyles, space, useTheme } from '@/theme';
import { useErrorToast } from '@/features/network/useErrorToast';
import { useOnline } from '@/features/network/useOnline';

// S4 màn 10 — built-in categories (locked) · yours (tap = edit, ⋯ = Sửa / Xoá) · "Thêm nhóm".
export default function ExpenseCategoriesScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const failed = useErrorToast();
  const { canWrite } = useOnline();
  const { width } = useWindowDimensions();
  const categories = useExpenseCategories().data ?? [];
  const { remove, save } = useExpenseCategoryWrites();
  const [editing, setEditing] = useState<ExpenseCategory | 'new' | null>(null);
  const [menu, setMenu] = useState<{ category: ExpenseCategory; top: number; right: number } | null>(null);
  const [deleting, setDeleting] = useState<ExpenseCategory | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);

  const builtIn = categories.filter((c) => c.key);
  const mine = categories.filter((c) => !c.key);
  const canAdd = mine.length < USER_CATEGORY_MAX;
  const suggestions = visibleSuggestions(
    SUGGESTED_CATEGORIES.map((s) => ({ ...s, name: t(`expenses.suggested.${s.key}`) })),
    categories.map((c) => categoryName(t, c)),
  );
  const addSuggestion = (s: (typeof suggestions)[number]) => {
    if (!canAdd) return setLimitOpen(true);
    save.mutate(
      { id: Crypto.randomUUID(), isNew: true, input: { name: s.name, icon: s.icon, color: s.color } },
      { onSuccess: () => toast(t('expenses.categoriesScreen.added', { name: s.name })), onError: failed('expenses.form.saveFailed') },
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <ScreenHeader title={t('expenses.categories')} onBack={() => router.back()} compact />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Pressable accessibilityRole="button" onPress={() => router.push('/expense/recurrences')} style={styles.row}>
            <View style={styles.plus}>
              <Icon name="repeat" size={22} color={colors.primaryDark} />
            </View>
            <AppText style={styles.flex}>{t('expenses.recurring.title')}</AppText>
            <Icon name="chevron" size={18} color={colors.textMuted} />
          </Pressable>
        </Card>
        <GroupLabel text={t('expenses.categoriesScreen.builtIn')} />
        <Card>
          {builtIn.map((c, i) => (
            <View key={c.id} style={[styles.row, i > 0 && styles.divider]}>
              <CategoryIcon category={c} />
              <AppText numberOfLines={1} style={styles.flex}>
                {categoryName(t, c)}
              </AppText>
              <Icon name="lock" size={18} color={colors.textMuted} />
            </View>
          ))}
        </Card>
        <GroupLabel text={t('expenses.categoriesScreen.mine')} />
        <Card>
          {mine.map((c, i) => (
            <Pressable key={c.id} accessibilityRole="button" onPress={() => setEditing(c)} style={[styles.row, i > 0 && styles.divider]}>
              <CategoryIcon category={c} />
              <AppText numberOfLines={1} style={styles.flex}>
                {categoryName(t, c)}
              </AppText>
              <MoreAt onPress={(top, right) => setMenu({ category: c, top, right })} width={width} />
            </Pressable>
          ))}
          <Pressable
            accessibilityRole="button"
            disabled={!canWrite}
            onPress={() => (canAdd ? setEditing('new') : setLimitOpen(true))}
            style={[styles.row, mine.length > 0 && styles.divider, !canWrite && styles.locked]}>
            <View style={styles.plus}>
              <Icon name="plus" size={20} color={colors.primaryDark} />
            </View>
            <AppText weight="extrabold" color={colors.primaryDark}>
              {t('expenses.form.addCategory')}
            </AppText>
          </Pressable>
        </Card>
        {suggestions.length > 0 ? (
          <>
            <GroupLabel text={t('expenses.categoriesScreen.suggested')} />
            <View style={styles.chips}>
              {suggestions.map((s) => (
                <Pressable
                  key={s.key}
                  accessibilityRole="button"
                  disabled={!canWrite || save.isPending}
                  onPress={() => addSuggestion(s)}
                  style={[styles.chip, (!canWrite || save.isPending) && styles.locked]}>
                  <View style={[styles.chipIcon, { backgroundColor: toHex(s.color) }]}>
                    <Icon name={s.icon} size={16} color={textOn(toHex(s.color))} />
                  </View>
                  <AppText variant="caption" weight="bold">
                    {s.name}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <AlertDialog
        visible={limitOpen}
        tone="warning"
        icon="warn"
        title={t('common.limitTitle')}
        text={t('expenses.categoriesScreen.limitText', { max: USER_CATEGORY_MAX })}
        buttonLabel={t('common.done')}
        onClose={() => setLimitOpen(false)}
      />
      <ActionMenu
        visible={!!menu}
        top={menu?.top}
        right={menu?.right}
        onClose={() => setMenu(null)}
        actions={
          menu
            ? [
                { icon: 'pen', label: t('expenses.categoriesScreen.edit'), onPress: () => setEditing(menu.category) },
                { icon: 'trash', label: t('expenses.form.delete'), danger: true, onPress: () => setDeleting(menu.category) },
              ]
            : []
        }
      />
      {editing ? <ExpenseCategoryDialog category={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog
        visible={!!deleting}
        icon="trash"
        title={t('expenses.categoriesScreen.deleteTitle', { name: deleting ? categoryName(t, deleting) : '' })}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('expenses.form.delete')}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          const id = deleting!.id;
          setDeleting(null);
          remove.mutate(id, {
            onSuccess: () => toast(t('expenses.form.deleted')),
            onError: failed('expenses.form.saveFailed'),
          });
        }}
      />
    </SafeAreaView>
  );
}

// `⋯` that opens the menu right under itself.
function MoreAt({ onPress, width }: { onPress: (top: number, right: number) => void; width: number }) {
  const { colors } = useTheme();
  const ref = useRef<View>(null);
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel="More"
      hitSlop={10}
      onPress={() => ref.current?.measureInWindow((x, y, w, h) => onPress(y + h + space.xs, Math.max(space.lg, width - x - w)))}>
      <Icon name="more" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

function GroupLabel({ text }: { text: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.group}>
      {text.toUpperCase()}
    </AppText>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.bg },
  locked: { opacity: 0.4 },
  content: { paddingHorizontal: space.lg, gap: space.md, paddingBottom: space.xl },
  group: { marginHorizontal: space.xs, marginTop: space.sm, letterSpacing: 0.6 },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingLeft: 5, paddingRight: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipIcon: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  plus: { width: 34, alignItems: 'center' },
  flex: { flex: 1 },
}));
