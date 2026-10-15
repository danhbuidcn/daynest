import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ChoiceDialog, ConfirmDialog } from '@/components/Dialog';
import { FormScreen } from '@/components/FormScreen';
import { Icon, type IconName } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { ConflictError, ForbiddenError } from '@/features/events/api';
import { ConflictDialog } from '@/features/events/OccurrenceDialogs';
import { categoryName } from '@/features/expenses/expense';
import { ExpenseCategoryPicker } from '@/features/expenses/ExpenseCategoryPicker';
import { CategoryIcon } from '@/features/expenses/ExpenseSummary';
import { MiniCalendarPicker } from '@/features/expenses/MiniCalendarPicker';
import type { Recurrence } from '@/features/expenses/recurrenceApi';
import { RECURRENCES_KEY, useRecurrences, useRecurrenceWrites } from '@/features/expenses/useRecurrences';
import { useExpenseCategories } from '@/features/expenses/useExpenses';
import { useErrorToast } from '@/features/network/useErrorToast';
import { useOnline } from '@/features/network/useOnline';
import { isoDate, parseIsoDate, weekdayOf } from '@/lib/calendar/monthGrid';
import { todayIn } from '@/lib/calendar/timeZone';
import { success } from '@/lib/haptics';
import { formatAmountInput, groupThousands, NOTE_MAX, parseAmount } from '@/lib/expenses';
import { anchorOf, FREQUENCIES, type Frequency } from '@/lib/expenses/recurrence';
import type { SolarDate } from '@/lib/lunar';
import { makeStyles, radius, space, useTheme } from '@/theme';

// Spec S6 §7: edit one rule — the change applies to later occurrences only.
export default function RecurrenceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rule = useRecurrences().data?.find((r) => r.id === id);
  if (!rule) return null;
  return <RecurrenceForm key={rule.id} rule={rule} />;
}

function RecurrenceForm({ rule }: { rule: Recurrence }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const failed = useErrorToast();
  const { settings, recheckSession } = useAuth();
  const { canWrite } = useOnline();
  const { save, remove } = useRecurrenceWrites();
  const categories = useExpenseCategories().data ?? [];
  const [amountText, setAmountText] = useState(groupThousands(rule.amount));
  const [categoryId, setCategoryId] = useState(rule.categoryId);
  const [note, setNote] = useState(rule.note);
  const [frequency, setFrequency] = useState<Frequency>(rule.frequency);
  const [nextOn, setNextOn] = useState<SolarDate>(parseIsoDate(rule.nextOn));
  const [pickCategory, setPickCategory] = useState(false);
  const [pickDate, setPickDate] = useState(false);
  const [pickFrequency, setPickFrequency] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [busy, setBusy] = useState(false);

  const amount = parseAmount(amountText);
  const offline = !canWrite;
  const category = categories.find((c) => c.id === categoryId);

  const write = async (updatedAt: string | null) => {
    setBusy(true);
    try {
      await save.mutateAsync({
        id: rule.id,
        updatedAt,
        input: {
          categoryId,
          amount: amount!,
          note: note.trim(),
          frequency,
          anchorDay: anchorOf(frequency, nextOn),
          nextOn: isoDate(nextOn),
        },
      });
      success();
      toast(t('expenses.form.saved'));
      router.back();
    } catch (e) {
      if (e instanceof ConflictError) setConflict(true);
      else if (e instanceof ForbiddenError) await recheckSession();
      else failed('expenses.form.saveFailed')(e);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = () => {
    setConfirmDelete(false);
    remove.mutate(rule.id, {
      onSuccess: () => {
        toast(t('expenses.form.deleted'));
        router.back();
      },
      onError: failed('expenses.form.deleteFailed'),
    });
  };

  const d = nextOn;
  const dateText = `${t(`calendar.weekdays.${weekdayOf(d)}`)} ${d.day}/${d.month}/${d.year}`;

  return (
    <FormScreen
      title={t('expenses.recurring.editTitle')}
      onBack={() => router.back()}
      footer={
        <View style={styles.footer}>
          <Button
            label={t('expenses.form.delete')}
            variant="dangerSoft"
            icon={<Icon name="trash" size={20} color={colors.error} />}
            onPress={() => setConfirmDelete(true)}
            disabled={busy || offline}
          />
          <Button label={t('expenses.form.save')} onPress={() => void write(rule.updatedAt)} disabled={amount === null || busy || offline} />
        </View>
      }>
      <View style={styles.amountBox}>
        <AppText variant="caption" color={colors.textMuted}>
          {t('expenses.form.amount')}
        </AppText>
        <TextInput
          value={amountText}
          onChangeText={(text) => setAmountText(formatAmountInput(text))}
          keyboardType="number-pad"
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
        <Row icon="repeat" onPress={() => setPickFrequency(true)}>
          <AppText numberOfLines={1} style={styles.grow}>
            {t('expenses.form.repeat')}: {t(`expenses.form.repeatOptions.${frequency}`)}
          </AppText>
          <Icon name="chevron" size={18} color={colors.textMuted} />
        </Row>
        <Row icon="calendar" onPress={() => setPickDate(true)}>
          <AppText numberOfLines={1} style={styles.grow}>
            {t('expenses.recurring.nextDate')}: {dateText}
          </AppText>
          <Icon name="chevron" size={18} color={colors.textMuted} />
        </Row>
        <Row icon="note">
          <TextInput
            value={note}
            onChangeText={setNote}
            maxLength={NOTE_MAX}
            placeholder={t('expenses.form.notePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.grow, styles.noteInput]}
          />
        </Row>
      </View>

      <ExpenseCategoryPicker
        visible={pickCategory}
        selected={categoryId}
        onSelect={(id) => {
          setCategoryId(id);
          setPickCategory(false);
        }}
        onClose={() => setPickCategory(false)}
      />
      <ChoiceDialog
        visible={pickFrequency}
        title={t('expenses.form.repeat')}
        options={FREQUENCIES.map((value) => ({ value, label: t(`expenses.form.repeatOptions.${value}`) }))}
        selected={frequency}
        onSelect={(value) => {
          setFrequency(value);
          setPickFrequency(false);
        }}
        onClose={() => setPickFrequency(false)}
      />
      <MiniCalendarPicker
        visible={pickDate}
        mode="day"
        selected={nextOn}
        weekStart={settings.weekStart}
        currentLabel={t('expenses.current.day')}
        onSelect={(date) => {
          setNextOn(date);
          setPickDate(false);
        }}
        onCurrent={() => {
          setNextOn(todayIn(settings.timeZone));
          setPickDate(false);
        }}
        onClose={() => setPickDate(false)}
      />
      <ConfirmDialog
        visible={confirmDelete}
        icon="trash"
        title={t('expenses.recurring.deleteTitle')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('expenses.form.delete')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
      <ConflictDialog
        visible={conflict}
        onReload={() => {
          setConflict(false);
          void queryClient.invalidateQueries({ queryKey: [RECURRENCES_KEY] });
          router.back();
        }}
        onOverwrite={() => {
          setConflict(false);
          void write(null);
        }}
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
