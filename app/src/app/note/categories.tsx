import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionMenu, MoreButton } from '@/components/ActionMenu';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useToast } from '@/components/Toast';
import { CategoryEditDialog } from '@/features/notes/CategoryEditDialog';
import type { Category } from '@/features/notes/note';
import { useCategories, useDeleteCategories } from '@/features/notes/useNotes';
import { CATEGORY_MAX } from '@/lib/notes';
import { colors, eventColors, space } from '@/theme';

// Màn 18 — Danh mục · 18b chọn để xoá · 18c xác nhận · 19 thêm/sửa.
export default function CategoriesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const categories = useCategories().data ?? [];
  const remove = useDeleteCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const noteCount = categories.filter((c) => selected.includes(c.id)).reduce((n, c) => n + c.noteCount, 0);

  const stopSelecting = () => {
    setSelecting(false);
    setSelected([]);
  };
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      {selecting ? (
        <ScreenHeader title={t('notes.categories.selected', { count: selected.length })} onBack={stopSelecting} closeIcon compact />
      ) : (
        <ScreenHeader
          title={t('notes.categories.title')}
          onBack={() => router.back()}
          compact
          action={categories.length > 0 ? <MoreButton onPress={() => setMenuOpen(true)} /> : undefined}
        />
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {categories.length > 0 ? (
          <Card>
            {categories.map((c, i) => (
              <Pressable
                key={c.id}
                accessibilityRole={selecting ? 'checkbox' : 'button'}
                accessibilityState={selecting ? { checked: selected.includes(c.id) } : undefined}
                onPress={() => (selecting ? toggle(c.id) : setEditing(c))}
                style={[styles.row, i > 0 && styles.divider]}>
                {selecting ? (
                  <View style={[styles.tick, selected.includes(c.id) && styles.tickOn]}>
                    {selected.includes(c.id) ? <Icon name="check" size={14} color={colors.white} /> : null}
                  </View>
                ) : null}
                <View style={[styles.dot, { backgroundColor: eventColors[c.color] }]} />
                <AppText numberOfLines={1} style={styles.flex}>
                  {c.name}
                </AppText>
                <AppText color={colors.textMuted}>{t('notes.categories.count', { count: c.noteCount })}</AppText>
                {selecting ? null : <Icon name="pen" size={20} color={colors.textMuted} />}
              </Pressable>
            ))}
          </Card>
        ) : null}
        {selecting ? null : (
          <AppText variant="caption" color={colors.textMuted} style={styles.hint}>
            {t('notes.categories.hint', { max: CATEGORY_MAX })}
          </AppText>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {selecting ? (
          <Button
            label={t('notes.categories.deleteN', { count: selected.length })}
            variant="danger"
            icon={<Icon name="trash" size={20} color={colors.white} />}
            disabled={selected.length === 0}
            onPress={() => setConfirmOpen(true)}
          />
        ) : (
          <Button
            label={t('notes.categories.add')}
            icon={<Icon name="plus" size={20} color={colors.white} />}
            disabled={categories.length >= CATEGORY_MAX}
            onPress={() => setEditing('new')}
          />
        )}
      </View>

      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={[{ icon: 'trash', label: t('notes.categories.selectToDelete'), danger: true, onPress: () => setSelecting(true) }]}
      />
      {editing ? <CategoryEditDialog category={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} /> : null}
      <ConfirmDialog
        visible={confirmOpen}
        icon="trash"
        title={t('notes.categories.confirmTitle', { count: selected.length })}
        text={noteCount > 0 ? t('notes.categories.confirmText', { count: noteCount }) : ''}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('notes.delete')}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          remove.mutate(selected, { onSuccess: stopSelecting, onError: () => toast(t('notes.actionFailed'), 'error') });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.lg, gap: space.lg, paddingBottom: space.xl },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  dot: { width: 20, height: 20, borderRadius: 10 },
  tick: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  tickOn: { backgroundColor: colors.primary },
  flex: { flex: 1 },
  hint: { paddingHorizontal: space.xs },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.lg },
});
