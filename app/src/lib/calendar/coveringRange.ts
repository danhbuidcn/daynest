export type LoadedRange<T> = { from: string; to: string; value: T };

// Among ranges already loaded (ISO dates, inclusive), the narrowest one that contains
// [from, to] — its data then holds every event of the smaller range too.
export function narrowestCovering<T>(loaded: LoadedRange<T>[], from: string, to: string): T | undefined {
  let best: LoadedRange<T> | undefined;
  for (const r of loaded) {
    if (r.from > from || r.to < to) continue;
    if (!best || span(r) < span(best)) best = r;
  }
  return best?.value;
}

function span(r: { from: string; to: string }): number {
  return Date.parse(r.to) - Date.parse(r.from);
}
