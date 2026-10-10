import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/features/auth/AuthProvider';
import { isEmptyNote } from '@/lib/notes';
import * as api from '../api';
import { draftOf, EMPTY_DRAFT, type Note, type NoteDraft } from '../note';
import { useInvalidateNotes } from '../useNotes';

const AUTOSAVE_MS = 2000;

export type SaveResult = 'ok' | 'empty' | 'conflict' | 'error';

// Editor state + autosave (F5): Back / app to background / 2 s after typing stops → save if
// changed. Optimistic lock on `updated_at`; the first save inserts with the id made on open.
export function useNoteEditor({ id, note, initialCategoryId }: { id: string; note: Note | null; initialCategoryId: string | null }) {
  const { recheckSession } = useAuth();
  const invalidate = useInvalidateNotes();
  const start = note ? draftOf(note) : { ...EMPTY_DRAFT, categoryId: initialCategoryId };
  const [draft, setDraft] = useState<NoteDraft>(start);
  const [conflict, setConflict] = useState(false);
  const [failed, setFailed] = useState(false);
  const draftRef = useRef(draft);
  const startJson = JSON.stringify(start);
  const savedRef = useRef(startJson);
  const [savedJson, setSavedJson] = useState(startJson);
  const updatedAtRef = useRef<string | null>(note?.updatedAt ?? null);
  const queueRef = useRef<Promise<SaveResult>>(Promise.resolve('ok'));

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const write = useCallback(async (): Promise<SaveResult> => {
    const snapshot = draftRef.current;
    const json = JSON.stringify(snapshot);
    if (json === savedRef.current) return 'ok';
    if (isEmptyNote(snapshot)) return 'empty';
    try {
      const saved = updatedAtRef.current
        ? await api.updateNote(id, updatedAtRef.current, snapshot)
        : await api.createNote(id, snapshot);
      savedRef.current = json;
      setSavedJson(json);
      updatedAtRef.current = saved.updatedAt;
      setFailed(false);
      void invalidate();
      return 'ok';
    } catch (e) {
      if (e instanceof api.ConflictError) {
        setConflict(true);
        return 'conflict';
      }
      if (e instanceof api.ForbiddenError) await recheckSession();
      setFailed(true);
      return 'error';
    }
  }, [id, invalidate, recheckSession]);

  // Saves run one after another so two autosaves never race on the same `updated_at`.
  const save = useCallback(() => {
    queueRef.current = queueRef.current.then(write, write);
    return queueRef.current;
  }, [write]);

  const dirty = JSON.stringify(draft) !== savedJson;

  useEffect(() => {
    if (!dirty || conflict) return;
    const timer = setTimeout(() => void save(), AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [draft, dirty, conflict, save]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') void save();
    });
    return () => sub.remove();
  }, [save]);

  const reset = (fresh: Note) => {
    const next = draftOf(fresh);
    savedRef.current = JSON.stringify(next);
    setSavedJson(savedRef.current);
    updatedAtRef.current = fresh.updatedAt;
    setDraft(next);
  };

  return {
    draft,
    setDraft,
    dirty,
    failed,
    save,
    exists: () => updatedAtRef.current !== null,
    conflict: {
      visible: conflict,
      // "Tải bản mới": drop local edits, show the other device's version.
      onReload: async () => {
        setConflict(false);
        const fresh = await api.fetchNote(id).catch(() => null);
        if (fresh && !fresh.deletedAt) reset(fresh);
      },
      // "Ghi đè": take the current `updated_at`, then save this version over it.
      onOverwrite: async () => {
        setConflict(false);
        const fresh = await api.fetchNote(id).catch(() => null);
        updatedAtRef.current = fresh?.updatedAt ?? null;
        await save();
      },
    },
  };
}
