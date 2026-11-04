import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SegmentedBar } from '@/components/SegmentedBar';
import { makeStyles, space } from '@/theme';
import type { ExpenseKind } from './expense';

// Chi | Thu at the top of the expense and recurring-entry forms (spec S8).
export function KindSwitch({ value, onChange }: { value: ExpenseKind; onChange: (kind: ExpenseKind) => void }) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      <SegmentedBar
        options={[
          { value: 'expense', label: t('expenses.kind.expense'), tone: 'error' },
          { value: 'income', label: t('expenses.kind.income') },
        ]}
        value={value}
        onChange={onChange}
      />
    </View>
  );
}

// SegmentedBar has its own side margin; the form content already has the same padding.
const useStyles = makeStyles(() => ({
  wrap: { marginHorizontal: -space.lg },
}));
