import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { Switch } from '@/components/Switch';
import { TextField } from '@/components/TextField';
import { useToast } from '@/components/Toast';
import { useErrorToast } from '@/features/network/useErrorToast';
import { useOnline } from '@/features/network/useOnline';
import { success } from '@/lib/haptics';
import { formatAmountInput, groupThousands, parseAmount } from '@/lib/expenses';
import { monthKey } from '@/lib/expenses/budget';
import { makeStyles, space } from '@/theme';
import { useSaveBudget } from './useBudget';

// Mounted only while open, so the fields start from the current budget each time.
export function BudgetDialog(props: Props) {
  return props.visible ? <BudgetForm {...props} /> : null;
}

type Props = {
  visible: boolean;
  year: number;
  month: number;
  current: { amount: number; kind: 'general' | 'month' } | null;
  onClose: () => void;
};

function BudgetForm({
  visible,
  year,
  month,
  current,
  onClose,
}: Props) {
  const styles = useStyles();
  const { t } = useTranslation();
  const toast = useToast();
  const failed = useErrorToast();
  const { canWrite } = useOnline();
  const save = useSaveBudget();
  const [text, setText] = useState(current ? groupThousands(current.amount) : '');
  const [everyMonth, setEveryMonth] = useState(current?.kind !== 'month');

  const amount = text ? parseAmount(text) : null;
  const invalid = text !== '' && amount === null;

  const submit = () => {
    if (invalid) return;
    save.mutate(
      { month: monthKey(year, month), amount, everyMonth },
      {
        onSuccess: () => {
          success();
          toast(t('expenses.budget.saved'));
          onClose();
        },
        onError: failed('expenses.budget.saveFailed'),
      },
    );
  };

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <AppText variant="heading" style={styles.title}>
        {t('expenses.budget.title', { month })}
      </AppText>
      <TextField
        label={t('expenses.budget.amount')}
        value={text}
        onChangeText={(v) => setText(formatAmountInput(v))}
        keyboardType="number-pad"
        error={invalid ? t('expenses.budget.invalid') : null}
      />
      <View style={styles.switchRow}>
        <AppText style={styles.grow}>{t('expenses.budget.everyMonth')}</AppText>
        <Switch value={everyMonth} onValueChange={setEveryMonth} />
      </View>
      <View style={styles.actions}>
        <Button label={t('common.cancel')} variant="secondary" onPress={onClose} style={styles.grow} />
        <Button label={t('expenses.form.save')} onPress={submit} disabled={!canWrite || invalid || save.isPending} style={styles.grow} />
      </View>
    </DialogShell>
  );
}

const useStyles = makeStyles(() => ({
  title: { textAlign: 'center', marginBottom: space.md },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.lg },
  grow: { flex: 1 },
  actions: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
}));
