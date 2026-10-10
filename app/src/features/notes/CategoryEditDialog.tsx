import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DialogShell } from '@/components/Dialog';
import { TextField } from '@/components/TextField';
import type { EventColor } from '@/features/events/event';
import { ColorPicker } from '@/features/events/form/ColorPicker';
import { CATEGORY_NAME_MAX } from '@/lib/notes';
import { space } from '@/theme';
import { DuplicateNameError } from './api';
import type { Category } from './note';
import { useSaveCategory } from './useNotes';

// Thêm / Sửa danh mục (màn 19): tên + 6 màu · Huỷ / Lưu, no delete button (F5).
// Rendered only while open, so its state starts fresh each time.
export function CategoryEditDialog({
  category,
  onClose,
  onSaved,
}: {
  category?: Category;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { t } = useTranslation();
  const save = useSaveCategory();
  const [name, setName] = useState(category?.name ?? '');
  const [color, setColor] = useState<EventColor>(category?.color ?? 'mint');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      await save.mutateAsync({ id: category?.id, name, color });
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e instanceof DuplicateNameError ? t('notes.categories.duplicate') : t('notes.actionFailed'));
    }
  };

  return (
    <DialogShell visible onClose={onClose}>
      <AppText variant="heading" style={styles.title}>
        {category ? t('notes.categories.edit') : t('notes.categories.add')}
      </AppText>
      <TextField
        label={t('notes.categories.name')}
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(null);
        }}
        maxLength={CATEGORY_NAME_MAX}
        autoFocus
        error={error}
      />
      <View style={styles.colors}>
        <ColorPicker value={color} onChange={setColor} />
      </View>
      <View style={styles.actions}>
        <Button label={t('common.cancel')} variant="secondary" onPress={onClose} style={styles.flex} />
        <Button label={t('notes.save')} onPress={submit} disabled={!name.trim() || save.isPending} style={styles.flex} />
      </View>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', marginBottom: space.lg },
  colors: { alignItems: 'center', paddingTop: space.sm, paddingBottom: space.md },
  actions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});
