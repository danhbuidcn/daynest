import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { DialogShell } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { CATEGORY_MAX } from '@/lib/notes';
import { toHex } from '@/lib/colors';
import { colors, radius, space } from '@/theme';
import { CategoryEditDialog } from './CategoryEditDialog';
import { useCategories } from './useNotes';

// "Di chuyển đến" (thẻ note) and the "+ Danh mục" chip in the editor: pick 0 or 1 category,
// or add a new one on the spot.
export function CategoryPickerDialog({
  visible,
  title,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const categories = useCategories().data ?? [];
  const [adding, setAdding] = useState(false);

  const option = (id: string | null, label: string, dot?: string) => {
    const on = id === selected;
    return (
      <Pressable
        key={id ?? 'none'}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        onPress={() => onSelect(id)}
        style={[styles.option, on && { backgroundColor: colors.primarySoft }]}>
        <View style={[styles.dot, dot ? { backgroundColor: dot } : styles.dotEmpty]} />
        <AppText weight={on ? 'extrabold' : undefined} numberOfLines={1} style={styles.flex}>
          {label}
        </AppText>
        {on ? <Icon name="check" size={22} color={colors.primary} /> : null}
      </Pressable>
    );
  };

  return (
    <>
      <DialogShell visible={visible && !adding} onClose={onClose} compact>
        <AppText variant="heading" style={styles.title}>
          {title}
        </AppText>
        <ScrollView style={styles.list}>
          {option(null, t('notes.noCategory'))}
          {categories.map((c) => option(c.id, c.name, toHex(c.color)))}
        </ScrollView>
        {categories.length < CATEGORY_MAX ? (
          <Pressable accessibilityRole="button" onPress={() => setAdding(true)} style={styles.option}>
            <Icon name="plus" size={20} color={colors.primaryDark} />
            <AppText weight="bold" color={colors.primaryDark}>
              {t('notes.categories.add')}
            </AppText>
          </Pressable>
        ) : null}
      </DialogShell>
      {visible && adding ? <CategoryEditDialog onClose={() => setAdding(false)} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', marginBottom: space.md },
  list: { maxHeight: 360 },
  option: { height: 52, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, borderRadius: radius.button },
  dot: { width: 14, height: 14, borderRadius: 7 },
  dotEmpty: { borderWidth: 1.5, borderColor: colors.border },
  flex: { flex: 1 },
});
