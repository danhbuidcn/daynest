import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ChoiceDialog } from '@/components/Dialog';
import { FormScreen } from '@/components/FormScreen';
import { Icon, type IconName } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { useUndoableDelete } from '@/features/cache/useUndoableDelete';
import { ConflictError, ForbiddenError } from '@/features/events/api';
import { ConflictDialog } from '@/features/events/OccurrenceDialogs';
import * as api from '@/features/expenses/api';
import * as recurrenceApi from '@/features/expenses/recurrenceApi';
import { categoryName, defaultCategoryId, type Expense } from '@/features/expenses/expense';
import { CategoryIcon } from '@/features/expenses/ExpenseSummary';
import { ExpenseCategoryPicker } from '@/features/expenses/ExpenseCategoryPicker';
import { MiniCalendarPicker } from '@/features/expenses/MiniCalendarPicker';
import { EXPENSES_KEY, hideExpense, useExpenseCategories, useExpenseWrites, useExpensesInRange } from '@/features/expenses/useExpenses';
import { useErrorToast } from '@/features/network/useErrorToast';
import { useOnline } from '@/features/network/useOnline';
import { isoDate, parseIsoDate, weekdayOf } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { success } from '@/lib/haptics';
import { formatAmountInput, groupThousands, NOTE_MAX, parseAmount, relativeDay } from '@/lib/expenses';
import { anchorOf, type Frequency } from '@/lib/expenses/recurrence';
import type { SolarDate } from '@/lib/lunar';
import { makeStyles, radius, space, useTheme } from '@/theme';

const LAST_CATEGORY_KEY = 'expenses.lastCategory';
const NO_DATE = { year: 1900, month: 1, day: 1 };

type FormState = { amount: string; categoryId: string; spentOn: SolarDate; note: string };

// S4 màn 7, 8 — create: `?date=YYYY-MM-DD` (default today) · edit: `?id=…&date=<spent_on>`.
export default function ExpenseFormScreen() {
  const { settings } = useAuth();
  const params = useLocalSearchParams<{ id?: string; date?: string; repeat?: string }>();
  const isEdit = !!params.id;
  const range = useMemo(() => {
    const d = params.date ? parseIsoDate(params.date) : NO_DATE;
    return { from: d, to: d };
  }, [params.date]);

  const loaded = useExpensesInRange(range, isEdit);
  const expense = isEdit ? loaded.data?.find((e) => e.id === params.id) : undefined;
  const categories = useExpenseCategories().data;
  const [lastUsed, setLastUsed] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    AsyncStorage.getItem(LAST_CATEGORY_KEY)
      .then(setLastUsed)
      .catch(() => setLastUsed(null));
  }, []);

  const initial = useMemo<FormState | null>(() => {
    if (isEdit) {
      return expense
        ? { amount: groupThousands(expense.amount), categoryId: expense.categoryId, spentOn: parseIsoDate(expense.spentOn), note: expense.note }
        : null;
    }
    if (!categories || lastUsed === undefined) return null;
    const categoryId = defaultCategoryId(categories, lastUsed);
    if (!categoryId) return null;
    return { amount: '', categoryId, spentOn: params.date ? range.from : todayIn(settings.timeZone), note: '' };
  }, [isEdit, expense, categories, lastUsed, params.date, range, settings.timeZone]);

  if (!initial) return null;
  return <ExpenseForm key={params.id ?? 'create'} initial={initial} expense={expense} initialRepeat={params.repeat === 'monthly' ? 'monthly' : 'none'} />;
}

function ExpenseForm({ initial, expense, initialRepeat }: { initial: FormState; expense?: Expense; initialRepeat: Frequency | 'none' }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { settings, recheckSession } = useAuth();
  const { canWrite } = useOnline();
  const failed = useErrorToast();
  const categories = useExpenseCategories().data ?? [];
  const { save, remove } = useExpenseWrites();
  const undoable = useUndoableDelete();
  const [newId] = useState(() => Crypto.randomUUID());
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [pickCategory, setPickCategory] = useState(false);
  const [pickDate, setPickDate] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [repeat, setRepeat] = useState<Frequency | 'none'>(initialRepeat);
  const [pickRepeat, setPickRepeat] = useState(false);

  const today = todayIn(settings.timeZone);
  const offline = !canWrite;
  const amount = parseAmount(form.amount);
  const canSave = amount !== null && !busy && !offline;
  const category = categories.find((c) => c.id === form.categoryId);

  const input = (): api.ExpenseInput => ({
    categoryId: form.categoryId,
    amount: amount!,
    spentOn: isoDate(form.spentOn),
    note: form.note.trim(),
  });

  // Save errors keep the form open (spec §5); a conflict asks "Tải bản mới / Ghi đè".
  const run = async (write: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await write();
      success();
      toast(t(done));
      router.back();
    } catch (e) {
      if (e instanceof ConflictError) setConflict(true);
      else if (e instanceof ForbiddenError) await recheckSession();
      else failed('expenses.form.saveFailed')(e);
    } finally {
      setBusy(false);
    }
  };

  // A repeating expense becomes a rule; the DB function then writes what is already due (the first
  // one when the start date is today or earlier), so no plain expense is saved next to it.
  const saveRule = async (frequency: Frequency) => {
    await recurrenceApi.createRecurrence(newId, {
      categoryId: form.categoryId,
      amount: amount!,
      note: form.note.trim(),
      frequency,
      anchorDay: anchorOf(frequency, form.spentOn),
      nextOn: isoDate(form.spentOn),
    });
    await recurrenceApi.generateDue(isoDate(today));
    await queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
  };

  const onSave = () =>
    void run(async () => {
      if (!expense && repeat !== 'none') {
        await saveRule(repeat);
        AsyncStorage.setItem(LAST_CATEGORY_KEY, form.categoryId).catch(() => {});
        return;
      }
      await save.mutateAsync({ id: expense?.id ?? newId, updatedAt: expense?.updatedAt, input: input() });
      AsyncStorage.setItem(LAST_CATEGORY_KEY, form.categoryId).catch(() => {});
    }, 'expenses.form.saved');

  // Gone at once with "Hoàn tác"; the write goes out when the undo window ends (spec S6 §5).
  const onDelete = () => {
    if (!expense) return;
    undoable({
      hide: () => hideExpense(queryClient, expense.id),
      commit: () => remove.mutateAsync(expense.id),
      onError: (e) => (e instanceof ForbiddenError ? void recheckSession() : failed('expenses.form.deleteFailed')(e)),
    });
    router.back();
  };

  const overwrite = () => {
    setConflict(false);
    void run(async () => {
      const fresh = await api.fetchExpense(expense!.id);
      // Deleted on the other device meanwhile: nothing left to overwrite.
      if (!fresh) throw new Error('gone');
      await save.mutateAsync({ id: fresh.id, updatedAt: fresh.updatedAt, input: input() });
    }, 'expenses.form.saved');
  };

  const dateLabel = () => {
    const rel = relativeDay(form.spentOn, today);
    const d = form.spentOn;
    const text = `${t(`calendar.weekdays.${weekdayOf(d)}`)} ${d.day}/${d.month}/${d.year}`;
    return rel ? `${t(`expenses.form.${rel}`)}, ${text}` : text;
  };

  return (
    <FormScreen
      title={t(expense ? 'expenses.form.editTitle' : 'expenses.form.addTitle')}
      onBack={() => router.back()}
      footer={
        <View style={styles.footer}>
          {expense ? (
            <Button
              label={t('expenses.form.delete')}
              variant="dangerSoft"
              icon={<Icon name="trash" size={20} color={colors.error} />}
              onPress={onDelete}
              disabled={busy || offline}
            />
          ) : null}
          <Button label={t('expenses.form.save')} onPress={onSave} disabled={!canSave} />
        </View>
      }>
      <View style={styles.amountBox}>
        <AppText variant="caption" color={colors.textMuted}>
          {t('expenses.form.amount')}
        </AppText>
        <TextInput
          value={form.amount}
          onChangeText={(text) => setForm({ ...form, amount: formatAmountInput(text) })}
          keyboardType="number-pad"
          autoFocus={!expense}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t('expenses.form.amount')}
          style={styles.amountInput}
        />
      </View>

      <View style={styles.card}>
        <Pressable accessibilityRole="button" onPress={() => setPickCategory(true)} style={styles.row}>
          <CategoryIcon category={category} size={24} />
          <AppText numberOfLines={1} style={styles.grow}>
            {categoryName(t, category)}
          </AppText>
          <Icon name="chevron" size={18} color={colors.textMuted} />
        </Pressable>
        <Row icon="calendar" onPress={() => setPickDate(true)}>
          <AppText numberOfLines={1} style={styles.grow}>
            {dateLabel()}
          </AppText>
          <Icon name="chevron" size={18} color={colors.textMuted} />
        </Row>
        {expense ? null : (
          <Row icon="repeat" onPress={() => setPickRepeat(true)}>
            <AppText numberOfLines={1} style={styles.grow}>
              {t('expenses.form.repeat')}: {t(`expenses.form.repeatOptions.${repeat}`)}
            </AppText>
            <Icon name="chevron" size={18} color={colors.textMuted} />
          </Row>
        )}
        <Row icon="note">
          <TextInput
            value={form.note}
            onChangeText={(note) => setForm({ ...form, note })}
            maxLength={NOTE_MAX}
            placeholder={t('expenses.form.notePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.grow, styles.noteInput]}
          />
        </Row>
      </View>

      <ExpenseCategoryPicker
        visible={pickCategory}
        selected={form.categoryId}
        onSelect={(categoryId) => {
          setForm({ ...form, categoryId });
          setPickCategory(false);
        }}
        onClose={() => setPickCategory(false)}
      />
      <MiniCalendarPicker
        visible={pickDate}
        mode="day"
        selected={form.spentOn}
        weekStart={settings.weekStart}
        currentLabel={t('expenses.current.day')}
        onSelect={(spentOn) => {
          setForm({ ...form, spentOn });
          setPickDate(false);
        }}
        onCurrent={() => {
          setForm({ ...form, spentOn: todayIn(settings.timeZone) });
          setPickDate(false);
        }}
        onClose={() => setPickDate(false)}
      />
      <ChoiceDialog
        visible={pickRepeat}
        title={t('expenses.form.repeat')}
        options={(['none', 'weekly', 'monthly'] as const).map((value) => ({ value, label: t(`expenses.form.repeatOptions.${value}`) }))}
        selected={repeat}
        onSelect={(value) => {
          setRepeat(value);
          setPickRepeat(false);
        }}
        onClose={() => setPickRepeat(false)}
      />
      <ConflictDialog
        visible={conflict}
        onReload={() => {
          setConflict(false);
          void queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
          router.back();
        }}
        onOverwrite={overwrite}
      />
    </FormScreen>
  );
}

function Row({ icon, onPress, children }: { icon: IconName; onPress?: () => void; children: ReactNode }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress} style={[styles.row, styles.divider]}>
      <Icon name={icon} size={22} color={colors.primaryDark} />
      {children}
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, shadow, type }) => ({
  footer: { gap: 10 },
  center: { textAlign: 'center' },
  amountBox: { alignItems: 'center', paddingTop: space.sm, gap: 6 },
  amountInput: {
    ...type.title,
    color: colors.text,
    textAlign: 'center',
    minWidth: 120,
    paddingHorizontal: space.sm,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, paddingVertical: space.xs, paddingHorizontal: space.lg, ...shadow },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: space.md },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  grow: { flex: 1, minWidth: 0 },
  noteInput: { ...type.body, color: colors.text, paddingVertical: space.sm },
}));
