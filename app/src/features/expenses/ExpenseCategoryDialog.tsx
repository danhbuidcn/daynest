import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ColorRow } from '@/components/ColorRow';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { TextField } from '@/components/TextField';
import { useOnline } from '@/features/network/useOnline';
import { isDeviceOnline } from '@/lib/connection';
import { classifyError, errorMessageKey } from '@/lib/errors/classifyError';
import { textOn, toHex, type AppColor } from '@/lib/colors';
import { makeStyles, space, useTheme } from '@/theme';
import { DuplicateNameError } from './api';
import { CATEGORY_NAME_MAX, PICKABLE_ICONS, type ExpenseCategory } from './expense';
import { useExpenseCategoryWrites } from './useExpenses';

const CELL = 40;
const GAP = 8;
const COLUMNS = 6;
const ICON_ROWS = Array.from({ length: PICKABLE_ICONS.length / COLUMNS }, (_, r) => PICKABLE_ICONS.slice(r * COLUMNS, (r + 1) * COLUMNS));

// S4 màn 11 — Thêm / Sửa nhóm: tên · 36 icon · màu. Rendered only while open, so state starts fresh.
export function ExpenseCategoryDialog({
  category,
  onClose,
  onSaved,
}: {
  category?: ExpenseCategory;
  onClose: () => void;
  onSaved?: (id: string) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const { save } = useExpenseCategoryWrites();
  const [id] = useState(() => category?.id ?? Crypto.randomUUID());
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? 'tag');
  const [color, setColor] = useState<AppColor>(category?.color ?? 'mint');
  const [error, setError] = useState<string | null>(null);

  const { canWrite } = useOnline();
  const submit = async () => {
    try {
      await save.mutateAsync({ id, isNew: !category, input: { name, icon, color } });
      onSaved?.(id);
      onClose();
    } catch (e) {
      setError(t(e instanceof DuplicateNameError ? 'expenses.categoryDialog.duplicate' : errorMessageKey(classifyError(e, isDeviceOnline()), 'expenses.form.saveFailed')));
    }
  };

  const bg = toHex(color);
  return (
    <DialogShell visible onClose={onClose}>
      <AppText variant="heading" style={styles.title}>
        {t(category ? 'expenses.categoryDialog.editTitle' : 'expenses.categoryDialog.addTitle')}
      </AppText>
      <TextField
        label={t('expenses.categoryDialog.name')}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(null);
        }}
        maxLength={CATEGORY_NAME_MAX}
        autoFocus={!category}
        error={error}
      />
      <Label text={t('expenses.categoryDialog.icon')} />
      <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent} nestedScrollEnabled>
        {ICON_ROWS.map((row) => (
          <View key={row[0]} style={styles.gridRow}>
            {row.map((k) => {
              const on = k === icon;
              return (
                <Pressable
                  key={k}
                  accessibilityRole="radio"
                  accessibilityLabel={k}
                  accessibilityState={{ selected: on }}
                  onPress={() => setIcon(k)}
                  style={[styles.cell, { backgroundColor: on ? bg : colors.bg }]}>
                  {on ? <View style={styles.ring} /> : null}
                  <Icon name={k} size={22} color={on ? textOn(bg) : colors.text} />
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
      <Label text={t('expenses.categoryDialog.color')} />
      <View style={styles.colors}>
        <ColorRow value={color} onChange={setColor} />
      </View>
      <View style={styles.actions}>
        <Button label={t('common.cancel')} variant="secondary" onPress={onClose} style={styles.flex} />
        <Button label={t('expenses.form.save')} onPress={submit} disabled={!name.trim() || save.isPending || !canWrite} style={styles.flex} />
      </View>
    </DialogShell>
  );
}

function Label({ text }: { text: string }) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.label}>
      {text}
    </AppText>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  title: { textAlign: 'center', marginBottom: space.lg },
  label: { marginHorizontal: space.xs, marginTop: 14, marginBottom: 6 },
  // Three rows visible, the rest scroll inside the box; columns share the width (a 360 dp phone is too narrow for 6 × 40).
  grid: { maxHeight: 3 * CELL + 2 * GAP + 8 },
  gridContent: { gap: GAP, padding: 4 },
  gridRow: { flexDirection: 'row', gap: GAP },
  cell: { flex: 1, height: CELL, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  // "viền 2 text cách 2": a ring 2 px outside the cell.
  ring: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 16, borderWidth: 2, borderColor: colors.text },
  colors: { alignItems: 'center', paddingBottom: space.md },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
}));
