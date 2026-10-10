import { describe, expect, it } from '@jest/globals';

import { layoutDay, MIN_BLOCK_MINUTES } from '@/lib/calendar/dayLayout';

const h = (hours: number) => hours * 60;

describe('layoutDay', () => {
  it('gives a lone event the full width', () => {
    expect(layoutDay([{ id: 'a', start: h(15), end: h(15.5) }])).toEqual([
      { id: 'a', top: h(15), height: 30, column: 0, columns: 1 },
    ]);
  });

  it('puts overlapping events side by side', () => {
    const blocks = layoutDay([
      { id: 'meet', start: h(10), end: h(11) },
      { id: 'call', start: h(10.5), end: h(11.5) },
      { id: 'dentist', start: h(15), end: h(15.5) },
    ]);
    expect(blocks.find((b) => b.id === 'meet')).toMatchObject({ column: 0, columns: 2 });
    expect(blocks.find((b) => b.id === 'call')).toMatchObject({ column: 1, columns: 2 });
    expect(blocks.find((b) => b.id === 'dentist')).toMatchObject({ column: 0, columns: 1 });
  });

  it('reuses a free column inside one overlap group', () => {
    const blocks = layoutDay([
      { id: 'long', start: h(9), end: h(12) },
      { id: 'early', start: h(9), end: h(10) },
      { id: 'late', start: h(10), end: h(11) },
    ]);
    expect(blocks.map((b) => [b.id, b.column, b.columns])).toEqual([
      ['long', 0, 2],
      ['early', 1, 2],
      ['late', 1, 2],
    ]);
  });

  it('does not treat back-to-back events as overlapping', () => {
    const blocks = layoutDay([
      { id: 'a', start: h(8), end: h(9) },
      { id: 'b', start: h(9), end: h(10) },
    ]);
    expect(blocks.every((b) => b.columns === 1)).toBe(true);
  });

  it('clips an event that runs over from the previous or into the next day', () => {
    const [block] = layoutDay([{ id: 'night', start: -h(2), end: h(26) }]);
    expect(block).toMatchObject({ top: 0, height: h(24) });
  });

  it('keeps a very short event tall enough to tap', () => {
    const [block] = layoutDay([{ id: 'zero', start: h(23.9), end: h(23.9) }]);
    expect(block.height).toBe(MIN_BLOCK_MINUTES);
    expect(block.top + block.height).toBe(h(24));
  });
});
