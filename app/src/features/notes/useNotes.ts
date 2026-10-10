import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useToast } from '@/components/Toast';
import type { EventColor } from '@/features/events/event';
import { useForbiddenGuard } from '@/features/events/useEvents';
import * as api from './api';

export const NOTES_KEY = 'notes';
export const CATEGORIES_KEY = 'noteCategories';

export function useNotesList(categoryId: string | null, query: string) {
  const result = useInfiniteQuery({
    queryKey: [NOTES_KEY, 'list', categoryId, query],
    initialPageParam: null as api.NotesCursor | null,
    queryFn: ({ pageParam }) => api.fetchNotesPage({ categoryId, query, cursor: pageParam }),
    getNextPageParam: (last) => last.next,
  });
  const notes = result.data?.pages.flatMap((p) => p.notes) ?? [];
  return { ...result, notes };
}

export function useTrashList() {
  const result = useInfiniteQuery({
    queryKey: [NOTES_KEY, 'trash'],
    initialPageParam: null as api.TrashCursor | null,
    queryFn: ({ pageParam }) => api.fetchTrashPage(pageParam),
    getNextPageParam: (last) => last.next,
  });
  const notes = result.data?.pages.flatMap((p) => p.notes) ?? [];
  return { ...result, notes };
}

export function useNote(id: string, enabled: boolean) {
  return useQuery({ queryKey: [NOTES_KEY, 'one', id], queryFn: () => api.fetchNote(id), enabled, gcTime: 0 });
}

export function useCategories() {
  return useQuery({ queryKey: [CATEGORIES_KEY], queryFn: api.fetchCategories });
}

export function useInvalidateNotes() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: [NOTES_KEY] }),
        queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
      ]),
    [queryClient],
  );
}

// Wraps a notes API call: RLS rejection → re-check the session (F7); success → refetch lists.
function useNotesMutation<V>(run: (vars: V) => Promise<unknown>) {
  const guard = useForbiddenGuard();
  const invalidate = useInvalidateNotes();
  return useMutation({ mutationFn: (vars: V) => guard(() => run(vars)), onSuccess: invalidate });
}

export const useMoveNote = () => useNotesMutation((v: { id: string; categoryId: string | null }) => api.moveNote(v.id, v.categoryId));
export const useRestoreNote = () => useNotesMutation((id: string) => api.setNotesTrashed([id], false));
export const useDeleteNoteForever = () => useNotesMutation((id: string) => api.deleteNoteForever(id));
export const useEmptyTrash = () => useNotesMutation(() => api.emptyTrash());
export const useSaveCategory = () =>
  useNotesMutation((v: { id?: string; name: string; color: EventColor }) => api.saveCategory(v));
export const useDeleteCategories = () => useNotesMutation((ids: string[]) => api.deleteCategories(ids));

// "Xoá" on a card or in the editor: to the trash without asking, toast + "Hoàn tác" (F5).
export function useTrashNote() {
  const { t } = useTranslation();
  const toast = useToast();
  const trash = useNotesMutation((id: string) => api.setNotesTrashed([id], true));
  const restore = useRestoreNote();
  return async (id: string): Promise<boolean> => {
    try {
      await trash.mutateAsync(id);
      toast(t('notes.trashed'), 'info', { label: t('notes.undo'), onPress: () => restore.mutate(id) });
      return true;
    } catch {
      toast(t('notes.actionFailed'), 'error');
      return false;
    }
  };
}
