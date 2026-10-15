import { describe, expect, it } from '@jest/globals';

import { dayBars, type BarItem } from '@/lib/calendar/eventBars';

const ev = (id: string, title = id): BarItem => ({ kind: 'event', id, title, color: 'mint' });
const hol = (id: string, title = id): BarItem => ({ kind: 'holiday', id, title });

describe('dayBars', () => {
  it('shows nothing for an empty day', () => {
    expect(dayBars([])).toEqual({ shown: [], extra: 0 });
  });

  it('keeps everything when under the cap', () => {
    const items = [hol('h1'), ev('e1'), ev('e2')];
    expect(dayBars(items)).toEqual({ shown: items, extra: 0 });
  });

  it('moves a holiday to the front even if it comes later in the input', () => {
    const items = [ev('e1'), ev('e2'), hol('h1')];
    const { shown } = dayBars(items);
    expect(shown.map((b) => b.id)).toEqual(['h1', 'e1', 'e2']);
  });

  it('caps at 5 and counts the rest, holiday counted first', () => {
    const items = [ev('e1'), ev('e2'), hol('h1'), ev('e3'), ev('e4'), ev('e5'), ev('e6')];
    const { shown, extra } = dayBars(items);
    expect(shown.map((b) => b.id)).toEqual(['h1', 'e1', 'e2', 'e3', 'e4']);
    expect(extra).toBe(2);
  });
});
