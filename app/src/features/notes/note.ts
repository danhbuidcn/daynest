import type { AppColor } from '@/lib/colors';
import type { ChecklistItem, NoteContent } from '@/lib/notes';

export type Note = NoteContent & {
  id: string;
  categoryId: string | null;
  pinned: boolean;
  deletedAt: string | null;
  updatedAt: string;
};

// What the editor writes: content + pin + category, no server-managed fields.
export type NoteDraft = NoteContent & { categoryId: string | null; pinned: boolean };

export type Category = { id: string; name: string; color: AppColor; noteCount: number };

export type NoteTableRow = {
  id: string;
  category_id: string | null;
  title: string;
  body: string;
  checklist: ChecklistItem[];
  pinned: boolean;
  deleted_at: string | null;
  updated_at: string;
};

export const NOTE_COLUMNS = 'id, category_id, title, body, checklist, pinned, deleted_at, updated_at';

export function toNote(row: NoteTableRow): Note {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    body: row.body,
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    pinned: row.pinned,
    deletedAt: row.deleted_at,
    updatedAt: row.updated_at,
  };
}

export function draftOf(note: Note): NoteDraft {
  return { title: note.title, body: note.body, checklist: note.checklist, categoryId: note.categoryId, pinned: note.pinned };
}

export const EMPTY_DRAFT: NoteDraft = { title: '', body: '', checklist: [], categoryId: null, pinned: false };
