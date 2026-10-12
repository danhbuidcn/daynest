import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ActionMenu } from '@/components/ActionMenu';
import { AppText } from '@/components/AppText';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { groupNotesByMonth, type NoteGroup } from '@/lib/notes/groups';
import { colors, space } from '@/theme';
import { CategoryPickerDialog } from './CategoryPickerDialog';
import type { Category, Note } from './note';
import { NoteCard } from './NoteCard';
import { useMoveNote, useTrashNote } from './useNotes';

type MenuState = { note: Note; top: number; right: number };

// Lưới 2 cột (màn 16): "Đã ghim" then one group per month (S3 B); inside a group cards alternate
// left/right like the mockup. Each card's `⋯` opens Xoá · Di chuyển đến without entering the editor.
export function NoteGrid({ notes, categories }: { notes: Note[]; categories: Category[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { width } = useWindowDimensions();
  const { settings } = useAuth();
  const trash = useTrashNote();
  const move = useMoveNote();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [moving, setMoving] = useState<Note | null>(null);
  const colorOf = (id: string | null) => categories.find((c) => c.id === id)?.color ?? null;

  const groupTitle = (g: NoteGroup<Note>) => {
    if (g.pinned) return t('notes.pinned');
    const month = t(`calendar.months.${g.month}`);
    return g.thisYear ? month : t('calendar.monthTitle', { month, year: g.year });
  };

  const column = (list: Note[], offset: number) => (
    <View style={styles.column}>
      {list
        .filter((_, i) => i % 2 === offset)
        .map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            color={colorOf(note.categoryId)}
            onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
            onMore={(a) => setMenu({ note, top: a.y + a.height + space.xs, right: Math.max(space.lg, width - a.x - a.width) })}
          />
        ))}
    </View>
  );

  return (
    <>
      <View style={styles.groups}>
        {groupNotesByMonth(notes, settings.timeZone).map((g) => (
          <View key={g.key} style={styles.group}>
            <View style={styles.head}>
              {g.pinned ? <Icon name="pin" size={14} color={colors.primaryDark} /> : null}
              <AppText weight="extrabold">{groupTitle(g)}</AppText>
            </View>
            <View style={styles.grid}>
              {column(g.notes, 0)}
              {column(g.notes, 1)}
            </View>
          </View>
        ))}
      </View>
      <ActionMenu
        visible={!!menu}
        top={menu?.top}
        right={menu?.right}
        onClose={() => setMenu(null)}
        actions={
          menu
            ? [
                { icon: 'folder', label: t('notes.moveTo'), onPress: () => setMoving(menu.note) },
                { icon: 'trash', label: t('notes.delete'), danger: true, onPress: () => void trash(menu.note.id) },
              ]
            : []
        }
      />
      <CategoryPickerDialog
        visible={!!moving}
        title={t('notes.moveTo')}
        selected={moving?.categoryId ?? null}
        onClose={() => setMoving(null)}
        onSelect={(categoryId) => {
          const note = moving!;
          setMoving(null);
          if (categoryId !== note.categoryId) {
            move.mutate({ id: note.id, categoryId }, { onError: () => toast(t('notes.actionFailed'), 'error') });
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  groups: { gap: space.lg },
  group: { gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20 },
  grid: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg },
  column: { flex: 1, gap: space.md },
});
