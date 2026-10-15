import { describe, expect, it } from '@jest/globals';

import { INITIAL_COLLAPSE, reduceCollapse, SETTLE_MS, type CollapseState } from '@/lib/calendar/headerCollapse';

const feed = (state: CollapseState, offsets: number[], start = 1000, step = 50): CollapseState =>
  offsets.reduce((s, y, i) => reduceCollapse(s, y, start + i * step), state);

describe('header collapse', () => {
  it('stays open for small scrolls near the top', () => {
    expect(feed(INITIAL_COLLAPSE, [10, 30, 55]).collapsed).toBe(false);
  });

  it('folds when scrolling down past the threshold', () => {
    expect(feed(INITIAL_COLLAPSE, [20, 60, 100]).collapsed).toBe(true);
  });

  it('does not fold from a tiny downward move deep in the grid', () => {
    expect(feed({ collapsed: false, anchor: 300, until: 0 }, [305, 310]).collapsed).toBe(false);
  });

  it('opens again after scrolling back up far enough, not for a small nudge', () => {
    const folded: CollapseState = { collapsed: true, anchor: 400, until: 0 };
    expect(feed(folded, [395, 390]).collapsed).toBe(true);
    expect(feed(folded, [380, 350]).collapsed).toBe(false);
  });

  it('opens at the very top', () => {
    expect(reduceCollapse({ collapsed: true, anchor: 20, until: 0 }, 0, 5000).collapsed).toBe(false);
  });

  it('ignores offsets while the layout settles after a change', () => {
    const folded = feed(INITIAL_COLLAPSE, [20, 60, 100], 1000, 10); // folds at t=1020
    const during = reduceCollapse(folded, 10, 1020 + SETTLE_MS - 1);
    expect(during.collapsed).toBe(true);
  });
});
