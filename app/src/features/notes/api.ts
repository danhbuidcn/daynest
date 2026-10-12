import { ConflictError, ForbiddenError } from '@/features/events/api';
import type { EventColor } from '@/features/events/event';
import { buildSearchText, ilikePattern, NOTES_PAGE_SIZE } from '@/lib/notes';
import { supabase } from '@/lib/supabase';
import { NOTE_COLUMNS, toNote, type Category, type Note, type NoteDraft, type NoteTableRow } from './note';

export { ConflictError, ForbiddenError };

// Unique (user_id, lower(name)) on note_categories.
export class DuplicateNameError extends Error {
  constructor() {
    super('duplicate');
  }
}

function classify(error: unknown): Error {
  const code = error && typeof error === 'object' ? (error as { code?: string }).code : undefined;
  if (code === '42501') return new ForbiddenError();
  if (code === '23505') return new DuplicateNameError();
  if (error instanceof Error) return error;
  return new Error(JSON.stringify(error));
}

// Keyset cursor = the last row of the previous page (db.md: no `offset`, so notes edited while
// scrolling are neither repeated nor skipped).
export type NotesCursor = { pinned: boolean; updatedAt: string; id: string };
export type NotesPage = { notes: Note[]; next: NotesCursor | null };

const q = (v: string) => `"${v}"`;

export async function fetchNotesPage({
  categoryId,
  query,
  cursor,
}: {
  categoryId: string | null;
  query: string;
  cursor: NotesCursor | null;
}): Promise<NotesPage> {
  let req = supabase.from('notes').select(NOTE_COLUMNS).is('deleted_at', null);
  if (categoryId) req = req.eq('category_id', categoryId);
  if (query.trim()) req = req.ilike('search_text', ilikePattern(query));
  if (cursor) {
    const after = `updated_at.lt.${q(cursor.updatedAt)},and(updated_at.eq.${q(cursor.updatedAt)},id.lt.${cursor.id})`;
    req = cursor.pinned ? req.or(`pinned.eq.false,${after}`) : req.eq('pinned', false).or(after);
  }
  const { data, error } = await req
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(NOTES_PAGE_SIZE);
  if (error) throw classify(error);
  const notes = (data ?? []).map((r) => toNote(r as NoteTableRow));
  const last = notes[notes.length - 1];
  return { notes, next: notes.length === NOTES_PAGE_SIZE ? { pinned: last.pinned, updatedAt: last.updatedAt, id: last.id } : null };
}

// "N ghi chú" under the tab title (S3 A): every note outside the trash in the chosen chip, not only loaded pages.
export async function countNotes(categoryId: string | null): Promise<number> {
  let req = supabase.from('notes').select('id', { count: 'exact', head: true }).is('deleted_at', null);
  if (categoryId) req = req.eq('category_id', categoryId);
  const { count, error } = await req;
  if (error) throw classify(error);
  return count ?? 0;
}

export type TrashCursor = { deletedAt: string; id: string };
export type TrashPage = { notes: Note[]; next: TrashCursor | null };

export async function fetchTrashPage(cursor: TrashCursor | null): Promise<TrashPage> {
  let req = supabase.from('notes').select(NOTE_COLUMNS).not('deleted_at', 'is', null);
  if (cursor) req = req.or(`deleted_at.lt.${q(cursor.deletedAt)},and(deleted_at.eq.${q(cursor.deletedAt)},id.lt.${cursor.id})`);
  const { data, error } = await req.order('deleted_at', { ascending: false }).order('id', { ascending: false }).limit(NOTES_PAGE_SIZE);
  if (error) throw classify(error);
  const notes = (data ?? []).map((r) => toNote(r as NoteTableRow));
  const last = notes[notes.length - 1];
  return { notes, next: notes.length === NOTES_PAGE_SIZE ? { deletedAt: last.deletedAt!, id: last.id } : null };
}

export async function fetchNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase.from('notes').select(NOTE_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw classify(error);
  return data ? toNote(data as NoteTableRow) : null;
}

function columns(draft: NoteDraft) {
  return {
    title: draft.title,
    body: draft.body,
    checklist: draft.checklist,
    category_id: draft.categoryId,
    pinned: draft.pinned,
    search_text: buildSearchText(draft),
  };
}

// The id is generated when the editor opens, so retrying a first save whose response got lost
// hits the same row instead of creating a second note (F5).
export async function createNote(id: string, draft: NoteDraft): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .upsert({ id, ...columns(draft) }, { onConflict: 'id' })
    .select(NOTE_COLUMNS)
    .single();
  if (error) throw classify(error);
  return toNote(data as NoteTableRow);
}

export async function updateNote(id: string, readUpdatedAt: string, draft: NoteDraft): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(columns(draft))
    .eq('id', id)
    .eq('updated_at', readUpdatedAt)
    .select(NOTE_COLUMNS);
  if (error) throw classify(error);
  if (!data || data.length === 0) throw new ConflictError();
  return toNote(data[0] as NoteTableRow);
}

export async function setNotesTrashed(ids: string[], trashed: boolean): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ deleted_at: trashed ? new Date().toISOString() : null })
    .in('id', ids);
  if (error) throw classify(error);
}

export async function moveNote(id: string, categoryId: string | null): Promise<void> {
  const { error } = await supabase.from('notes').update({ category_id: categoryId }).eq('id', id);
  if (error) throw classify(error);
}

export async function deleteNoteForever(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw classify(error);
}

export async function emptyTrash(): Promise<void> {
  const { error } = await supabase.from('notes').delete().not('deleted_at', 'is', null);
  if (error) throw classify(error);
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('note_categories')
    .select('id, name, color, notes(count)')
    .is('notes.deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) throw classify(error);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    color: r.color as EventColor,
    noteCount: (r.notes as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

// Create upserts on an `id` generated when the dialog opened, so a retry doesn't hit the
// unique-name index and wrongly report "Tên này đã có".
export async function saveCategory(input: { id: string; isNew: boolean; name: string; color: EventColor }): Promise<void> {
  const values = { name: input.name.trim(), color: input.color };
  const { error } = input.isNew
    ? await supabase.from('note_categories').upsert({ id: input.id, ...values }, { onConflict: 'id' })
    : await supabase.from('note_categories').update(values).eq('id', input.id);
  if (error) throw classify(error);
}

// Trashes the notes inside, then deletes the categories — one transaction in the DB (db.md).
export async function deleteCategories(ids: string[]): Promise<void> {
  const { error } = await supabase.rpc('delete_note_categories', { p_ids: ids });
  if (error) throw classify(error);
}
