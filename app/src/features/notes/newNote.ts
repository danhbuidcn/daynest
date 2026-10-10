import * as Crypto from 'expo-crypto';

// The category chip selected on the notes list — a note created from the `+` popup lands in it (F5).
let activeFilter: string | null = null;

export function setActiveNoteFilter(categoryId: string | null) {
  activeFilter = categoryId;
}

// The id is made here, before the editor opens, so repeated autosaves write one row (F5).
export function newNoteHref() {
  return {
    pathname: '/note/[id]' as const,
    params: { id: Crypto.randomUUID(), isNew: '1', categoryId: activeFilter ?? '' },
  };
}
