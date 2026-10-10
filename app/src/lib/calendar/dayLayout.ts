// Minutes since 00:00 of the shown day; may be < 0 or > 1440 for events crossing midnight.
export type TimedSpan = { id: string; start: number; end: number };

export type DayBlock = { id: string; top: number; height: number; column: number; columns: number };

const DAY_MINUTES = 24 * 60;
export const MIN_BLOCK_MINUTES = 15;

// Day view (F1): events that overlap in time sit side by side. Each group of transitively
// overlapping events shares one column count, so blocks in a group line up.
export function layoutDay(spans: TimedSpan[]): DayBlock[] {
  const sorted = spans
    .map((s) => {
      const start = Math.min(Math.max(s.start, 0), DAY_MINUTES - MIN_BLOCK_MINUTES);
      const end = Math.max(Math.min(s.end, DAY_MINUTES), start + MIN_BLOCK_MINUTES);
      return { id: s.id, start, end };
    })
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const blocks: DayBlock[] = [];
  let group: DayBlock[] = [];
  let columnEnds: number[] = [];
  let groupEnd = -1;

  const closeGroup = () => {
    for (const b of group) b.columns = columnEnds.length;
    group = [];
    columnEnds = [];
  };

  for (const s of sorted) {
    if (s.start >= groupEnd) closeGroup();
    let column = columnEnds.findIndex((end) => end <= s.start);
    if (column === -1) column = columnEnds.push(0) - 1;
    columnEnds[column] = s.end;
    groupEnd = Math.max(groupEnd, s.end);
    const block = { id: s.id, top: s.start, height: s.end - s.start, column, columns: 1 };
    group.push(block);
    blocks.push(block);
  }
  closeGroup();
  return blocks;
}
