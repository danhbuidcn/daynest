import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/Dialog';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { useErrorToast } from '@/features/network/useErrorToast';
import { NoteCard } from '@/features/notes/NoteCard';
import { useCategories, useDeleteNoteForever, useEmptyTrash, useRestoreNote, useTrashList } from '@/features/notes/useNotes';
import { makeStyles, space, useTheme } from '@/theme';

// Màn 20 — Thùng rác · 20b xác nhận xoá tất cả.
export default function TrashScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const failed = useErrorToast();
  const list = useTrashList();
  const categories = useCategories().data ?? [];
  const restore = useRestoreNote();
  const deleteForever = useDeleteNoteForever();
  const empty = useEmptyTrash();
  const [askDelete, setAskDelete] = useState<string | null>(null);
  const [askAll, setAskAll] = useState(false);
  const onError = failed('notes.actionFailed');

  const nearEnd = ({ nativeEvent: e }: { nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } } }) => {
    if (e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height - 400 && list.hasNextPage && !list.isFetchingNextPage) {
      void list.fetchNextPage();
    }
  };

  const deleteAllButton =
    list.notes.length > 0 ? (
      <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setAskAll(true)}>
        <AppText weight="bold" color={colors.error} numberOfLines={1}>
          {t('notes.trash.deleteAll')}
        </AppText>
      </Pressable>
    ) : undefined;

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.side}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={8} onPress={() => router.back()} style={styles.back}>
            <Icon name="back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <AppText variant="title" style={styles.title} numberOfLines={1}>
          {t('notes.trash.title')}
        </AppText>
        <View style={[styles.side, styles.right]}>{deleteAllButton}</View>
      </View>
      <ScrollView contentContainerStyle={styles.content} onScroll={nearEnd} scrollEventThrottle={200}>
        {list.isLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
        {list.isSuccess && list.notes.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.bubble}>
              <Icon name="trash" size={44} color={colors.primary} />
            </View>
            <AppText variant="heading">{t('notes.trash.empty')}</AppText>
          </View>
        ) : null}
        {list.notes.map((note) => (
          <View key={note.id} style={styles.item}>
            <NoteCard
              note={note}
              color={categories.find((c) => c.id === note.categoryId)?.color ?? null}
              dateLabel={(date) => t('notes.trash.deletedOn', { date })}
            />
            <View style={styles.actions}>
              <Button
                label={t('notes.trash.restore')}
                variant="secondary"
                icon={<Icon name="restore" size={18} color={colors.text} />}
                onPress={() => restore.mutate(note.id, { onSuccess: () => toast(t('notes.trash.restored')), onError })}
                style={styles.action}
              />
              <Button label={t('notes.trash.deleteForever')} variant="dangerSoft" onPress={() => setAskDelete(note.id)} style={styles.action} />
            </View>
          </View>
        ))}
        {list.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
      </ScrollView>

      <ConfirmDialog
        visible={!!askDelete}
        icon="trash"
        title={t('notes.trash.deleteForeverTitle')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('notes.delete')}
        onCancel={() => setAskDelete(null)}
        onConfirm={() => {
          const id = askDelete!;
          setAskDelete(null);
          deleteForever.mutate(id, { onError });
        }}
      />
      <ConfirmDialog
        visible={askAll}
        icon="trash"
        title={t('notes.trash.deleteAllTitle')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('notes.trash.deleteAll')}
        onCancel={() => setAskAll(false)}
        onConfirm={() => {
          setAskAll(false);
          empty.mutate(undefined, { onError });
        }}
      />
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: space.sm },
  side: { width: 88 },
  right: { alignItems: 'flex-end' },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: space.lg, gap: space.md, paddingBottom: space.xl },
  item: { gap: space.sm },
  actions: { flexDirection: 'row', gap: space.sm },
  action: { flex: 1, height: 40 },
  loading: { marginVertical: space.xl },
  empty: { alignItems: 'center', gap: space.md, paddingTop: 80 },
  bubble: { width: 96, height: 96, borderRadius: 34, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
}));
