import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionMenu, MoreButton } from '@/components/ActionMenu';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedBar } from '@/components/SegmentedBar';
import { CategoryChips } from '@/features/notes/CategoryChips';
import { newNoteHref, setActiveNoteFilter } from '@/features/notes/newNote';
import { NoteGrid } from '@/features/notes/NoteGrid';
import { SearchBox } from '@/features/notes/SearchBox';
import { useCategories, useNotesCount, useNotesList } from '@/features/notes/useNotes';
import { TodoList } from '@/features/todos/TodoList';
import { colors, space } from '@/theme';

const SEARCH_DELAY_MS = 300;
const VIEW_KEY = 'manage.view';

type ManageView = 'todo' | 'notes';

// Màn 16 — Ghi chú; S5 adds the Todo | Ghi chú switch (Ghi chú by default, remembered per device).
export default function ManageScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [view, setViewState] = useState<ManageView>('notes');
  const [menuOpen, setMenuOpen] = useState(false);
  const [chosen, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  // Only a pull-to-refresh shows the spinner, not the refetch after every save.
  const [pulling, setPulling] = useState(false);
  const categoriesQuery = useCategories();
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  // The chosen category was deleted (screen 18): fall back to "Tất cả".
  const filter = chosen && categoriesQuery.isSuccess && !categories.some((c) => c.id === chosen) ? null : chosen;
  const list = useNotesList(filter, query);
  const count = useNotesCount(filter);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setActiveNoteFilter(filter), [filter]);

  useEffect(() => {
    AsyncStorage.getItem(VIEW_KEY)
      .then((saved) => {
        if (saved === 'todo' || saved === 'notes') setViewState(saved);
      })
      .catch(() => {});
  }, []);

  const setView = (next: ManageView) => {
    setViewState(next);
    AsyncStorage.setItem(VIEW_KEY, next).catch(() => {});
  };
  const viewOptions = [
    { value: 'todo', label: t('todos.form.title') },
    { value: 'notes', label: t('tabs.manage') },
  ] as const;

  const nearEnd = ({ nativeEvent: e }: { nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } } }) => {
    if (e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height - 400 && list.hasNextPage && !list.isFetchingNextPage) {
      void list.fetchNextPage();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader title={t('tabs.manage')} compact action={view === 'notes' ? <MoreButton onPress={() => setMenuOpen(true)} /> : undefined} />
      <SegmentedBar options={viewOptions} value={view} onChange={setView} />
      {view === 'todo' ? (
        <TodoList />
      ) : (
        <>
          <AppText variant="caption" color={colors.textMuted} style={styles.subcount}>
            {count.data !== undefined ? t('notes.count', { count: count.data }) : ' '}
          </AppText>
          <SearchBox value={search} onChange={setSearch} placeholder={t('notes.search')} />
          <CategoryChips categories={categories} selected={filter} onSelect={setFilter} />
          <ScrollView
            contentContainerStyle={styles.content}
            onScroll={nearEnd}
            scrollEventThrottle={200}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={pulling}
                onRefresh={() => {
                  setPulling(true);
                  void Promise.all([list.refetch(), count.refetch()]).finally(() => setPulling(false));
                }}
              />
            }>
            {query && list.notes.length > 0 && !list.hasNextPage ? (
              <AppText variant="caption" color={colors.textMuted} style={styles.count}>
                {t('notes.results', { count: list.notes.length })}
              </AppText>
            ) : null}
            {list.isLoading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
            {list.isError && list.notes.length === 0 ? (
              <Empty text={t('notes.loadFailed')} action={t('notes.retry')} onAction={() => void list.refetch()} />
            ) : null}
            {list.isSuccess && list.notes.length === 0 ? (
              query ? <Empty text={t('notes.noResults')} /> : <Empty text={t('notes.empty')} action={t('notes.create')} onAction={() => router.push(newNoteHref())} />
            ) : null}
            <NoteGrid notes={list.notes} categories={categories} />
            {list.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.loading} /> : null}
          </ScrollView>
        </>
      )}
      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={[
          { icon: 'folder', label: t('notes.categories.title'), onPress: () => router.push('/note/categories') },
          { icon: 'trash', label: t('notes.trash.title'), onPress: () => router.push('/note/trash') },
        ]}
      />
    </SafeAreaView>
  );
}

function Empty({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.bubble}>
        <Icon name="note" size={44} color={colors.primary} />
      </View>
      <AppText variant="heading" style={styles.center}>
        {text}
      </AppText>
      {action ? <Button label={action} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 120 },
  subcount: { textAlign: 'center', marginBottom: space.sm },
  count: { paddingHorizontal: 20, paddingBottom: space.sm },
  loading: { marginVertical: space.xl },
  empty: { alignItems: 'center', gap: space.md, paddingTop: 80, paddingHorizontal: space.xl },
  bubble: { width: 96, height: 96, borderRadius: 34, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
