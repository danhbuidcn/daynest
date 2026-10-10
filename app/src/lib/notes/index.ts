export type ChecklistItem = { id: string; text: string; done: boolean };

export type NoteContent = { title: string; body: string; checklist: ChecklistItem[] };

export const NOTE_TITLE_MAX = 200;
export const NOTE_BODY_MAX = 20000;
export const CHECKLIST_ITEM_MAX = 200;
export const CHECKLIST_MAX_ITEMS = 100;
export const CATEGORY_NAME_MAX = 30;
export const CATEGORY_MAX = 30;
export const SEARCH_MAX = 100;
export const NOTES_PAGE_SIZE = 30;

// Lowercase, no Vietnamese diacritics ("Ghi chú Đà" → "ghi chu da") — the same folding is applied
// to `notes.search_text` and to the query, so "ghi chu" finds "ghi chú" (F5, db.md).
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function buildSearchText(note: NoteContent): string {
  return foldText([note.title, note.body, ...note.checklist.map((i) => i.text)].join('\n'));
}

// Nothing typed anywhere → the note is not saved (F5).
export function isEmptyNote(note: NoteContent): boolean {
  return note.title.trim() === '' && note.body.trim() === '' && note.checklist.every((i) => i.text.trim() === '');
}

export function checklistProgress(items: ChecklistItem[]): { done: number; total: number } {
  const filled = items.filter((i) => i.text.trim() !== '');
  return { done: filled.filter((i) => i.done).length, total: filled.length };
}

// Card heading: the title, or the first non-empty line of the body when there is no title.
export function noteHeadline(note: NoteContent): string {
  if (note.title.trim()) return note.title.trim();
  return note.body.split('\n').find((l) => l.trim() !== '')?.trim() ?? '';
}

// `%`, `_` and `\` are wildcards in `ilike`; escape them so a search for "50%" matches literally.
export function ilikePattern(query: string): string {
  return `%${foldText(query.trim()).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}
