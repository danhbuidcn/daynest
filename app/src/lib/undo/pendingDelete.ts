import { AppState } from 'react-native';

export const UNDO_MS = 4000;

type Pending = { timer: ReturnType<typeof setTimeout>; restore: () => void; send: () => void };

const pending = new Set<Pending>();
let watching = false;

function flush() {
  for (const p of [...pending]) p.send();
}

// Backgrounded within the undo window: the delete goes out now, or it could be lost.
function watchAppState() {
  if (watching) return;
  watching = true;
  AppState.addEventListener('change', (state) => {
    if (state !== 'active') flush();
  });
}

// `hide` takes the item off screen and returns what puts it back. The delete itself (`commit`)
// is sent after UNDO_MS, or at once when another delete starts or the app leaves the foreground.
// A failed `commit` puts the item back. Returns the undo.
export function scheduleDelete({
  hide,
  commit,
  onError,
}: {
  hide: () => () => void;
  commit: () => Promise<unknown>;
  onError: (e: unknown) => void;
}): () => void {
  watchAppState();
  flush();
  const restore = hide();
  const entry: Pending = {
    restore,
    timer: setTimeout(() => entry.send(), UNDO_MS),
    send: () => {
      if (!pending.delete(entry)) return;
      clearTimeout(entry.timer);
      commit().catch((e) => {
        restore();
        onError(e);
      });
    },
  };
  pending.add(entry);
  return () => {
    if (!pending.delete(entry)) return;
    clearTimeout(entry.timer);
    restore();
  };
}
